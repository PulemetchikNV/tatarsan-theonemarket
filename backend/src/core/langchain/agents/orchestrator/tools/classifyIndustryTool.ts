import { z } from 'zod';
import { tool } from 'langchain';
import { industryClassifierAgent } from '../../industryClassifier/index.js';
import { createModuleLogger } from '../../../../utils/logger.js';

const logger = createModuleLogger('classifyIndustryTool');

/**
 * ФАЗА 3: Классификация и оценка здоровья (Health Score)
 * 
 * Tool-обертка над IndustryClassifierAgent.
 * Вычисляет интегральный IT-индекс региона.
 * 
 * Оркестратор использует этот тул, чтобы получить финальную оценку (Health Score)
 * на основе данных, собранных на предыдущих этапах.
 */
export const classifyIndustryTool = tool(
  async ({ market_data }: { market_data: string }) => {
    logger.info('🔍 Delegating to IndustryClassifierAgent');
    
    try {
      // Передаем данные субагенту
      // Он распарсит их (выделит вакансии, зп, грейды) и применит математическую формулу
      const result = await industryClassifierAgent.classify(market_data);

      logger.info('✅ IndustryClassifierAgent finished');
      
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      logger.error({ err: error }, '❌ IndustryClassifierAgent failed');
      return JSON.stringify({ error: "Failed to classify industry", details: String(error) });
    }
  },
  {
    name: "classify_industry", // Имя для оркестратора
    description: "Returns industry classification for the region based on raw api data. Calculates the integral IT Health Score (0-100) for the region based on market research data. Use this AFTER getting market research results.",
    schema: z.object({
      market_data: z.string().describe("JSON string or summary of market research (vacancies, salaries, etc.) and websites (hh, github) obtained from research_market and collect_data tool"),
    }),
  }
);
