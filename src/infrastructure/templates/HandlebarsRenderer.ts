import Handlebars from 'handlebars';
import { TemplateNotFoundError } from '../../domain/errors/DomainErrors.js';
import type { RenderedMessage } from '../../domain/ports/NotificationChannel.js';
import type { TemplateRenderer } from '../../domain/ports/TemplateRenderer.js';
import type { TemplateRepository } from '../../domain/ports/TemplateRepository.js';
import type { ChannelType } from '../../domain/value-objects/ChannelType.js';
import type { Recipient } from '../../domain/value-objects/Recipient.js';

export class HandlebarsRenderer implements TemplateRenderer {
  private compiled = new Map<string, { subject: Handlebars.TemplateDelegate; body: Handlebars.TemplateDelegate }>();

  constructor(private readonly templates: TemplateRepository) {}

  async render(
    templateKey: string,
    channel: ChannelType,
    recipient: Recipient,
    data: Record<string, unknown>
  ): Promise<RenderedMessage> {
    const template = await this.templates.find(templateKey, channel);
    if (!template) throw new TemplateNotFoundError(templateKey, channel);

    const cacheKey = `${templateKey}:${channel}:${template.subject.length}:${template.body.length}`;
    let fns = this.compiled.get(cacheKey);
    if (!fns) {
      fns = {
        subject: Handlebars.compile(template.subject, { noEscape: false }),
        body: Handlebars.compile(template.body, { noEscape: false }),
      };
      this.compiled.set(cacheKey, fns);
    }

    const context = { ...data, recipient };
    const stringData: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v != null && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
        stringData[k] = String(v);
      }
    }

    return {
      recipient,
      subject: fns.subject(context).trim(),
      body: fns.body(context),
      data: stringData,
    };
  }
}
