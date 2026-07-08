import { describe, expect, it } from 'vitest';
import { SendNotificationUseCase } from '../../src/application/SendNotificationUseCase.js';
import { Notification } from '../../src/domain/entities/Notification.js';
import type { AttemptRecord, NotificationRepository } from '../../src/domain/ports/NotificationRepository.js';
import type { QueueJob, QueuePort } from '../../src/domain/ports/QueuePort.js';
import type { NotificationStatus } from '../../src/domain/value-objects/NotificationStatus.js';

class FakeRepo implements NotificationRepository {
  saved: Notification[] = [];
  byIdemKey = new Map<string, Notification>();
  callOrder: string[] = [];

  async save(n: Notification): Promise<void> {
    this.callOrder.push('save');
    this.saved.push(n);
    if (n.props.idempotencyKey) this.byIdemKey.set(`${n.props.clientId}:${n.props.idempotencyKey}`, n);
  }
  async findById(): Promise<Notification | null> {
    return null;
  }
  async findByIdempotencyKey(clientId: string, key: string): Promise<Notification | null> {
    return this.byIdemKey.get(`${clientId}:${key}`) ?? null;
  }
  async updateStatus(_id: string, _status: NotificationStatus): Promise<void> {}
  async recordAttempt(_id: string, _attempt: AttemptRecord): Promise<void> {}
  async listAttempts(): Promise<AttemptRecord[]> {
    return [];
  }
}

class FakeQueue implements QueuePort {
  jobs: QueueJob[] = [];
  constructor(private readonly order: string[]) {}
  async enqueue(job: QueueJob): Promise<void> {
    this.order.push('enqueue');
    this.jobs.push(job);
  }
}

const input = {
  clientId: 'client-1',
  channel: 'email' as const,
  recipient: { email: 'doc@example.com' },
  templateKey: 'welcome',
  idempotencyKey: 'order-123-confirmed',
};

describe('SendNotificationUseCase', () => {
  it('persists before enqueueing (no lost notifications)', async () => {
    const repo = new FakeRepo();
    const queue = new FakeQueue(repo.callOrder);
    const useCase = new SendNotificationUseCase(repo, queue);

    const result = await useCase.execute(input);

    expect(repo.callOrder).toEqual(['save', 'enqueue']);
    expect(repo.saved).toHaveLength(1);
    expect(queue.jobs[0]?.notificationId).toBe(result.id);
    expect(result.deduplicated).toBe(false);
  });

  it('deduplicates by idempotency key — second call enqueues nothing', async () => {
    const repo = new FakeRepo();
    const queue = new FakeQueue(repo.callOrder);
    const useCase = new SendNotificationUseCase(repo, queue);

    const first = await useCase.execute(input);
    const second = await useCase.execute(input);

    expect(second.id).toBe(first.id);
    expect(second.deduplicated).toBe(true);
    expect(repo.saved).toHaveLength(1);
    expect(queue.jobs).toHaveLength(1);
  });

  it('treats same key from different clients as different notifications', async () => {
    const repo = new FakeRepo();
    const queue = new FakeQueue(repo.callOrder);
    const useCase = new SendNotificationUseCase(repo, queue);

    const a = await useCase.execute(input);
    const b = await useCase.execute({ ...input, clientId: 'client-2' });

    expect(a.id).not.toBe(b.id);
    expect(repo.saved).toHaveLength(2);
  });
});
