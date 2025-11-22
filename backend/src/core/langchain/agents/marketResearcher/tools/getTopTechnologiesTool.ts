import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getTopTechnologies } from '../../../../../mocks/marketMock.js';
import { logger } from '../../../../utils/logger.js';

/**
 * LangChain Tool: получение топ технологий по спросу
 */
export const getTopTechnologiesTool = tool(
  async ({ limit }) => {
    try {
      logger.info(`[MarketResearcher] Getting top ${limit || 10} technologies`);

      const topTechs = await getTopTechnologies(limit || 10);

      const result = `🔥 **Топ-${Object.keys(topTechs).length} технологий по спросу:**

${Object.entries(topTechs).map(([tech, demand], i) => 
  `${i + 1}. **${tech}**: ${demand}/100 ${demand >= 90 ? '🔥' : demand >= 80 ? '⭐' : demand >= 70 ? '✨' : '📊'}`
).join('\n')}

✅ Данные актуальны`;

      logger.info(`[MarketResearcher] Top technologies fetched`);
      return result;
    } catch (error) {
      logger.error('[MarketResearcher] Failed to get top technologies:', error);
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

