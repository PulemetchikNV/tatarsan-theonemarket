/**
 * Data API - единая точка доступа
 * 
 * Переключатель между MOCK и REAL API клиентом
 * 
 * IS_MOCK=true  → использует dataApiMock.ts (по умолчанию)
 * IS_MOCK=false → использует apiConnector.ts (реальный PHP API)
 */

// ═══════════════════════════════════════════════════════════
// 🔧 КОНСТАНТА ДЛЯ ПЕРЕКЛЮЧЕНИЯ МЕЖДУ MOCK И REAL API
// ═══════════════════════════════════════════════════════════
const IS_MOCK = true; // Измени на false для использования реального API
// ═══════════════════════════════════════════════════════════

if (IS_MOCK) {
  console.log('🔧 [dataApi] Using MOCK data');
} else {
  console.log('🌐 [dataApi] Using REAL API (URL:', process.env.DATA_API_URL || 'http://localhost:8100/api', ')');
}

// Экспортируем соответствующий клиент
export const {
  getRoles,
  getVacancyStats,
  getEmployers,
  getEmployerDetail,
  getRegionStats,
} = IS_MOCK
  ? await import('../mocks/dataApiMock.js')
  : await import('./apiConnector.js');

// Экспортируем типы (всегда из mock, они одинаковые)
export type {
  Role,
  RolesResponse,
  VacancyStats,
  VacancyStatsResponse,
  Employer,
  EmployersResponse,
  Vacancy,
  EmployerDetail,
  EmployerDetailResponse,
} from '../mocks/dataApiMock.js';

// Экспортируем флаг для проверки
export const isMockMode = IS_MOCK;

