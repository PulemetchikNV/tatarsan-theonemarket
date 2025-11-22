import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { reportGeneratorAgent } from '../../reportGenerator/index.js';
import { createModuleLogger } from '../../../../utils/index.js';
import type { ReportGenerationOutput } from '../types.js';

const logger = createModuleLogger('generateReportTool');

/**
 * ФАЗА 3: Генерация отчета
 * 
 * Tool для вызова ReportGeneratorAgent
 * Генерирует итоговый отчет для фронтенда
 */
export const generateReportTool = tool(
  async ({ analysisResultJson, format }: { analysisResultJson: string; format: string }): Promise<ReportGenerationOutput> => {
    const startTime = Date.now();
    
    try {
      logger.info({ format }, '🔍 [PHASE 3] Starting report generation');

      // Логируем что приходит (первые 300 символов)
      logger.info({ 
        jsonPreview: analysisResultJson.substring(0, 300),
        length: analysisResultJson.length 
      }, 'Received analysisResultJson - passing as-is to reportGenerator');
      
      // Передаем строку как есть - без валидации и парсинга!
      let reportData: string | undefined;
      let lastError: Error | null = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          logger.info({ attempt, maxRetries }, 'Attempting report generation');
          // Передаем RAW строку - пусть reportGenerator сам разбирается
          reportData = await reportGeneratorAgent.generateReport(analysisResultJson);
          logger.info({ attempt }, 'Report generated successfully');
          break;
        } catch (err) {
          lastError = err as Error;
          logger.warn({ 
            attempt, 
            maxRetries, 
            error: lastError.message,
            stack: lastError.stack
          }, 'Report generation attempt failed');
          
          if (attempt === maxRetries) {
            throw new Error(`Failed to generate report after ${maxRetries} attempts: ${lastError.message}`);
          }
          
          // Небольшая задержка перед retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      
      if (!reportData) {
        throw new Error('Report data is undefined after all retries');
      }
      
      const executionTime = Date.now() - startTime;

      logger.info({ executionTime, format }, '✅ [PHASE 3] Report generation completed');

      return {
        success: true,
        reportData,
        format,
        executionTime,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ err: error, executionTime }, '❌ [PHASE 3] Report generation failed');

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        format,
        executionTime,
      };
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
- analysisResultJson: ТОЛЬКО чистый JSON строкой (без текста до/после)
- format: формат отчета ('json' или 'html')

ВОЗВРАЩАЕТ:
- Готовый отчет для фронтенда
- Health Score компании
- Рекомендацию (invest/watch/avoid)
- Обоснование решения

⚠️ КРИТИЧНО: analysisResultJson должен быть ТОЛЬКО валидный JSON без дополнительного текста!
ВАЖНО: Это ПОСЛЕДНИЙ инструмент! После него анализ завершен!`,
    schema: z.object({
      analysisResultJson: z.string().describe('Чистый валидный JSON (без markdown, без текста до/после). Пример: {"collect_data":{...},"classify_industry":{...}}'),
      format: z.enum(['json', 'html']).describe('Формат отчета (json или html)'),
    }),
  }
);

