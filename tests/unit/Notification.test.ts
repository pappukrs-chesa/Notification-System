import { describe, expect, it } from 'vitest';
import { Notification } from '../../src/domain/entities/Notification.js';
import { InvalidNotificationError } from '../../src/domain/errors/DomainErrors.js';

describe('Notification entity', () => {
  it('creates a PENDING email notification with defaults', () => {
    const n = Notification.create({
      clientId: 'c1',
      channel: 'email',
      recipient: { email: 'doc@example.com' },
      templateKey: 'welcome',
    });
    expect(n.props.status).toBe('PENDING');
    expect(n.props.attempts).toBe(0);
    expect(n.props.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(n.props.data).toEqual({});
  });

  it('rejects an email notification without a valid email', () => {
    expect(() =>
      Notification.create({
        clientId: 'c1',
        channel: 'email',
        recipient: { email: 'not-an-email' },
        templateKey: 'welcome',
      })
    ).toThrow(InvalidNotificationError);
  });

  it('rejects an fcm notification without tokens', () => {
    expect(() =>
      Notification.create({
        clientId: 'c1',
        channel: 'fcm',
        recipient: { tokens: [] },
        templateKey: 'welcome',
      })
    ).toThrow(InvalidNotificationError);
  });

  it('rejects a whatsapp notification with a short phone', () => {
    expect(() =>
      Notification.create({
        clientId: 'c1',
        channel: 'whatsapp',
        recipient: { phone: '123' },
        templateKey: 'welcome',
      })
    ).toThrow(InvalidNotificationError);
  });

  it('rejects a missing templateKey', () => {
    expect(() =>
      Notification.create({
        clientId: 'c1',
        channel: 'email',
        recipient: { email: 'doc@example.com' },
        templateKey: '  ',
      })
    ).toThrow(InvalidNotificationError);
  });
});
