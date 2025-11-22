import { logger } from '../../../utils/logger.js';
import type { DataCollectorResult } from '../../../types/index.js';
import { getEmployers, getEmployerDetail } from '../../../../mocks/dataApiMock.js';

/**
 * Data Collector Agent
 * 
 * Собирает данные о компании из data-api (PHP сервис).
 * НЕ использует AI - просто делает запросы к API.
 * 
 * Data API контракты:
 * - GET /api/employers?search={name} - поиск компании
 * - GET /api/employers/{id} - детали компании с вакансиями
 * 
 * КОНТРАКТ:
 * Input:  companyName: string
 * Output: DataCollectorResult
 * 
 * Используется в:
 * - orchestrator/tools/collectDataTool.ts
 * 
 * Примечание: Это "служебный" агент без AI.
 * Реальные "думающие" агенты: MarketResearcher, Orchestrator
 */
export class DataCollectorAgent {
  private agentName = 'DataCollector';

  private log(message: string, data?: any) {
    logger.info(`[${this.agentName}] ${message}`, data);
  }

  private logError(message: string, error: any) {
    logger.error(`[${this.agentName}] ${message}`, error);
  }

  /**
   * Собирает данные о компании через data-api
   * 
   * @param companyName - название компании
   * @returns DataCollectorResult - структурированные данные из data-api
   */
  async collect(companyName: string): Promise<DataCollectorResult> {
    const startTime = Date.now();
    this.log(`Collecting data for: ${companyName}`);

    try {
      // 1. Ищем компанию по названию
      this.log(`Searching for employer: ${companyName}`);
      const searchResult = getEmployers({ search: companyName, limit: 5 });
      
      if (!searchResult.success || searchResult.data.length === 0) {
        this.logError(`Employer not found: ${companyName}`, {});
        throw new Error(`Employer "${companyName}" not found in data-api`);
      }
      
      // Берем первый результат (самый релевантный)
      const employer = searchResult.data[0];
      this.log(`Found employer: ${employer.name} (ID: ${employer.id})`);
      
      // 2. Получаем детальную информацию с вакансиями
      this.log(`Fetching employer details for ID: ${employer.id}`);
      const detailResult = getEmployerDetail(employer.id);
      
      if (!detailResult || !detailResult.success) {
        this.logError(`Failed to get employer details for ID: ${employer.id}`, {});
        throw new Error(`Failed to get details for employer ${employer.id}`);
      }
      
      const details = detailResult.data;
      
      // 3. Мапим данные в наш формат DataCollectorResult
      const totalVacancies = details.vacancies_count;
      const vacancies = details.vacancies;
      
      // Вычисляем среднюю зарплату
      const salariesFrom = vacancies
        .map(v => v.salary_from)
        .filter((s): s is number => s !== null);
      const avgSalary = salariesFrom.length > 0
        ? Math.round(salariesFrom.reduce((sum, s) => sum + s, 0) / salariesFrom.length)
        : 0;
      
      // Собираем навыки (из requirements)
      const allSkills = new Set<string>();
      vacancies.forEach(v => {
        if (v.requirements) {
          // Простой парсинг навыков из требований
          const skillMatches = v.requirements.match(/\b[A-Z][a-z]+(?:\.[a-z]+)?\b/g);
          skillMatches?.forEach(skill => allSkills.add(skill));
        }
      });
      
      const executionTime = Date.now() - startTime;
      this.log(`Completed in ${executionTime}ms`, {
        employerId: employer.id,
        employerName: employer.name,
        totalVacancies,
        avgSalary,
        skills: allSkills.size,
      });

      return {
        // HH данные (из data-api)
        hhData: {
          totalVacancies,
          avgSalary,
          vacancies: vacancies.map(v => ({
            title: v.name,
            skills: v.requirements?.split(',').map(s => s.trim()).slice(0, 5) || [],
            salary_from: v.salary_from,
            salary_to: v.salary_to,
          })),
        },
        // GitHub данные (пока не используем - в data-api нет)
        githubData: undefined,
        // Habr данные (пока не используем - в data-api нет)
        habrData: undefined,
        // Мета-данные
        collectedAt: new Date().toISOString(),
        employerId: employer.id,
        employerName: employer.name,
        source: 'data-api',
      };
    } catch (error) {
      this.logError('Collection failed', error);
      throw error;
    }
  }
}

export const dataCollectorAgent = new DataCollectorAgent();

