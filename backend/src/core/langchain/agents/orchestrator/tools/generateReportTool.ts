import { z } from 'zod';
import { tool } from 'langchain';
import { reportGeneratorAgent } from '../../reportGenerator/index.js';
import { createModuleLogger } from '../../../../utils/index.js';
import type { ReportGenerationOutput } from '../types.js';

const logger = createModuleLogger('generateReportTool');

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
      
      // if (!reportData) {
      //   throw new Error('Report data is undefined after all retries');
      // }
      
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
    description: `Генерирует итоговый HTML отчет для фронтенда.

КОГДА ИСПОЛЬЗОВАТЬ:
- Создает структурированный отчет для отображения
- ЭТО ФИНАЛЬНЫЙ ШАГ анализа!

ВОЗВРАЩАЕТ:
- Готовый HTML отчет для фронтенда

ВАЖНО: Это ПОСЛЕДНИЙ инструмент! После него анализ завершен, возвращай финальный ответ!`,
    schema: z.object({
      analysisResultJson: z.string().describe('Данные по региону отражающие it-здоровье. Результат работы предыдущих агентов'),
    }),
  }
);

