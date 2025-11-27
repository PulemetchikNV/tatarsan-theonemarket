/**
 * 🤖 IT-Пульс Татарстана - AI Agents
 * 
 * 8 специализированных агентов на базе LangChain.js
 */

// Base Agents
export { ThinkingAgent, BaseAgent } from './baseAgent.js';
export { SimpleAgent } from './simpleAgent.js';

// 🎯 Main Orchestrator - ДУМАЮЩИЙ агент-координатор
export { orchestratorAgent, OrchestratorAgent } from './orchestrator/index.js';

// 6 Specialized Agents
export { dataCollectorAgent, DataCollectorAgent } from './dataCollector/index.js';
export { industryClassifierAgent, IndustryClassifierAgent } from './industryClassifier/index.js';
export { marketResearcherAgent, MarketResearcherAgent } from './marketResearcher/index.js';
export { eventTrackerAgent, EventTrackerAgent } from './eventTracker/index.js';
export { reportGeneratorAgent, ReportGeneratorAgent } from './reportGenerator/index.js';