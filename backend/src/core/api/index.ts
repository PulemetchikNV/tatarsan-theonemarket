// Глобальный переключатель MOCK режима для API
// Если true - все API модули будут использовать моки из src/mocks
export const IS_MOCK = process.env.USE_MOCKS === 'true' || true; 

// Экспорт API объектов напрямую
export { DataCollectorApi } from './dataCollector/index.js';
export { MarketResearcherApi } from './marketResearcher/index.js';

// Экспорт типов (если нужно, но лучше брать из конкретных модулей)
// export * from './types.js'; 
