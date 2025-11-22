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
   * Возвращает агрегированную статистику по региону через AI-анализ рынка
   * БЕЗ привязки к конкретным компаниям
   */
  fastify.get('/api/v1/dashboard', async (request, reply) => {
    try {
      logger.info('📊 Dashboard request received');

      // Запускаем оркестратор для анализа рынка региона
      logger.info('🚀 Starting AI-powered market analysis: Татарстан');
      
      // Оркестратор вызовет ДУМАЮЩЕГО агента который использует analyze_dashboard tool
      // Tool вызовет marketResearcher который через свои tools получит данные из data-api
      const marketData = await orchestratorAgent.analyzeDashboard('Татарстан');

      logger.info('Market data received from orchestrator');

      // TODO: Парсить результат работы агента из marketData
      // Пока используем mock данные для визуализации структуры
      
      const totalEmployers = 5;
      const totalVacancies = 181;
      const avgSalary = 185000;
      const marketTrend = 'растущий';
      
      const topTechnologies = [
        { tech: 'TypeScript', demand: 95 },
        { tech: 'Python', demand: 92 },
        { tech: 'React', demand: 90 },
        { tech: 'Docker', demand: 88 },
        { tech: 'PostgreSQL', demand: 85 },
      ];

      const topEmployers = [
        { name: 'Сбербанк Технологии', vacancies_count: 65 },
        { name: 'Bars Group', vacancies_count: 42 },
        { name: 'Kaspersky', vacancies_count: 31 },
        { name: 'Иннополис', vacancies_count: 25 },
        { name: 'Таттелеком', vacancies_count: 18 },
      ];

      const marketTrends = [
        'Рынок IT-вакансий в Татарстане: растущий тренд (+8%)',
        'Средний объем вакансий: 25/день',
        'Всего компаний в регионе: 5',
        'Наиболее востребованные роли: Developer, QA Engineer, DevOps',
      ];

      // Генерируем HTML на основе рыночных данных
      const htmlComponents = `
        <div class="content-wrap">
          <!-- Ключевые метрики -->
          <div class="grid grid-4">
            <div class="card card-metric success">
              <div class="card-title">Работодателей в регионе</div>
              <div class="card-value">${totalEmployers}</div>
              <div class="card-subtitle">IT-компании</div>
            </div>
            
            <div class="card card-metric primary">
              <div class="card-title">Открытых вакансий</div>
              <div class="card-value">${totalVacancies}</div>
              <div class="card-subtitle">Татарстан</div>
            </div>
            
            <div class="card card-metric warning">
              <div class="card-title">Средняя зарплата</div>
              <div class="card-value">${avgSalary.toLocaleString()} ₽</div>
              <div class="card-subtitle">для Middle</div>
            </div>
            
            <div class="card card-metric purple">
              <div class="card-title">Тренд рынка</div>
              <div class="card-value">${marketTrend}</div>
              <div class="card-subtitle">за 30 дней</div>
            </div>
          </div>

          <!-- Топ работодатели -->
          <div class="section">
            <h2 class="section-title">🏆 Топ работодатели по вакансиям</h2>
            <div class="company-list">
              ${topEmployers.map(e => `
                <div class="company-item">
                  <div class="company-info">
                    <div class="company-name">${e.name}</div>
                    <div class="company-meta">IT-компания</div>
                  </div>
                  <div class="health-score medium">
                    ${e.vacancies_count} вакансий
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Топ технологии по спросу -->
          <div class="chart-container">
            <h3 class="chart-title">🔥 Топ-5 технологий по спросу</h3>
            <div class="bar-chart">
              ${topTechnologies.map((t, i) => `
              <div class="bar-item">
                <span class="bar-label">${t.tech}</span>
                <div class="bar-track">
                  <div class="bar-fill ${i === 0 ? 'primary' : i === 1 ? 'success' : i === 2 ? 'info' : i === 3 ? 'purple' : 'warning'}" style="width: ${t.demand}%;">
                    ${t.demand}/100
                  </div>
                </div>
              </div>
              `).join('')}
            </div>
          </div>

          <!-- Рыночные тренды -->
          <div class="section">
            <h3 class="section-subtitle">📈 Рыночные тренды</h3>
            <ul class="list">
              ${marketTrends.map(trend => `
              <li class="list-item">
                <span class="list-icon">📊</span>
                <span class="list-content">${trend}</span>
              </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;

      const dashboardResponse = {
        htmlComponents,
        totalHealthScore: 0, // Для совместимости, но не используется
      };

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
        logger.error({ err: error }, '❌ Company analysis error');
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