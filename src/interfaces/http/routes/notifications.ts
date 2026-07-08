import type { FastifyInstance } from 'fastify';
import { DomainError, NotificationNotFoundError } from '../../../domain/errors/DomainErrors.js';
import type { Container } from '../../../composition/container.js';
import { SendNotificationSchema } from '../schemas.js';
import { buildAuthHook } from '../middleware/auth.js';

export const registerNotificationRoutes = (app: FastifyInstance, container: Container): void => {
  const auth = buildAuthHook(container.apiClients);

  app.post('/api/v1/notifications', { preHandler: auth }, async (request, reply) => {
    const parsed = SendNotificationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const body = parsed.data;
    try {
      const result = await container.sendNotification.execute({
        clientId: request.clientId,
        channel: body.channel,
        recipient: body.to,
        templateKey: body.templateKey,
        data: body.data,
        idempotencyKey: body.idempotencyKey ?? null,
      });
      return reply.code(result.deduplicated ? 200 : 202).send(result);
    } catch (err) {
      if (err instanceof DomainError) {
        return reply.code(422).send({ error: err.message });
      }
      throw err;
    }
  });

  app.get('/api/v1/notifications/:id', { preHandler: auth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const view = await container.getNotificationStatus.execute(id, request.clientId);
      return reply.send(view);
    } catch (err) {
      if (err instanceof NotificationNotFoundError) {
        return reply.code(404).send({ error: err.message });
      }
      throw err;
    }
  });
};
