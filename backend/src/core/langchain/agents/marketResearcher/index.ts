import { BaseAgent } from '../baseAgent.js';
import { getMarketMetricsTool } from './tools/getData.js';

export class MarketResearcherAgent extends BaseAgent {
  constructor() {
    const tools = [getMarketMetricsTool];
    
    const systemPrompt = `
You are an expert Market Researcher specializing in IT labor market analysis.
Your GOAL is to analyze market metrics and provide strategic insights.

RULES:
1. Use 'get_market_metrics' to fetch real data.
2. Analyze the data (competition, salaries, trends).
3. Return ONLY valid JSON as the final response. 
4. Do not add markdown formatting (like \`\`\`json).
5. Focus on providing insights, not just raw numbers.

OUTPUT FORMAT (JSON):
{
  "market_state": "growing" | "stagnating" | "declining",
  "competition_analysis": "Detailed text summary of competition levels (junior/middle/senior)...",
  "salary_insights": "Detailed text summary of salary trends and gaps...",
  "key_trends": ["Trend 1", "Trend 2"],
  "recommendations": ["Rec 1", "Rec 2"],
  "raw_metrics_summary": {
      "avg_salary_middle": number,
      "remote_ratio": number,
      "competition_index": number
  }
}
`;

    super('MarketResearcher', tools, systemPrompt);
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
