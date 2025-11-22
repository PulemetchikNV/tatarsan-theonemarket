import { FastifyInstance } from 'fastify';
import { analyzeCompanyHandler, getDashboardHandler } from './handlers.js';

export async function registerRoutes(fastify: FastifyInstance) {
  // API v1
  fastify.register(
    async (api) => {
      // Main endpoints
      api.post('/analyze', analyzeCompanyHandler);
      api.get('/dashboard', getDashboardHandler);
    },
    { prefix: '/api/v1' }
  );
}


