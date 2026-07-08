import { describe, expect, it } from 'vitest';
import { ChannelRegistry } from '../../src/infrastructure/channels/ChannelRegistry.js';
import { UnknownChannelError } from '../../src/domain/errors/DomainErrors.js';
import type { DeliveryResult, NotificationChannel, RenderedMessage } from '../../src/domain/ports/NotificationChannel.js';

const fakeChannel = (type: 'email' | 'fcm' | 'whatsapp'): NotificationChannel => ({
  type,
  async send(_message: RenderedMessage): Promise<DeliveryResult> {
    return { providerMessageId: `${type}-1` };
  },
});

describe('ChannelRegistry', () => {
  it('resolves a registered channel', () => {
    const registry = new ChannelRegistry().register(fakeChannel('email'));
    expect(registry.resolve('email').type).toBe('email');
  });

  it('throws UnknownChannelError for unregistered channels — whatsapp is future work', () => {
    const registry = new ChannelRegistry().register(fakeChannel('email'));
    expect(() => registry.resolve('whatsapp')).toThrow(UnknownChannelError);
  });

  it('supports open/closed extension — registering whatsapp requires no other change', () => {
    const registry = new ChannelRegistry()
      .register(fakeChannel('email'))
      .register(fakeChannel('fcm'))
      .register(fakeChannel('whatsapp'));
    expect(registry.registeredTypes().sort()).toEqual(['email', 'fcm', 'whatsapp']);
  });
});
