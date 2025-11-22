import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { marketResearcherAgent } from '../../marketResearcherAgent.js';
import { createModuleLogger } from '../../../../utils/logger.js';
import type { MarketResearchOutput } from '../types.js';
import type { DataCollectorResult } from '../../../../types/index.js';

const logger = createModuleLogger('researchMarketTool');

/**
 * ФАЗА 2: Рыночное исследование
 * 
 * Tool для вызова MarketResearcherAgent
 * Исследует рынок, тренды, спрос на технологии
 */
export const researchMarketTool = tool(
  async ({ companyName, collectedDataJson }) => {
    const startTime = Date.now();
    
    try {
      logger.info({ companyName }, '🔍 [PHASE 2.3] Starting market research');

      const collectedData: DataCollectorResult = JSON.parse(collectedDataJson);
      const data = await marketResearcherAgent.research(companyName, collectedData);
      const executionTime = Date.now() - startTime;

      logger.info({ 
        executionTime, 
        growthPotential: data.growthPotential,
        trendsCount: data.marketTrends.length
      }, '✅ [PHASE 2.3] Market research completed');

      const output: MarketResearchOutput = {
        success: true,
        data,
        executionTime,
      };

      // Топ-5 технологий по спросу
      const topTechs = Object.entries(data.demandForTech)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return `✅ **ФАЗА 2.3 ЗАВЕРШЕНА: Рыночное исследование**

📊 Исследование за ${executionTime}ms:

📈 Рыночные тренды (${data.marketTrends.length}):
${data.marketTrends.slice(0, 5).map((t, i) => `  ${i + 1}. ${t}`).join('\n')}

🔥 Топ-5 технологий по спросу:
${topTechs.map(([tech, demand], i) => `  ${i + 1}. ${tech}: ${demand}/100`).join('\n')}

🏆 Конкурентная среда:
${data.competitorAnalysis}

📈 Потенциал роста: ${data.growthPotential}/100
${data.growthPotential >= 80 ? '🚀 Высокий потенциал' : data.growthPotential >= 60 ? '📊 Средний потенциал' : '📉 Низкий потенциал'}

⏭️ ФАЗА 2 ЗАВЕРШЕНА! Переходи к ФАЗЕ 3: generate_report`;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ err: error, executionTime }, '❌ [PHASE 2.3] Market research failed');

      const output: MarketResearchOutput = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };

      return `❌ **ФАЗА 2.3 ПРОВАЛЕНА: Ошибка исследования**

Ошибка: ${output.error}`;
    }
  },
  {
    name: 'research_market',
    description: `[ФАЗА 2.3] Проводит рыночное исследование для компании.

КОГДА ИСПОЛЬЗОВАТЬ:
- После collect_data (ФАЗА 1)
- Параллельно с analyze_data и classify_industry
- Исследует рыночные тренды и спрос

ПАРАМЕТРЫ:
- companyName: название компании
- collectedDataJson: JSON с данными из collect_data

ВОЗВРАЩАЕТ:
- Рыночные тренды (топ трендов IT-рынка)
- Спрос на технологии (рейтинг 0-100 для каждой)
- Анализ конкурентов
- Потенциал роста компании (0-100)

ВАЖНО: Это ПОСЛЕДНИЙ инструмент ФАЗЫ 2! После него переходи к ФАЗЕ 3!`,
    schema: z.object({
      companyName: z.string().describe('Название компании'),
      collectedDataJson: z.string().describe('JSON с собранными данными'),
    }),
  }
);

