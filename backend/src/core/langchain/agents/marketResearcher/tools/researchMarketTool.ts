import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { 
  fetchMarketResearch, 
  getTopTechnologies, 
  getTechDemand 
} from '../../../../../mocks/marketMock.js';
import { logger } from '../../../../utils/logger.js';

/**
 * LangChain Tool: исследование рынка для компании
 * 
 * Использует mock API для получения рыночных трендов и анализа конкурентов
 */
export const researchMarketTool = tool(
  async ({ companyName, industry }) => {
    try {
      logger.info(`[MarketResearcher] Researching market for ${companyName}`);

      const marketData = await fetchMarketResearch(companyName, industry);

      // Топ-10 технологий по спросу
      const topTechs = Object.entries(marketData.demandForTech)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      // Форматируем результат для LLM
      const result = `📊 **Рыночное исследование для "${companyName}"**
${industry ? `🏢 Индустрия: ${industry}` : ''}

📈 **Рыночные тренды:**
${marketData.marketTrends.map((t, i) => `${i + 1}. ${t}`).join('\n')}

🔥 **Топ-10 технологий по спросу:**
${topTechs.map(([tech, demand], i) => `${i + 1}. ${tech}: ${demand}/100`).join('\n')}

🏆 **Анализ конкурентов:**
${marketData.competitorAnalysis}

📊 **Потенциал роста:** ${marketData.growthPotential}/100
${marketData.growthPotential >= 80 ? '✅ Высокий потенциал' : marketData.growthPotential >= 60 ? '⚠️ Средний потенциал' : '❌ Низкий потенциал'}

✅ Исследование завершено`;

      logger.info(`[MarketResearcher] Market research completed for ${companyName}`);
      return result;
    } catch (error) {
      logger.error('[MarketResearcher] Failed to research market:', error);
      return `❌ Ошибка при исследовании рынка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'research_market',
    description: `Проводит рыночное исследование для компании.

Используй этот инструмент когда нужно:
- Узнать текущие рыночные тренды
- Оценить спрос на технологии
- Проанализировать конкурентов
- Определить потенциал роста

Параметры:
- companyName: название компании
- industry: индустрия компании (опционально, например: fintech, edtech, AI)

Возвращает: рыночные тренды, спрос на технологии, анализ конкурентов и потенциал роста.`,
    schema: z.object({
      companyName: z.string().describe('Название компании'),
      industry: z.string().optional().describe('Индустрия компании (fintech, edtech, AI и т.д.)'),
    }),
  }
);

