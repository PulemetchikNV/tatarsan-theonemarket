import { BaseAgent } from './baseAgent.js';
import type { DataCollectorResult, HHData, GitHubData, HabrData } from '../../types/index.js';

/**
 * Data Collector Agent
 * Собирает данные о компании из разных источников:
 * - HH.ru (вакансии)
 * - GitHub (репозитории, активность)
 * - Habr (статьи, упоминания)
 * - LinkedIn (профиль компании)
 */
export class DataCollectorAgent extends BaseAgent {
  constructor() {
    super('DataCollector');
  }

  async collect(companyName: string): Promise<DataCollectorResult> {
    return this.execute(async () => {
      this.log(`Collecting data for: ${companyName}`);

      // Параллельный сбор данных из всех источников
      const [hhData, githubData, habrData] = await Promise.all([
        this.collectFromHH(companyName),
        this.collectFromGitHub(companyName),
        this.collectFromHabr(companyName),
      ]);

      return {
        hhData,
        githubData,
        habrData,
        collectedAt: new Date().toISOString(),
      };
    });
  }

  private async collectFromHH(companyName: string): Promise<HHData | undefined> {
    try {
      this.log(`Collecting from HH.ru for: ${companyName}`);
      
      // TODO: Реальный парсинг через Parser Service (PHP)
      // const response = await fetch(`${PARSER_SERVICE_URL}/parse/hh?company=${companyName}`);
      
      // Mock data for MVP
      return {
        vacancies: [
          {
            title: 'Senior Backend Developer',
            salary: '200,000 - 300,000 руб',
            skills: ['Node.js', 'TypeScript', 'PostgreSQL'],
            experience: '3-6 лет',
            publishedAt: new Date().toISOString(),
          },
          {
            title: 'Frontend Developer',
            salary: '150,000 - 250,000 руб',
            skills: ['React', 'TypeScript', 'Next.js'],
            experience: '1-3 года',
            publishedAt: new Date().toISOString(),
          },
        ],
        totalVacancies: 5,
        avgSalary: 175000,
        requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      };
    } catch (error) {
      this.logError('Failed to collect from HH.ru', error);
      return undefined;
    }
  }

  private async collectFromGitHub(companyName: string): Promise<GitHubData | undefined> {
    try {
      this.log(`Collecting from GitHub for: ${companyName}`);
      
      // TODO: Реальный парсинг через Parser Service
      // const response = await fetch(`${PARSER_SERVICE_URL}/parse/github?company=${companyName}`);
      
      // Mock data for MVP
      return {
        repositories: [
          {
            name: `${companyName.toLowerCase()}-api`,
            stars: 156,
            forks: 23,
            language: 'TypeScript',
            lastCommit: new Date().toISOString(),
          },
          {
            name: `${companyName.toLowerCase()}-web`,
            stars: 89,
            forks: 12,
            language: 'JavaScript',
            lastCommit: new Date().toISOString(),
          },
        ],
        totalRepos: 8,
        totalCommits: 247,
        languages: ['TypeScript', 'JavaScript', 'Python', 'Go'],
        activity: 247, // commits last 30 days
      };
    } catch (error) {
      this.logError('Failed to collect from GitHub', error);
      return undefined;
    }
  }

  private async collectFromHabr(companyName: string): Promise<HabrData | undefined> {
    try {
      this.log(`Collecting from Habr for: ${companyName}`);
      
      // TODO: Реальный парсинг через Parser Service
      // const response = await fetch(`${PARSER_SERVICE_URL}/parse/habr?company=${companyName}`);
      
      // Mock data for MVP
      return {
        articles: [
          {
            title: `Как мы в ${companyName} внедрили микросервисы`,
            url: 'https://habr.com/ru/company/example/blog/123456/',
            publishedAt: new Date().toISOString(),
            tags: ['microservices', 'backend', 'nodejs'],
          },
        ],
        totalArticles: 10,
        topics: ['backend', 'frontend', 'devops', 'ai'],
      };
    } catch (error) {
      this.logError('Failed to collect from Habr', error);
      return undefined;
    }
  }
}

export const dataCollectorAgent = new DataCollectorAgent();


