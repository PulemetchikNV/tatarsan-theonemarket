/**
 * Orchestrator Tools
 * 
 * Tools для управления процессом анализа через оркестратор.
 * Каждый tool вызывает соответствующего специализированного агента.
 * 
 * АНАЛИЗ КОМПАНИИ:
 * 
 * ФАЗА 1: Сбор данных
 * - collect_data
 * 
 * ФАЗА 2: Анализ (параллельно)
 * - classify_industry
 * - research_market
 * 
 * ФАЗА 3: Генерация результатов
 * - generate_report
 * 
 * АНАЛИЗ ДАШБОРДА:
 * - analyze_dashboard (исследование рынка региона БЕЗ компаний)
 */

export { collectDataTool } from './collectDataTool.js';
export { classifyIndustryTool } from './classifyIndustryTool.js';
export { researchMarketTool } from './researchMarketTool.js';
export { generateReportTool } from './generateReportTool.js';
export { analyzeDashboardTool } from './analyzeDashboardTool.js';
