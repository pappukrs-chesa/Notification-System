import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MySqlApiClientRepository } from '../../../infrastructure/repositories/MySqlApiClientRepository.js';

declare module 'fastify' {
  interface FastifyRequest {
    clientId: string;
    clientName: string;
  }
}

export const buildAuthHook =
  (clients: MySqlApiClientRepository) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const apiKey = request.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
      await reply.code(401).send({ error: 'Missing X-API-Key header' });
      return;
    }
    const client = await clients.findByApiKey(apiKey);
    if (!client) {
      await reply.code(401).send({ error: 'Invalid API key' });
      return;
    }
    request.clientId = client.id;
    request.clientName = client.name;
  };
