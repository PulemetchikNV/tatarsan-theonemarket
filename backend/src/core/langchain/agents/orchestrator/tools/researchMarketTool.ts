import { z } from 'zod';
import { tool } from 'langchain';
import { marketResearcherAgent } from '../../marketResearcher/index.js';
import { createModuleLogger } from '../../../../utils/logger.js';

const logger = createModuleLogger('researchMarketTool');

/**
 * ФАЗА 2: Рыночное исследование
 * 
 * Tool-обертка над MarketResearcherAgent.
 * Соответствует паттерну "Sub-agent as a Tool".
 * 
 * Оркестратор использует этот тул, чтобы делегировать задачу глубокого анализа рынка
 * специализированному агенту.
 */
export const researchMarketTool = tool(
  async ({ request }: { request: string }) => {
    logger.info({ request }, '🔍 Delegating to MarketResearcherAgent');
    
    try {
      // Вызываем субагента, передавая ему запрос на естественном языке
      // MarketResearcher сам решит использовать get_market_metrics и другие свои тулы
      const result = await marketResearcherAgent.research(request);

      logger.info('✅ MarketResearcherAgent finished');
      
      // Возвращаем результат как строку (JSON), чтобы Оркестратор мог его прочитать
      // MarketResearcher уже возвращает JSON-объект с аналитикой
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      logger.error({ err: error }, '❌ MarketResearcherAgent failed');
      return JSON.stringify({ error: "Failed to research market", details: String(error) });
    }
  },
  {
    name: "research_market", // Имя инструмента, понятное Оркестратору
    description: "Useful for analyzing market trends, salaries, competition, and growth potential. Give it a natural language request like 'Analyze IT market trends in Tatarstan'.",
    schema: z.object({
      request: z.string().describe("Natural language description of what market aspect to analyze"),
    }),
  }
);
