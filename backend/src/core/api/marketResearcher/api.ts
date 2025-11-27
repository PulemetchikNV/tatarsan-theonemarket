import type { MetricsResponse } from './types.js';

const DATA_API_BASE_URL = process.env.DATA_API_URL || 'http://host.docker.internal:8100/api';

/**
 * Утилита для HTTP запросов (можно вынести в shared, но пока дублируем для изоляции)
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
  const url = `${DATA_API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`[MarketResearcherApi] Failed to fetch ${url}:`, error);
    throw error;
  }
}

/**
 * Получить агрегированные метрики рынка
 * GET /api/metrics
 */
export async function getMetrics(params?: { 
  start_date?: string; 
  end_date?: string; 
  region?: string 
}): Promise<MetricsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.start_date) searchParams.append('start_date', params.start_date);
  if (params?.end_date) searchParams.append('end_date', params.end_date);
  if (params?.region) searchParams.append('region', params.region);

  const query = searchParams.toString();
  const endpoint = query ? `/metrics?${query}` : '/metrics';
  
  return fetchApi<MetricsResponse>(endpoint);
}

