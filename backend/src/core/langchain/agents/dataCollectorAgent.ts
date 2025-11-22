import { logger } from '../../utils/logger.js';
import type { DataCollectorResult, HHData, GitHubData, HabrData } from '../../types/index.js';
import { fetchHHVacancies } from '../../../mocks/hhMock.js';
import { fetchGitHubRepos } from '../../../mocks/githubMock.js';
import { fetchHabrArticles } from '../../../mocks/habrMock.js';

/**
 * Data Collector Agent
 * 
 * Простой агент для сбора данных о компании из разных источников.
 * Не использует AI - просто параллельно собирает данные из всех источников.
 * 
 * Источники:
 * - HH.ru (вакансии)
 * - GitHub (репозитории, активность)
 * - Habr (статьи, упоминания)
 * 
 * Примечание: Это "служебный" агент без AI.
 * Реальные "думающие" агенты: MarketResearcher, Analyzer, Orchestrator
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
   * Собирает данные о компании из всех источников параллельно
   */
  async collect(companyName: string): Promise<DataCollectorResult> {
    const startTime = Date.now();
    this.log(`Collecting data for: ${companyName}`);

    try {
      // Параллельный сбор данных из всех источников
      const [hhData, githubData, habrData] = await Promise.all([
        this.collectFromHH(companyName),
        this.collectFromGitHub(companyName),
        this.collectFromHabr(companyName),
      ]);

      const executionTime = Date.now() - startTime;
      this.log(`Completed in ${executionTime}ms`, {
        hasHH: !!hhData,
        hasGitHub: !!githubData,
        hasHabr: !!habrData,
      });

      return {
        hhData,
        githubData,
        habrData,
        collectedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError('Collection failed', error);
      throw error;
    }
  }

  private async collectFromHH(companyName: string): Promise<HHData | undefined> {
    try {
      this.log(`Collecting from HH.ru for: ${companyName}`);
      
      // Используем mock API (в будущем заменится на реальный парсер)
      const hhData = await fetchHHVacancies(companyName);
      
      this.log(`Collected ${hhData.vacancies.length} vacancies from HH.ru`);
      return hhData;
    } catch (error) {
      this.logError('Failed to collect from HH.ru', error);
      return undefined;
    }
  }

  private async collectFromGitHub(companyName: string): Promise<GitHubData | undefined> {
    try {
      this.log(`Collecting from GitHub for: ${companyName}`);
      
      // Используем mock API (в будущем заменится на реальный парсер)
      const githubData = await fetchGitHubRepos(companyName);
      
      this.log(`Collected ${githubData.repositories.length} repositories from GitHub`);
      return githubData;
    } catch (error) {
      this.logError('Failed to collect from GitHub', error);
      return undefined;
    }
  }

  private async collectFromHabr(companyName: string): Promise<HabrData | undefined> {
    try {
      this.log(`Collecting from Habr for: ${companyName}`);
      
      // Используем mock API (в будущем заменится на реальный парсер)
      const habrData = await fetchHabrArticles(companyName);
      
      this.log(`Collected ${habrData.articles.length} articles from Habr`);
      return habrData;
    } catch (error) {
      this.logError('Failed to collect from Habr', error);
      return undefined;
    }
  }
}

export const dataCollectorAgent = new DataCollectorAgent();


