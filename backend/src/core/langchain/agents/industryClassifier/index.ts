import { BaseAgent } from '../baseAgent.js';
import { calculateHealthScoreTool } from './tools/calculateHealthScore.js';
import { CLASSIFIER_SYSTEM_PROMPT } from './promps/index.js';

/**
 * IndustryClassifierAgent
 * 
 * Специализируется на классификации и глубокой оценке состояния рынка.
 * Вычисляет IT Health Score на основе данных от MarketResearcher.
 */
export class IndustryClassifierAgent extends BaseAgent {
  constructor() {
    const tools = [calculateHealthScoreTool];
    
    super('IndustryClassifier', tools, CLASSIFIER_SYSTEM_PROMPT);
  }

  /**
   * Вычисляет Health Score на основе данных о рынке
   * @param marketData JSON или текст с результатами MarketResearcher
   */
  public async classify(marketData: string | object): Promise<any> {
    const query = typeof marketData === 'string' ? marketData : JSON.stringify(marketData);
    
    this.log('Processing classification request');

    try {
      const result = await this.invokeAgent(`Analyze this market data and calculate Health Score: ${query}`);
      
      let outputText = typeof result === 'string' ? result : result?.output;

      if (!outputText) {
         return { error: "No output from agent", raw: result };
      }

      try {
        const cleanJson = outputText.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        return { raw_response: outputText };
      }

    } catch (error) {
      this.logError('Failed to classify market', error);
      throw error;
    }
  }
}

export const industryClassifierAgent = new IndustryClassifierAgent();
