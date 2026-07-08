import type { ChannelType } from '../value-objects/ChannelType.js';

export interface NotificationTemplate {
  templateKey: string;
  channel: ChannelType;
  subject: string;
  body: string;
}

export interface TemplateRepository {
  find(templateKey: string, channel: ChannelType): Promise<NotificationTemplate | null>;
}
