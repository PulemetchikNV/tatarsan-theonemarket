/**
 * API Connector для data-api (PHP сервис)
 * 
 * Реальный HTTP клиент для взаимодействия с data-api
 * Base URL: http://localhost:8100/api
 * 
 * Использует те же интерфейсы что и dataApiMock.ts
 */

import type {
  RolesResponse,
  VacancyStatsResponse,
  EmployersResponse,
  EmployerDetailResponse,
} from './types';

const DATA_API_BASE_URL = process.env.DATA_API_URL || 'http://localhost:8100/api';

/**
 * Утилита для HTTP запросов
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
  const url = `${DATA_API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`[apiConnector] Failed to fetch ${url}:`, error);
    throw error;
  }
}

/**
 * API Client: GET /api/roles
 */
export async function getRoles(): Promise<RolesResponse> {
  return fetchApi<RolesResponse>('/roles');
}

/**
 * API Client: GET /api/vacancies/stats/daily
 */
export async function getVacancyStats(params?: { 
  role?: string; 
  days?: number 
}): Promise<VacancyStatsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.role) {
    searchParams.append('role', params.role);
  }
  if (params?.days) {
    searchParams.append('days', params.days.toString());
  }

  const query = searchParams.toString();
  const endpoint = query ? `/vacancies/stats/daily?${query}` : '/vacancies/stats/daily';
  
  return fetchApi<VacancyStatsResponse>(endpoint);
}

/**
 * API Client: GET /api/employers
 */
export async function getEmployers(params?: { 
  page?: number; 
  limit?: number; 
  search?: string 
}): Promise<EmployersResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const query = searchParams.toString();
  const endpoint = query ? `/employers?${query}` : '/employers';
  
  return fetchApi<EmployersResponse>(endpoint);
}

/**
 * API Client: GET /api/employers/{id}
 */
export async function getEmployerDetail(id: number): Promise<EmployerDetailResponse | null> {
  try {
    return await fetchApi<EmployerDetailResponse>(`/employers/${id}`);
  } catch (error) {
    // 404 = не найден
    return null;
  }
}

/**
 * Утилита: Агрегация данных для региона
 * (аналог getRegionStats из mock)
 */
export async function getRegionStats(region: string = 'Татарстан') {
  const [employers, stats, roles] = await Promise.all([
    getEmployers({ limit: 100 }),
    getVacancyStats({ days: 30 }),
    getRoles(),
  ]);

  const totalEmployers = employers.data.length;
  const totalVacancies = employers.data.reduce((sum, e) => sum + e.vacancies_count, 0);
  const avgVacanciesPerEmployer = Math.round(totalVacancies / totalEmployers);
  
  // Средняя зарплата (грубая оценка)
  const avgSalary = 185000;
  
  return {
    region,
    totalEmployers,
    totalVacancies,
    avgVacanciesPerEmployer,
    avgSalary,
    topEmployers: employers.data.slice(0, 5),
    vacancyTrends: stats.data.slice(-7), // Последние 7 дней
    topRoles: roles.data.slice(0, 5),
  };
}

