import * as RealApi from './api.js';
import * as MockApi from './mock.js';
import { IS_MOCK } from '../index.js';
import type { MetricsResponse } from './types.js';

/**
 * API для Market Researcher агента.
 * Предоставляет доступ к агрегированным метрикам рынка.
 */
export const MarketResearcherApi = {
    /**
     * Получить полные метрики рынка (количественные, зарплатные, структурные)
     */
    async getMetrics(params?: { 
        start_date?: string; 
        end_date?: string; 
        region?: string 
    }): Promise<MetricsResponse> {
        if (IS_MOCK) {
            console.log('🛠️ [MarketResearcherApi] Using MOCK for getMetrics');
            return MockApi.getMetrics(params);
        }
        return RealApi.getMetrics(params);
    }
};

export * from './types.js';
