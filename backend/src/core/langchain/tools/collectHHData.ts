import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { fetchHHVacancies, searchVacanciesBySkill } from '../../../mocks/hhMock.js';
import { createModuleLogger } from '../../utils/logger.js';

const logger = createModuleLogger('collectHHDataTool');

/**
 * LangChain Tool: сбор данных о вакансиях с HH.ru
 * 
 * Использует mock API для получения вакансий компании
 */
export const collectHHDataTool = tool(
  async ({ companyName }) => {
    try {
      logger.info({ companyName }, 'Collecting HH.ru data');

      const hhData = await fetchHHVacancies(companyName);

      // Форматируем результат для LLM
      const result = `📊 **Данные с HH.ru для "${companyName}"**

📈 Всего вакансий: ${hhData.totalVacancies}
${hhData.avgSalary ? `💰 Средняя зарплата: ${hhData.avgSalary.toLocaleString('ru-RU')} руб` : ''}

🎯 Требуемые навыки: ${hhData.requiredSkills.join(', ')}

📝 Активные вакансии (${hhData.vacancies.length}):
${hhData.vacancies.map((v, i) => `
${i + 1}. **${v.title}**
   💵 ${v.salary || 'Не указана'}
   🛠️ Навыки: ${v.skills.join(', ')}
   📅 Опыт: ${v.experience || 'Не указан'}
   📆 Опубликовано: ${new Date(v.publishedAt || '').toLocaleDateString('ru-RU')}
`).join('')}

✅ Данные успешно собраны`;

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to collect HH.ru data');
      return `❌ Ошибка при сборе данных с HH.ru: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'collect_hh_data',
    description: `Собирает данные о вакансиях компании с HH.ru.

Используй этот инструмент когда нужно:
- Узнать какие вакансии открыты в компании
- Определить требуемые навыки и технологии
- Оценить уровень зарплат
- Понять опыт который требуется

Параметры:
- companyName: название компании для поиска

Возвращает: список вакансий с зарплатами, навыками, требуемым опытом и статистику.`,
    schema: z.object({
      companyName: z.string().describe('Название компании для поиска вакансий'),
    }),
  }
);

/**
 * LangChain Tool: поиск вакансий по навыку
 */
export const searchVacanciesBySkillTool = tool(
  async ({ skill }) => {
    try {
      logger.info({ skill }, 'Searching vacancies by skill');

      const vacancies = await searchVacanciesBySkill(skill);

      if (vacancies.length === 0) {
        return `📭 Вакансий по навыку "${skill}" не найдено`;
      }

      const result = `🔍 **Найдено вакансий по навыку "${skill}": ${vacancies.length}**

${vacancies.map((v, i) => `
${i + 1}. **${v.title}**
   💵 ${v.salary || 'Не указана'}
   🛠️ Навыки: ${v.skills.join(', ')}
   📅 Опыт: ${v.experience || 'Не указан'}
`).join('')}`;

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to search vacancies');
      return `❌ Ошибка при поиске вакансий: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    }
  },
  {
    name: 'search_vacancies_by_skill',
    description: `Ищет вакансии по конкретному навыку или технологии.

Используй когда нужно:
- Найти вакансии с определенной технологией (React, Python, Java и т.д.)
- Оценить спрос на навык
- Сравнить зарплаты для разных технологий

Параметры:
- skill: название навыка или технологии

Возвращает: список вакансий содержащих этот навык.`,
    schema: z.object({
      skill: z.string().describe('Название навыка или технологии для поиска'),
    }),
  }
);

