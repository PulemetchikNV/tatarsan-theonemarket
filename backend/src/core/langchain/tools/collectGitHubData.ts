import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { fetchGitHubRepos, searchReposByLanguage } from '../../../mocks/githubMock.js';
import { createModuleLogger } from '../../utils/logger.js';

const logger = createModuleLogger('collectGitHubDataTool');

/**
 * LangChain Tool: сбор данных о репозиториях с GitHub
 * 
 * Использует mock API для получения репозиториев компании
 */
export const collectGitHubDataTool = tool(
  async ({ companyName }) => {
    try {
      logger.info({ companyName }, 'Collecting GitHub data');

      const githubData = await fetchGitHubRepos(companyName);

      // Форматируем результат для LLM
      const result = `🐙 **Данные с GitHub для "${companyName}"**

📊 Статистика:
- Репозиториев: ${githubData.totalRepos}
- Всего коммитов: ${githubData.totalCommits.toLocaleString('ru-RU')}
- Активность (последние 30 дней): ${githubData.activity} коммитов

💻 Используемые языки: ${githubData.languages.join(', ')}

📦 Топ репозитории (${githubData.repositories.length}):
${githubData.repositories.map((r, i) => `
${i + 1}. **${r.name}**
   ⭐ ${r.stars} звезд | 🍴 ${r.forks} форков
   💾 ${r.language || 'N/A'}
   📅 Последний коммит: ${new Date(r.lastCommit || '').toLocaleDateString('ru-RU')}
`).join('')}

✅ Данные успешно собраны`;

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to collect GitHub data');
      return `❌ Ошибка при сборе данных с GitHub: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'collect_github_data',
    description: `Собирает данные о репозиториях компании с GitHub.

Используй этот инструмент когда нужно:
- Узнать какие технологии использует компания
- Оценить активность разработки
- Посмотреть популярные проекты компании
- Определить основные языки программирования

Параметры:
- companyName: название компании для поиска репозиториев

Возвращает: список репозиториев с звездами, форками, языками и статистикой активности.`,
    schema: z.object({
      companyName: z.string().describe('Название компании для поиска репозиториев'),
    }),
  }
);

/**
 * LangChain Tool: поиск репозиториев по языку программирования
 */
export const searchReposByLanguageTool = tool(
  async ({ language }) => {
    try {
      logger.info({ language }, 'Searching repos by language');

      const repos = await searchReposByLanguage(language);

      if (repos.length === 0) {
        return `📭 Репозиториев на языке "${language}" не найдено`;
      }

      const result = `🔍 **Найдено репозиториев на "${language}": ${repos.length}**

${repos.map((r, i) => `
${i + 1}. **${r.name}**
   ⭐ ${r.stars} звезд | 🍴 ${r.forks} форков
   📅 Последний коммит: ${new Date(r.lastCommit || '').toLocaleDateString('ru-RU')}
`).join('')}`;

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to search repos');
      return `❌ Ошибка при поиске репозиториев: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'search_repos_by_language',
    description: `Ищет репозитории по языку программирования.

Используй когда нужно:
- Найти проекты на определенном языке (Python, TypeScript, Java и т.д.)
- Оценить использование языка в регионе
- Сравнить популярность технологий

Параметры:
- language: название языка программирования

Возвращает: список репозиториев на этом языке.`,
    schema: z.object({
      language: z.string().describe('Название языка программирования'),
    }),
  }
);

