import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from './utils/logger.js';
import { orchestratorAgent } from './langchain/agents/index.js';
import { reportGeneratorAgent } from './langchain/agents/reportGenerator/index.js';

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
   * Возвращает агрегированную статистику по региону
   */
  fastify.get('/api/v1/dashboard', async (request, reply) => {
    try {
      logger.info('📊 Dashboard request received');

      // TODO: В будущем - запустить оркестратор для множества компаний
      // Пока возвращаем заглушку
      const dashboardResponse = {
        htmlComponents: `
          <div class="content-wrap">
            <div class="section">
              <h2 class="section-title">🏗️ Dashboard в разработке</h2>
              <div class="section-content">
                <p>Dashboard будет агрегировать данные по всем компаниям региона.</p>
                <p>Используйте роут <code>/api/v1/company/:companyName</code> для анализа конкретной компании.</p>
              </div>
            </div>
          </div>
        `,
        totalHealthScore: 0,
      };

      logger.info('✅ Dashboard response sent');
      return dashboardResponse;
    } catch (error) {
      logger.error('❌ Dashboard error:', error);
      reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/v1/company/:companyName
   * Анализирует компанию через оркестратор и возвращает HTML отчет
   */
  fastify.get<{ Params: { companyName: string } }>(
    '/api/v1/company/:companyName',
    async (request, reply) => {
      try {
        const { companyName } = request.params;
        logger.info(`🔍 Company analysis request: ${companyName}`);

        // Запускаем оркестратор
        logger.info(`🚀 Starting orchestrator for: ${companyName}`);
        const analysisResult = await orchestratorAgent.analyzeCompany(companyName);

        // Генерируем HTML отчет
        logger.info(`📝 Generating HTML report for: ${companyName}`);
        const htmlReport = await reportGeneratorAgent.generateReport(analysisResult);

        // Формируем ответ для фронтенда
        const companyResponse = {
          name: analysisResult.company.name,
          industry: analysisResult.industryClassifier.primaryIndustry,
          htmlComponents: htmlReport,
        };

        logger.info(`✅ Company analysis complete: ${companyName}`);
        return companyResponse;
      } catch (error) {
        logger.error(`❌ Company analysis error:`, error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

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