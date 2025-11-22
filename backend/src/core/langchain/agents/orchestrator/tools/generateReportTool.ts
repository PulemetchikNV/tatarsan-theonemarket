import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { reportGeneratorAgent } from '../../reportGeneratorAgent.js';
import { createModuleLogger } from '../../../../utils/logger.js';
import type { ReportGenerationOutput } from '../types.js';
import type { CompanyAnalysisResult } from '../../../../types/index.js';

const logger = createModuleLogger('generateReportTool');

/**
 * ФАЗА 3: Генерация отчета
 * 
 * Tool для вызова ReportGeneratorAgent
 * Генерирует итоговый отчет для фронтенда
 */
export const generateReportTool = tool(
  async ({ analysisResultJson, format }) => {
    const startTime = Date.now();
    
    try {
      logger.info({ format }, '🔍 [PHASE 3] Starting report generation');

      const analysisResult: CompanyAnalysisResult = JSON.parse(analysisResultJson);
      const reportData = await reportGeneratorAgent.generateReport(analysisResult);
      const executionTime = Date.now() - startTime;

      logger.info({ executionTime, format }, '✅ [PHASE 3] Report generation completed');

      const output: ReportGenerationOutput = {
        success: true,
        reportData: JSON.stringify(reportData),
        format: format as 'json' | 'html',
        executionTime,
      };

      return `✅ **ФАЗА 3 ЗАВЕРШЕНА: Отчет сгенерирован**

📄 Отчет создан за ${executionTime}ms
📊 Формат: ${format}
📦 Размер: ${JSON.stringify(reportData).length} байт

🎉 АНАЛИЗ ЗАВЕРШЕН!

Итоговые метрики:
- Health Score: ${analysisResult.healthScore}/100
- Рекомендация: ${analysisResult.recommendation === 'invest' ? '✅ ИНВЕСТИРОВАТЬ' : analysisResult.recommendation === 'watch' ? '👀 НАБЛЮДАТЬ' : '❌ ИЗБЕГАТЬ'}
- Обоснование: ${analysisResult.reasoning}

📤 Отчет готов к отправке на фронтенд!`;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ err: error, executionTime }, '❌ [PHASE 3] Report generation failed');

      const output: ReportGenerationOutput = {
        success: false,
        format: format as 'json' | 'html',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };

      return `❌ **ФАЗА 3 ПРОВАЛЕНА: Ошибка генерации отчета**

Ошибка: ${output.error}`;
    }
  },
  {
    name: 'generate_report',
    description: `[ФАЗА 3] Генерирует итоговый отчет для фронтенда.

КОГДА ИСПОЛЬЗОВАТЬ:
- ТОЛЬКО после завершения ФАЗЫ 2 (analyze_data, classify_industry, research_market)
- Создает структурированный отчет для отображения
- ЭТО ФИНАЛЬНЫЙ ШАГ анализа!

ПАРАМЕТРЫ:
- analysisResultJson: полный результат анализа (JSON)
- format: формат отчета ('json' или 'html')

ВОЗВРАЩАЕТ:
- Готовый отчет для фронтенда
- Health Score компании
- Рекомендацию (invest/watch/avoid)
- Обоснование решения

ВАЖНО: Это ПОСЛЕДНИЙ инструмент! После него анализ завершен!`,
    schema: z.object({
      analysisResultJson: z.string().describe('JSON с полным результатом анализа'),
      format: z.enum(['json', 'html']).describe('Формат отчета (json или html)'),
    }),
  }
);

