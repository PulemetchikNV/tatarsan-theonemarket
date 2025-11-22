/**
 * 🤖 IT-Пульс Татарстана - AI Agents
 * 
 * 8 специализированных агентов на базе LangChain.js
 */

// Base Agent
export { BaseAgent } from './baseAgent.js';

// 🎯 Main Orchestrator - координирует всех агентов
export { orchestratorAgent, OrchestratorAgent } from './orchestratorAgent.js';

// 7 Specialized Agents
export { dataCollectorAgent, DataCollectorAgent } from './dataCollectorAgent.js';
export { analyzerAgent, AnalyzerAgent } from './analyzerAgent.js';
export { industryClassifierAgent, IndustryClassifierAgent } from './industryClassifierAgent.js';
export { marketResearcherAgent, MarketResearcherAgent } from './marketResearcherAgent.js';
export { eventTrackerAgent, EventTrackerAgent } from './eventTrackerAgent.js';
export { alerterAgent, AlerterAgent } from './alerterAgent.js';
export { reportGeneratorAgent, ReportGeneratorAgent } from './reportGeneratorAgent.js';

