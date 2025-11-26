import { z } from 'zod';
import { tool } from 'langchain';
import { dataCollectorAgent } from '../../dataCollector/index.js';
import { createModuleLogger } from '../../../../utils/logger.js';

const logger = createModuleLogger('collectDataTool');

/**
 * Tool-обертка над DataCollectorAgent.
 * Соответствует паттерну "Sub-agent as a Tool".
 * 
 * Оркестратор использует этот тул, чтобы делегировать задачу сбора данных
 * специализированному агенту.
 */
export const collectDataTool = tool(
  async ({ request }: { request: string }) => {
    logger.info({ request }, '🔄 Delegating to DataCollectorAgent');
    
    try {
      // Вызываем субагента, передавая ему запрос на естественном языке
      // DataCollector сам решит, какие свои внутренние тулы (getRegionStats и т.д.) использовать
      const result = await dataCollectorAgent.collect(request);

      logger.info('✅ DataCollectorAgent finished');
      
      // Возвращаем результат как строку (JSON), чтобы Оркестратор мог его прочитать
      // DataCollectorAgent уже возвращает JSON-объект или структуру с ошибкой
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      logger.error({ err: error }, '❌ DataCollectorAgent failed');
      return JSON.stringify({ error: "Failed to collect data", details: String(error) });
    }
  },
  {
    name: "collect_market_data", // Имя инструмента, понятное Оркестратору
    description: "Useful for gathering any market data, statistics, or regional info. Give it a natural language request like 'Get stats for Tatarstan'.",
    schema: z.object({
      request: z.string().describe("Natural language description of what data to collect"),
    }),
  }
);
