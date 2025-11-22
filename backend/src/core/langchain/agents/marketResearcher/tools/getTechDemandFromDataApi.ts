import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getVacancyStats, getRoles } from '../../../../../mocks/dataApiMock.js';
import { createModuleLogger } from '../../../../utils/logger.js';

const logger = createModuleLogger('getTechDemandFromDataApi');

/**
 * Маппинг ролей на технологии (на основе реальных вакансий)
 */
const ROLE_TO_TECH_MAP: Record<string, string[]> = {
  '96': ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++'], // Developer
  '124': ['Selenium', 'Cypress', 'Jest', 'Postman', 'TestRail'], // QA Engineer
  '160': ['Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI'], // DevOps
  '165': ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn'], // Data Scientist
  '10': ['SQL', 'Excel', 'Power BI', 'Tableau', 'Python'], // Analyst
  '73': ['Jira', 'Confluence', 'Miro', 'Figma'], // Product Manager
  '104': ['Figma', 'Sketch', 'Adobe XD', 'Photoshop'], // Designer
};

/**
 * Tool: Получает спрос на конкретную технологию
 */
export const getTechDemandFromDataApiTool = tool(
  async ({ technology, days }) => {
    logger.info('🔍 Getting tech demand from data-api', { technology, days });
    
    try {
      const roles = getRoles();
      
      // Ищем роли которые используют эту технологию
      const relevantRoles = roles.data.filter(role => {
        const techs = ROLE_TO_TECH_MAP[role.id] || [];
        return techs.some(t => t.toLowerCase() === technology.toLowerCase());
      });
      
      if (relevantRoles.length === 0) {
        return JSON.stringify({
          technology,
          demand: 0,
          message: `Технология "${technology}" не найдена в топ ролях`,
        });
      }
      
      // Получаем статистику по каждой релевантной роли
      const roleStats = await Promise.all(
        relevantRoles.map(async role => {
          const stats = getVacancyStats({ role: role.id, days });
          const totalVacancies = stats.data.reduce((sum, d) => sum + d.count, 0);
          return {
            role: role.name,
            vacancies: totalVacancies,
          };
        })
      );
      
      const totalDemand = roleStats.reduce((sum, s) => sum + s.vacancies, 0);
      
      // Нормализуем спрос в 0-100
      const demandScore = Math.min(100, Math.round((totalDemand / days) * 3));
      
      const result = {
        technology,
        demand: demandScore,
        related_roles: roleStats,
        total_vacancies: totalDemand,
        period_days: days,
        message: `Спрос на ${technology}: ${demandScore}/100 (${totalDemand} вакансий за ${days} дней)`,
      };
      
      logger.info('✅ Tech demand retrieved', { technology, demand: demandScore });
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('❌ Failed to get tech demand', { error });
      throw error;
    }
  },
  {
    name: 'get_tech_demand_from_data_api',
    description: `Получает спрос на конкретную технологию на рынке.
    
Анализирует вакансии по ролям связанным с этой технологией.
Возвращает оценку спроса от 0 до 100.

Поддерживаемые технологии:
- Языки: JavaScript, TypeScript, Python, Java, Go, Rust, C++
- Frontend: React, Vue, Angular, Next.js
- Backend: Node.js, Spring Boot, Django, FastAPI
- DevOps: Docker, Kubernetes, Terraform, Ansible, Jenkins
- Data: TensorFlow, PyTorch, Pandas, NumPy
- И другие...`,
    schema: z.object({
      technology: z.string().describe('Название технологии (например "TypeScript", "React", "Docker")'),
      days: z.number().default(30).describe('Период анализа в днях (по умолчанию 30)'),
    }),
  }
);

/**
 * Tool: Получает топ технологий по спросу
 */
export const getTopTechnologiesFromDataApiTool = tool(
  async ({ limit, days }) => {
    logger.info('🔍 Getting top technologies from data-api', { limit, days });
    
    try {
      const roles = getRoles();
      
      // Собираем все технологии из всех ролей
      const allTechDemand: Record<string, number> = {};
      
      for (const role of roles.data) {
        const techs = ROLE_TO_TECH_MAP[role.id] || [];
        const stats = getVacancyStats({ role: role.id, days });
        const totalVacancies = stats.data.reduce((sum, d) => sum + d.count, 0);
        
        // Распределяем спрос между технологиями роли
        const demandPerTech = totalVacancies / techs.length;
        
        techs.forEach(tech => {
          allTechDemand[tech] = (allTechDemand[tech] || 0) + demandPerTech;
        });
      }
      
      // Сортируем и нормализуем
      const topTechs = Object.entries(allTechDemand)
        .map(([tech, demand]) => ({
          technology: tech,
          demand: Math.min(100, Math.round((demand / days) * 3)),
          raw_vacancies: Math.round(demand),
        }))
        .sort((a, b) => b.demand - a.demand)
        .slice(0, limit);
      
      const result = {
        top_technologies: topTechs,
        period_days: days,
        total_analyzed: Object.keys(allTechDemand).length,
      };
      
      logger.info('✅ Top technologies retrieved', { count: topTechs.length });
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('❌ Failed to get top technologies', { error });
      throw error;
    }
  },
  {
    name: 'get_top_technologies_from_data_api',
    description: `Получает топ технологий по спросу на рынке.
    
Анализирует все вакансии по ролям и возвращает топ N технологий с оценкой спроса.
Спрос оценивается по шкале от 0 до 100.`,
    schema: z.object({
      limit: z.number().default(10).describe('Количество технологий в топе (по умолчанию 10)'),
      days: z.number().default(30).describe('Период анализа в днях (по умолчанию 30)'),
    }),
  }
);

