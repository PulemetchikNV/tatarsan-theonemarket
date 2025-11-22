/**
 * Market Researcher Internal Tools (DATA-API)
 * 
 * Внутренние инструменты для MarketResearcherAgent.
 * Используют data-api (PHP сервис) для получения реальных данных.
 * 
 * Агент САМ решает какие tools использовать для исследования рынка.
 * 
 * Tools:
 * - research_market_from_data_api: проводит комплексное рыночное исследование
 * - get_top_technologies_from_data_api: получает топ технологий по спросу
 * - get_tech_demand_from_data_api: проверяет спрос на конкретную технологию
 * 
 * Legacy tools (старые моки):
 * - researchMarketTool, getTopTechnologiesTool, getTechDemandTool
 */

// Новые tools для data-api
export { researchMarketFromDataApiTool } from './researchMarketFromDataApi.js';
export { 
  getTechDemandFromDataApiTool, 
  getTopTechnologiesFromDataApiTool 
} from './getTechDemandFromDataApi.js';

// Legacy tools (оставляем для совместимости, но не используем)
export { researchMarketTool } from './researchMarketTool.js';
export { getTopTechnologiesTool } from './getTopTechnologiesTool.js';
export { getTechDemandTool } from './getTechDemandTool.js';
