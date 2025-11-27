import type { MetricsResponse, MarketMetrics } from './types.js';

/**
 * Mock для Market Metrics API
 */
export function getMetrics(params?: { 
  start_date?: string; 
  end_date?: string; 
  region?: string 
}): MetricsResponse {
  const region = params?.region || 'Татарстан';
  const startDate = params?.start_date || '2024-01-01';
  const endDate = params?.end_date || new Date().toISOString().split('T')[0];

  // Эмулируем реалистичные данные для IT рынка Татарстана
  const metrics: MarketMetrics = {
    quantitative: {
      active_vacancies: 1250,
      resumes_count: 4500,
      competition_ratios: {
        junior: { vacancies: 150, resumes: 2500, ratio: 16.6 }, // Высокая конкуренция
        middle: { vacancies: 600, resumes: 1500, ratio: 2.5 },  // Здоровая
        senior: { vacancies: 500, resumes: 500, ratio: 1.0 },   // Дефицит
      }
    },
    salary: {
      median_by_level: {
        junior: 60000,
        middle: 150000,
        senior: 280000,
      },
      gap_with_moscow: -25, // Отставание 25% (пока null в PHP, но в моке можно дать пример)
      ranges_by_specialization: {
        'backend': { min: 80000, max: 400000, avg: 190000 },
        'frontend': { min: 70000, max: 350000, avg: 170000 },
        'devops': { min: 100000, max: 450000, avg: 220000 },
        'qa': { min: 50000, max: 250000, avg: 130000 },
        'data_science': { min: 120000, max: 500000, avg: 240000 },
      },
      salary_specified_ratio: 45.5, // 45% вакансий с зарплатой
    },
    structural: {
      remote_ratio: 35.2,
      specialization_distribution: {
        'backend': { count: 400, percentage: 32 },
        'frontend': { count: 350, percentage: 28 },
        'qa': { count: 200, percentage: 16 },
        'mobile': { count: 150, percentage: 12 },
        'other': { count: 150, percentage: 12 },
      },
      tech_companies_ratio: 65.0,
      average_closing_time_days: 24,
    },
    dynamics: {
      current_year: new Date().getFullYear(),
      previous_year: new Date().getFullYear() - 1,
      current_count: 1250,
      previous_count: 980,
      change_percent: 27.5, // Рост на 27.5%
    }
  };

  return {
    success: true,
    data: metrics,
    period: {
      start_date: startDate,
      end_date: endDate,
      region,
    }
  };
}

