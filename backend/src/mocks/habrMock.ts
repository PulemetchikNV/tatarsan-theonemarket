import type { HabrData, Article } from '../core/types/index.js';

/**
 * Mock API для Habr
 * Возвращает моковые данные о статьях компании
 */

// База статей для разных компаний
const articlesDB: Record<string, Article[]> = {
  'Таттелеком': [
    {
      title: 'Как мы мигрировали биллинг-систему на микросервисы',
      url: 'https://habr.com/ru/company/tattelecom/blog/123456/',
      publishedAt: new Date('2024-10-15').toISOString(),
      tags: ['microservices', 'java', 'spring', 'kubernetes'],
    },
    {
      title: 'Оптимизация производительности мобильного приложения для 500K+ пользователей',
      url: 'https://habr.com/ru/company/tattelecom/blog/123457/',
      publishedAt: new Date('2024-09-20').toISOString(),
      tags: ['mobile', 'performance', 'kotlin', 'android'],
    },
    {
      title: 'Построение CI/CD пайплайна для телеком-компании',
      url: 'https://habr.com/ru/company/tattelecom/blog/123458/',
      publishedAt: new Date('2024-08-10').toISOString(),
      tags: ['devops', 'cicd', 'gitlab', 'docker'],
    },
  ],
  'Иннополис': [
    {
      title: 'Как мы внедрили AI в образовательный процесс',
      url: 'https://habr.com/ru/company/innopolis/blog/234567/',
      publishedAt: new Date('2024-11-01').toISOString(),
      tags: ['ai', 'ml', 'education', 'python'],
    },
    {
      title: 'Разработка системы управления обучением на Python и Django',
      url: 'https://habr.com/ru/company/innopolis/blog/234568/',
      publishedAt: new Date('2024-10-05').toISOString(),
      tags: ['python', 'django', 'lms', 'education'],
    },
    {
      title: 'Использование Computer Vision в робототехнике',
      url: 'https://habr.com/ru/company/innopolis/blog/234569/',
      publishedAt: new Date('2024-09-15').toISOString(),
      tags: ['computer-vision', 'robotics', 'opencv', 'ai'],
    },
    {
      title: 'GraphQL vs REST: наш опыт перехода',
      url: 'https://habr.com/ru/company/innopolis/blog/234570/',
      publishedAt: new Date('2024-08-20').toISOString(),
      tags: ['graphql', 'rest', 'api', 'backend'],
    },
  ],
  'default': [
    {
      title: 'Наш путь к микросервисной архитектуре',
      url: 'https://habr.com/ru/company/example/blog/999999/',
      publishedAt: new Date('2024-10-01').toISOString(),
      tags: ['microservices', 'backend', 'architecture'],
    },
    {
      title: 'Как мы ускорили React-приложение в 3 раза',
      url: 'https://habr.com/ru/company/example/blog/999998/',
      publishedAt: new Date('2024-09-15').toISOString(),
      tags: ['react', 'frontend', 'performance'],
    },
  ],
};

/**
 * Получить статьи компании с Habr (mock)
 */
export async function fetchHabrArticles(companyName: string): Promise<HabrData> {
  // Имитируем задержку API
  await new Promise(resolve => setTimeout(resolve, 350));

  const articles = articlesDB[companyName] || articlesDB['default'];
  
  // Собираем уникальные топики
  const allTags = articles.flatMap(a => a.tags);
  const topics = Array.from(new Set(allTags));

  return {
    articles,
    totalArticles: articles.length + Math.floor(Math.random() * 20),
    topics,
  };
}

/**
 * Поиск статей по тегу (mock)
 */
export async function searchArticlesByTag(tag: string): Promise<Article[]> {
  await new Promise(resolve => setTimeout(resolve, 250));

  const allArticles = Object.values(articlesDB).flat();
  const tagLower = tag.toLowerCase();
  
  return allArticles.filter(a => 
    a.tags.some(t => t.toLowerCase().includes(tagLower)) ||
    a.title.toLowerCase().includes(tagLower)
  );
}

