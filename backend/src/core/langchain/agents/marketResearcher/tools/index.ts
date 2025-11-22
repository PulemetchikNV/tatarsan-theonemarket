/**
 * Market Researcher Internal Tools
 * 
 * Внутренние инструменты для MarketResearcherAgent.
 * Агент САМ решает какие tools использовать для исследования рынка.
 * 
 * Tools:
 * - research_market: проводит комплексное рыночное исследование
 * - get_top_technologies: получает топ технологий по спросу
 * - get_tech_demand: проверяет спрос на конкретную технологию
 */

// Импортируем из общих tools для переиспользования
export {
  researchMarketTool,
  getTopTechnologiesTool,
  getTechDemandTool,
} from '../../tools/researchMarket.js';

