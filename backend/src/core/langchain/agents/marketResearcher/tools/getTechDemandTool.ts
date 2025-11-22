import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getTechDemand } from '../../../../../mocks/marketMock.js';
import { logger } from '../../../../utils/logger.js';

/**
 * LangChain Tool: получение спроса на конкретную технологию
 */
export const getTechDemandTool = tool(
  async ({ technology }) => {
    try {
      logger.info(`[MarketResearcher] Getting demand for ${technology}`);

      const demand = await getTechDemand(technology);

      const emoji = demand >= 90 ? '🔥' : demand >= 80 ? '⭐' : demand >= 70 ? '✨' : demand >= 60 ? '📊' : '📉';
      const level = demand >= 90 ? 'Очень высокий' : demand >= 80 ? 'Высокий' : demand >= 70 ? 'Средний' : demand >= 60 ? 'Умеренный' : 'Низкий';

      const result = `📊 **Спрос на "${technology}":** ${demand}/100 ${emoji}

**Уровень спроса:** ${level}

${demand >= 80 ? '✅ Отличный выбор для изучения!' : demand >= 60 ? '⚠️ Стабильный спрос' : '❌ Спрос ниже среднего'}`;

      logger.info(`[MarketResearcher] Demand for ${technology}: ${demand}/100`);
      return result;
    } catch (error) {
      logger.error('[MarketResearcher] Failed to get tech demand:', error);
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

