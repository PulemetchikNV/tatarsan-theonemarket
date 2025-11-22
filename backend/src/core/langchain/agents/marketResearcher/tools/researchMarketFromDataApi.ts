import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getVacancyStats, getEmployers, getRoles } from '../../../../dataApi.js';
import { createModuleLogger } from '../../../../utils/logger.js';

const logger = createModuleLogger('researchMarketFromDataApi');

/**
 * Tool: Проводит рыночное исследование через data-api
 * 
 * Использует:
 * - GET /api/vacancies/stats/daily - динамика вакансий
 * - GET /api/employers - список конкурентов
 * - GET /api/roles - список востребованных ролей
 */
export const researchMarketFromDataApiTool = tool(
  async ({ region, days }) => {
    logger.info('🔍 Researching market from data-api', { region, days });
    
    try {
      // 1. Получаем статистику по вакансиям
      const stats = getVacancyStats({ days });
      
      // 2. Получаем список всех компаний (конкурентов)
      const employers = getEmployers({ limit: 100 });
      
      // 3. Получаем список востребованных ролей
      const roles = getRoles();
      
      // Анализируем тренды
      const recentData = stats.data.slice(-7); // Последние 7 дней
      const totalRecent = recentData.reduce((sum, d) => sum + d.count, 0);
      const avgDaily = Math.round(totalRecent / recentData.length);
      
      // Определяем тренд
      const firstWeek = stats.data.slice(0, 7).reduce((sum, d) => sum + d.count, 0) / 7;
      const lastWeek = totalRecent / 7;
      const growth = Math.round(((lastWeek - firstWeek) / firstWeek) * 100);
      
      const trend = growth > 5 
        ? 'растущий' 
        : growth < -5 
        ? 'снижающийся' 
        : 'стабильный';
      
      // Формируем результат исследования
      const result = {
        region,
        period: {
          days,
          start_date: stats.filters.start_date,
          end_date: stats.filters.end_date,
        },
        market_overview: {
          total_employers: employers.data.length,
          total_vacancies_period: stats.data.reduce((sum, d) => sum + d.count, 0),
          avg_daily_vacancies: avgDaily,
          trend,
          growth_percent: growth,
        },
        top_employers: employers.data
          .sort((a, b) => b.vacancies_count - a.vacancies_count)
          .slice(0, 10)
          .map(e => ({
            name: e.name,
            vacancies_count: e.vacancies_count,
            description: e.description,
          })),
        top_roles: roles.data.slice(0, 10),
        market_trends: [
          `Рынок IT-вакансий в Татарстане: ${trend} тренд (${growth > 0 ? '+' : ''}${growth}%)`,
          `Средний объем вакансий: ${avgDaily}/день`,
          `Всего компаний в регионе: ${employers.data.length}`,
          `Наиболее востребованные роли: ${roles.data.slice(0, 3).map(r => r.name).join(', ')}`,
        ],
      };
      
      logger.info('✅ Market research completed', {
        employers: employers.data.length,
        avgDaily,
        trend,
      });
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('❌ Market research failed', { error });
      throw error;
    }
  },
  {
    name: 'research_market_from_data_api',
    description: `Проводит рыночное исследование IT-индустрии региона через data-api.
    
Возвращает:
- Обзор рынка (количество компаний, вакансий, тренды)
- Топ работодателей по количеству вакансий
- Топ востребованные роли
- Динамику рынка (рост/спад)

Используй этот инструмент чтобы получить полную картину рынка для анализа.`,
    schema: z.object({
      region: z.string().describe('Название региона (например "Татарстан")'),
      days: z.number().default(30).describe('Период анализа в днях (по умолчанию 30)'),
    }),
  }
);

