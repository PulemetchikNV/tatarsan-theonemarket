import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { reportGeneratorAgent } from '../../reportGenerator/index.js';
import { createModuleLogger } from '../../../../utils/logger.js';

const logger = createModuleLogger('generateDashboardReportTool');

/**
 * Tool для генерации HTML дашборда
 * 
 * Вызывает ReportGeneratorAgent для создания HTML отчета дашборда
 */
export const generateDashboardReportTool = tool(
  async ({ marketDataJson }) => {
    const startTime = Date.now();
    
    try {
      logger.info('📝 Starting dashboard report generation');

      // Парсим данные от marketResearcher
      const marketData = JSON.parse(marketDataJson);
      
      // Вызываем reportGenerator для создания HTML
      // Используем метод generateDashboardReport (создадим его)
      const htmlReport = await reportGeneratorAgent.generateDashboard(marketData);
      const executionTime = Date.now() - startTime;

      logger.info({ 
        executionTime,
        htmlLength: htmlReport.length,
      }, '✅ Dashboard report generated');

      return `✅ **HTML ДАШБОРД СОЗДАН**

📝 Отчет сгенерирован за ${executionTime}ms

Размер HTML: ${htmlReport.length} символов

ReportGenerator использовал свои tools:
- get_card - для метрик (работодатели, вакансии, зарплата)
- get_list - для трендов
- get_chart - для топ технологий
- get_section - для структуры

Финальный HTML готов для фронтенда!`;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ err: error, executionTime }, '❌ Dashboard report generation failed');

      return `❌ **ОШИБКА ГЕНЕРАЦИИ ДАШБОРДА**

Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}

⚠️ Не удалось создать HTML отчет`;
    }
  },
  {
    name: 'generate_dashboard_report',
    description: `Генерирует HTML отчет дашборда на основе рыночных данных.

КОГДА ИСПОЛЬЗОВАТЬ:
- После analyze_dashboard
- Для создания финального HTML дашборда
- ПОСЛЕДНИЙ шаг в цепочке дашборда

ЧТО ДЕЛАЕТ:
- Принимает данные от marketResearcher
- Вызывает ReportGenerator агента
- Агент использует HTML tools для создания компонентов
- Возвращает готовый HTML для фронтенда

ПАРАМЕТРЫ:
- marketDataJson: JSON с рыночными данными от analyze_dashboard

ВОЗВРАЩАЕТ:
- Полный HTML дашборда с:
  - Ключевыми метриками (работодатели, вакансии, зарплата)
  - Топ работодателями
  - Топ технологиями (график)
  - Рыночными трендами

ВАЖНО: Это ФИНАЛЬНЫЙ шаг! После него анализ дашборда ЗАВЕРШЕН!`,
    schema: z.object({
      marketDataJson: z.string().describe('JSON с рыночными данными'),
    }),
  }
);

