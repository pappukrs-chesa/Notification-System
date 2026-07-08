import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../composition/container.js';

export const registerHealthRoutes = (app: FastifyInstance, container: Container): void => {
  app.get('/health', async () => ({ status: 'ok', service: 'notification-service' }));

  app.get('/health/ready', async (_request, reply) => {
    const checks: Record<string, string> = {};
    try {
      await container.pool.query('SELECT 1');
      checks.mysql = 'ok';
    } catch (err) {
      checks.mysql = err instanceof Error ? err.message : 'failed';
    }
    checks.channels = container.channels.registeredTypes().join(',');
    const healthy = checks.mysql === 'ok';
    return reply.code(healthy ? 200 : 503).send({ status: healthy ? 'ready' : 'degraded', checks });
  });
};
