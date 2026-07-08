export const NOTIFICATION_STATUSES = ['PENDING', 'PROCESSING', 'SENT', 'FAILED', 'DEAD'] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];
