import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { 
  fetchMarketResearch, 
  getTopTechnologies, 
  getTechDemand 
} from '../../../mocks/marketMock.js';
import { createModuleLogger } from '../../utils/logger.js';

const logger = createModuleLogger('researchMarketTool');

/**
 * LangChain Tool: исследование рынка для компании
 * 
 * Использует mock API для получения рыночных трендов и анализа конкурентов
 */
export const researchMarketTool = tool(
  async ({ companyName, industry }) => {
    try {
      logger.info({ companyName, industry }, 'Researching market');

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

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to research market');
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

/**
 * LangChain Tool: получение топ технологий по спросу
 */
export const getTopTechnologiesTool = tool(
  async ({ limit }) => {
    try {
      logger.info({ limit }, 'Getting top technologies');

      const topTechs = await getTopTechnologies(limit || 10);

      const result = `🔥 **Топ-${Object.keys(topTechs).length} технологий по спросу:**

${Object.entries(topTechs).map(([tech, demand], i) => 
  `${i + 1}. **${tech}**: ${demand}/100 ${demand >= 90 ? '🔥' : demand >= 80 ? '⭐' : demand >= 70 ? '✨' : '📊'}`
).join('\n')}

✅ Данные актуальны`;

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to get top technologies');
      return `❌ Ошибка при получении топ технологий: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'get_top_technologies',
    description: `Возвращает топ технологий по спросу на рынке.

Используй когда нужно:
- Узнать самые востребованные технологии
- Сравнить популярность языков/фреймворков
- Определить перспективные направления

Параметры:
- limit: количество технологий (по умолчанию 10)

Возвращает: список технологий с рейтингом спроса.`,
    schema: z.object({
      limit: z.number().optional().describe('Количество технологий в топе (по умолчанию 10)'),
    }),
  }
);

/**
 * LangChain Tool: получение спроса на конкретную технологию
 */
export const getTechDemandTool = tool(
  async ({ technology }) => {
    try {
      logger.info({ technology }, 'Getting tech demand');

      const demand = await getTechDemand(technology);

      const emoji = demand >= 90 ? '🔥' : demand >= 80 ? '⭐' : demand >= 70 ? '✨' : demand >= 60 ? '📊' : '📉';
      const level = demand >= 90 ? 'Очень высокий' : demand >= 80 ? 'Высокий' : demand >= 70 ? 'Средний' : demand >= 60 ? 'Умеренный' : 'Низкий';

      const result = `📊 **Спрос на "${technology}":** ${demand}/100 ${emoji}

**Уровень спроса:** ${level}

${demand >= 80 ? '✅ Отличный выбор для изучения!' : demand >= 60 ? '⚠️ Стабильный спрос' : '❌ Спрос ниже среднего'}`;

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to get tech demand');
      return `❌ Ошибка при получении спроса на технологию: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'get_tech_demand',
    description: `Возвращает уровень спроса на конкретную технологию.

Используй когда нужно:
- Узнать насколько востребована технология
- Сравнить спрос между технологиями
- Оценить перспективность изучения

Параметры:
- technology: название технологии

Возвращает: рейтинг спроса от 0 до 100.`,
    schema: z.object({
      technology: z.string().describe('Название технологии (TypeScript, Python, React и т.д.)'),
    }),
  }
);

