import type { MarketResearcherResult } from '../core/types/index.js';

/**
 * Mock API для рыночных исследований
 * Возвращает моковые данные о трендах и конкурентах
 */

// Общие рыночные тренды
const marketTrendsDB = {
  '2024-Q4': [
    'AI и Machine Learning продолжают доминировать в спросе',
    'Рост интереса к Cloud Native технологиям (Kubernetes, Docker)',
    'Увеличение зарплат для Senior разработчиков на 15-20%',
    'DevOps и SRE-специалисты в дефиците',
    'TypeScript вытесняет JavaScript в корпоративной разработке',
    'Микросервисная архитектура становится стандартом',
  ],
  'fintech': [
    'Регулирование криптовалют усиливается',
    'Open Banking API набирает популярность',
    'Биометрическая аутентификация в мобильных банках',
    'Рост спроса на специалистов по безопасности',
  ],
  'edtech': [
    'Гибридное обучение становится нормой',
    'AI-персонализация учебных программ',
    'Геймификация образовательного процесса',
    'LMS системы на базе облачных технологий',
  ],
};

// Спрос на технологии (0-100)
const techDemandDB: Record<string, number> = {
  'TypeScript': 95,
  'Python': 92,
  'React': 90,
  'Node.js': 88,
  'PostgreSQL': 85,
  'Docker': 87,
  'Kubernetes': 82,
  'AWS': 80,
  'Go': 78,
  'Java': 75,
  'Spring Boot': 72,
  'Redis': 70,
  'GraphQL': 68,
  'Next.js': 85,
  'TensorFlow': 65,
  'PyTorch': 63,
  'Django': 70,
  'FastAPI': 72,
};

/**
 * Получить рыночные исследования для компании (mock)
 */
export async function fetchMarketResearch(
  companyName: string,
  industry?: string
): Promise<MarketResearcherResult> {
  // Имитируем задержку API
  await new Promise(resolve => setTimeout(resolve, 500));

  // Базовые тренды + специфичные для индустрии
  const baseTrends = marketTrendsDB['2024-Q4'];
  const industryTrends = industry && industry in marketTrendsDB 
    ? marketTrendsDB[industry as keyof typeof marketTrendsDB]
    : [];
  
  const marketTrends = [...baseTrends, ...industryTrends];

  // Анализ конкурентов (mock)
  const competitors = getCompetitors(companyName, industry);
  const competitorAnalysis = `В регионе Татарстан выявлено ${competitors.length} прямых конкурентов. ${competitors.slice(0, 3).join(', ')} являются основными игроками. Рынок показывает рост 12-15% в год.`;

  // Потенциал роста на основе индустрии
  const growthPotential = calculateGrowthPotential(industry);

  return {
    marketTrends,
    demandForTech: techDemandDB,
    competitorAnalysis,
    growthPotential,
  };
}

/**
 * Получить список конкурентов (mock)
 */
function getCompetitors(companyName: string, industry?: string): string[] {
  const competitorsDB: Record<string, string[]> = {
    'Таттелеком': ['Ростелеком', 'МТС', 'Билайн', 'Мегафон', 'Дом.ру'],
    'Иннополис': ['Яндекс Практикум', 'Skillbox', 'GeekBrains', 'Нетология', 'ИТМО'],
    'default': ['Конкурент А', 'Конкурент Б', 'Конкурент В'],
  };

  return competitorsDB[companyName] || competitorsDB['default'];
}

/**
 * Вычислить потенциал роста (mock)
 */
function calculateGrowthPotential(industry?: string): number {
  const potentialByIndustry: Record<string, number> = {
    'AI': 95,
    'fintech': 88,
    'edtech': 85,
    'healthtech': 82,
    'e-commerce': 78,
    'gaming': 75,
    'blockchain': 70,
  };

  if (industry && industry in potentialByIndustry) {
    return potentialByIndustry[industry];
  }

  // Базовый потенциал
  return 65 + Math.floor(Math.random() * 20);
}

/**
 * Получить топ технологий по спросу (mock)
 */
export async function getTopTechnologies(limit = 10): Promise<Record<string, number>> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const sorted = Object.entries(techDemandDB)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  return Object.fromEntries(sorted);
}

/**
 * Получить спрос на конкретную технологию (mock)
 */
export async function getTechDemand(technology: string): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 150));

  return techDemandDB[technology] || 50; // по умолчанию средний спрос
}

