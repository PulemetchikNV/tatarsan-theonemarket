import { BaseAgent } from '../baseAgent.js';
import { getMarketMetricsTool } from './tools/getData.js';
import { MARKET_RESEARCHER_SYSTEM_PROMPT } from './prompts/index.js';

export class MarketResearcherAgent extends BaseAgent {
  constructor() {
    const tools = [getMarketMetricsTool];

    super('MarketResearcher', tools, MARKET_RESEARCHER_SYSTEM_PROMPT);
  }

  /** 
   * Анализирует рынок по запросу
   */
  public async research(query: string): Promise<any> {
    this.log('Processing research request', { query });

    try {
      const result = await this.invokeAgent(query);
      
      let outputText = typeof result === 'string' ? result : result?.output;

      if (!outputText) {
         return { error: "No output from agent", raw: result };
      }

      try {
        const cleanJson = outputText.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        this.log('Response is not pure JSON, returning raw', { outputText });
        return { raw_response: outputText };
      }

    } catch (error) {
      this.logError('Failed to research market', error);
      throw error;
    }
  }
}

export const marketResearcherAgent = new MarketResearcherAgent();
