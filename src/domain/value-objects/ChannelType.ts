export const CHANNEL_TYPES = ['email', 'fcm', 'whatsapp'] as const;

export type ChannelType = (typeof CHANNEL_TYPES)[number];

export const isChannelType = (v: unknown): v is ChannelType =>
  typeof v === 'string' && (CHANNEL_TYPES as readonly string[]).includes(v);
