import type { GitHubData, Repository } from '../core/types/index.js';

/**
 * Mock API для GitHub
 * Возвращает моковые данные о репозиториях компании
 */

// База репозиториев для разных компаний
const reposDB: Record<string, Repository[]> = {
  'Таттелеком': [
    {
      name: 'tattelecom-billing-system',
      stars: 234,
      forks: 45,
      language: 'Java',
      lastCommit: new Date('2024-11-21').toISOString(),
    },
    {
      name: 'tattelecom-customer-portal',
      stars: 156,
      forks: 28,
      language: 'TypeScript',
      lastCommit: new Date('2024-11-22').toISOString(),
    },
    {
      name: 'tattelecom-monitoring',
      stars: 89,
      forks: 12,
      language: 'Python',
      lastCommit: new Date('2024-11-20').toISOString(),
    },
    {
      name: 'tattelecom-mobile-app',
      stars: 67,
      forks: 8,
      language: 'Kotlin',
      lastCommit: new Date('2024-11-19').toISOString(),
    },
  ],
  'Иннополис': [
    {
      name: 'innopolis-lms',
      stars: 456,
      forks: 89,
      language: 'Python',
      lastCommit: new Date('2024-11-22').toISOString(),
    },
    {
      name: 'innopolis-ai-lab',
      stars: 678,
      forks: 123,
      language: 'Python',
      lastCommit: new Date('2024-11-21').toISOString(),
    },
    {
      name: 'innopolis-student-portal',
      stars: 234,
      forks: 45,
      language: 'TypeScript',
      lastCommit: new Date('2024-11-22').toISOString(),
    },
    {
      name: 'innopolis-robotics',
      stars: 345,
      forks: 67,
      language: 'C++',
      lastCommit: new Date('2024-11-18').toISOString(),
    },
  ],
  'default': [
    {
      name: 'company-web',
      stars: 89,
      forks: 12,
      language: 'TypeScript',
      lastCommit: new Date().toISOString(),
    },
    {
      name: 'company-api',
      stars: 156,
      forks: 23,
      language: 'Node.js',
      lastCommit: new Date().toISOString(),
    },
    {
      name: 'company-mobile',
      stars: 67,
      forks: 8,
      language: 'React Native',
      lastCommit: new Date().toISOString(),
    },
  ],
};

/**
 * Получить данные о репозиториях компании с GitHub (mock)
 */
export async function fetchGitHubRepos(companyName: string): Promise<GitHubData> {
  // Имитируем задержку API
  await new Promise(resolve => setTimeout(resolve, 400));

  const repositories = reposDB[companyName] || reposDB['default'];
  
  // Собираем уникальные языки
  const languages = Array.from(new Set(
    repositories.map(r => r.language).filter((l): l is string => !!l)
  ));
  
  // Вычисляем общее количество коммитов (mock)
  const totalCommits = repositories.length * Math.floor(Math.random() * 50 + 100);
  
  // Активность за последние 30 дней (mock)
  const activity = Math.floor(Math.random() * 150 + 50);

  return {
    repositories,
    totalRepos: repositories.length + Math.floor(Math.random() * 5),
    totalCommits,
    languages,
    activity,
  };
}

/**
 * Поиск репозиториев по языку программирования (mock)
 */
export async function searchReposByLanguage(language: string): Promise<Repository[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const allRepos = Object.values(reposDB).flat();
  const langLower = language.toLowerCase();
  
  return allRepos.filter(r => 
    r.language?.toLowerCase().includes(langLower)
  );
}

