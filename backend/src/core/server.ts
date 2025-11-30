import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from './utils/logger.js';
import { orchestratorAgent } from './langchain/agents/index.js';
import { reportGeneratorAgent } from './langchain/agents/reportGenerator/index.js';
import { ROLES, UserRole } from './const.js';
import { startDashboardAnalysis } from './langgraph/index.js';

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

  // ========== API Routes ==========

  /**
   * GET /api/v1/dashboard
   * Возвращает агрегированную статистику по региону через AI-анализ рынка
   * БЕЗ привязки к конкретным компаниям
   */
  fastify.get('/api/v1/dashboard', async (request, reply) => {
    try {
      logger.info('📊 Dashboard request received');

      // Запускаем оркестратор для анализа рынка региона
      const { role, query } = request.query as Record<string, string>;
      logger.info(`🚀 Starting AI-powered market analysis: Татарстан, role: ${role}, query: ${query}`);
      
      // Оркестратор вызовет ДУМАЮЩЕГО агента который:
      // 1. Использует analyze_dashboard tool → получит рыночные данные
      // 2. Использует generate_dashboard_report tool → создаст HTML
      // 3. Вернет структурированный JSON с htmlComponents и totalHealthScore
      const dashboardResponse = await orchestratorAgent.analyzeDashboard({
        region: 'Татарстан',
        role: role as keyof typeof ROLES,
        query
      });

      logger.info({
        htmlLength: dashboardResponse.htmlComponents.length,
        healthScore: dashboardResponse.totalHealthScore,
      }, 'Dashboard received from orchestrator');

      logger.info('✅ Dashboard response sent (market analysis via AI)');
      return dashboardResponse;
    } catch (error) {
      logger.error({ err: error }, '❌ Dashboard error');
      reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  fastify.get('/api/v1/dashboard/langgraph', async (request, reply) => {
    try {
      const { role, query, region } = request.query as Record<string, string>;
      const result = await startDashboardAnalysis({
        role: role as UserRole,
        query: query || undefined,
        region: region || 'Татарстан',
      });

      return {
        htmlComponents: result.report,
        healthScore: result.healthScore,
      };
    } catch (error) {
      logger.error({ err: error }, '❌ Dashboard error');
      reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

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