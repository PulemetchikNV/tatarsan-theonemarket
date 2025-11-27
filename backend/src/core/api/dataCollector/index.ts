import * as RealApi from './api.js';
import * as MockApi from './mock.js';
import { IS_MOCK } from '../index.js';
import { 
    RegionStats,
    RolesResponse,
    VacancyStatsResponse,
    EmployersResponse,
    EmployerDetailResponse
} from './types.js';

/**
 * API для DataCollector агента.
 * Автоматически выбирает между Mock и Real реализацией.
 */
export const DataCollectorApi = {
    async getRegionStats(region: string = 'Татарстан'): Promise<RegionStats> {
        if (IS_MOCK) {
            console.log('🛠️ [DataCollectorApi] Using MOCK for getRegionStats');
            // Приводим к типу, так как моки могут возвращать чуть другую структуру, но в целом совместимы
            return MockApi.getRegionStats(region) as unknown as RegionStats;
        }
        return RealApi.getRegionStats(region);
    },

    async getRoles(): Promise<RolesResponse> {
        if (IS_MOCK) {
            return MockApi.getRoles();
        }
        return RealApi.getRoles();
    },

    async getVacancyStats(params?: { role?: string; days?: number }): Promise<VacancyStatsResponse> {
        if (IS_MOCK) {
            return MockApi.getVacancyStats(params);
        }
        return RealApi.getVacancyStats(params);
    },

    async getEmployers(params?: { page?: number; limit?: number; search?: string }): Promise<EmployersResponse> {
        if (IS_MOCK) {
            return MockApi.getEmployers(params);
        }
        return RealApi.getEmployers(params);
    },

    async getEmployerDetail(id: number): Promise<EmployerDetailResponse | null> {
        if (IS_MOCK) {
            return MockApi.getEmployerDetail(id);
        }
        return RealApi.getEmployerDetail(id);
    }
};
