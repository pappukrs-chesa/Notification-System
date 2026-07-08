import { NotificationNotFoundError } from '../domain/errors/DomainErrors.js';
import type { AttemptRecord, NotificationRepository } from '../domain/ports/NotificationRepository.js';

export interface NotificationStatusView {
  id: string;
  channel: string;
  templateKey: string;
  status: string;
  attempts: AttemptRecord[];
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GetNotificationStatusUseCase {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(id: string, clientId: string): Promise<NotificationStatusView> {
    const n = await this.repository.findById(id);
    if (!n || n.props.clientId !== clientId) throw new NotificationNotFoundError(id);
    const attempts = await this.repository.listAttempts(id);
    return {
      id: n.props.id,
      channel: n.props.channel,
      templateKey: n.props.templateKey,
      status: n.props.status,
      attempts,
      lastError: n.props.lastError,
      createdAt: n.props.createdAt,
      updatedAt: n.props.updatedAt,
    };
  }
}
