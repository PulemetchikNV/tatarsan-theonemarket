import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { fetchHabrArticles, searchArticlesByTag } from '../../../mocks/habrMock.js';
import { createModuleLogger } from '../../utils/logger.js';

const logger = createModuleLogger('collectHabrDataTool');

/**
 * LangChain Tool: сбор данных о статьях компании с Habr
 * 
 * Использует mock API для получения статей компании
 */
export const collectHabrDataTool = tool(
  async ({ companyName }) => {
    try {
      logger.info({ companyName }, 'Collecting Habr data');

      const habrData = await fetchHabrArticles(companyName);

      // Форматируем результат для LLM
      const result = `📚 **Данные с Habr для "${companyName}"**

📊 Всего статей: ${habrData.totalArticles}
🏷️ Основные темы: ${habrData.topics.join(', ')}

📝 Последние статьи (${habrData.articles.length}):
${habrData.articles.map((a, i) => `
${i + 1}. **${a.title}**
   📅 ${new Date(a.publishedAt).toLocaleDateString('ru-RU')}
   🏷️ ${a.tags.join(', ')}
   🔗 ${a.url}
`).join('')}

✅ Данные успешно собраны`;

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to collect Habr data');
      return `❌ Ошибка при сборе данных с Habr: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'collect_habr_data',
    description: `Собирает данные о статьях компании с Habr.

Используй этот инструмент когда нужно:
- Узнать о чем пишет компания
- Оценить техническую экспертизу
- Определить основные темы и технологии
- Посмотреть активность в техническом комьюнити

Параметры:
- companyName: название компании для поиска статей

Возвращает: список статей с заголовками, датами, тегами и ссылками.`,
    schema: z.object({
      companyName: z.string().describe('Название компании для поиска статей'),
    }),
  }
);

/**
 * LangChain Tool: поиск статей по тегу
 */
export const searchArticlesByTagTool = tool(
  async ({ tag }) => {
    try {
      logger.info({ tag }, 'Searching articles by tag');

      const articles = await searchArticlesByTag(tag);

      if (articles.length === 0) {
        return `📭 Статей по тегу "${tag}" не найдено`;
      }

      const result = `🔍 **Найдено статей по тегу "${tag}": ${articles.length}**

${articles.map((a, i) => `
${i + 1}. **${a.title}**
   📅 ${new Date(a.publishedAt).toLocaleDateString('ru-RU')}
   🏷️ ${a.tags.join(', ')}
   🔗 ${a.url}
`).join('')}`;

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to search articles');
      return `❌ Ошибка при поиске статей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'search_articles_by_tag',
    description: `Ищет статьи по тегу или теме.

Используй когда нужно:
- Найти статьи на определенную тему (backend, frontend, devops и т.д.)
- Оценить популярность технологии
- Изучить экспертизу в определенной области

Параметры:
- tag: тег или тема для поиска

Возвращает: список статей с этим тегом.`,
    schema: z.object({
      tag: z.string().describe('Тег или тема для поиска статей'),
    }),
  }
);

