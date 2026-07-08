import { z } from 'zod';

export const SendNotificationSchema = z.object({
  channel: z.enum(['email', 'fcm', 'whatsapp']),
  to: z.union([
    z.object({ email: z.string().email(), name: z.string().optional() }),
    z.object({ tokens: z.array(z.string().min(10)).min(1).max(500) }),
    z.object({ phone: z.string().min(10) }),
  ]),
  templateKey: z.string().min(1).max(120),
  data: z.record(z.unknown()).optional(),
  idempotencyKey: z.string().min(8).max(120).optional(),
});

export type SendNotificationBody = z.infer<typeof SendNotificationSchema>;
