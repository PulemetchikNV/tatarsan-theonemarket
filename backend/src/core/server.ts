import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from './utils/logger.js';
import { registerRoutes } from './api/routes.js';

export async function createServer() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: true,
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  await registerRoutes(fastify);

  return fastify;
}

export async function startServer(port = 3000) {
  try {
    const server = await createServer();
    await server.listen({ port, host: '0.0.0.0' });
    logger.info(`🚀 Server running on http://localhost:${port}`);
    return server;
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}