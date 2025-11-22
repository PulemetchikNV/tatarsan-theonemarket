import { ChatOpenAI } from '@langchain/openai';
import { logger } from '../../utils/logger.js';

export abstract class BaseAgent {
  protected model: ChatOpenAI;
  protected agentName: string;

  constructor(agentName: string) {
    this.agentName = agentName;
    this.model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
    });
  }

  protected log(message: string, data?: any) {
    logger.info(`[${this.agentName}] ${message}`, data);
  }

  protected logError(message: string, error: any) {
    logger.error(`[${this.agentName}] ${message}`, error);
  }

  async execute<T>(task: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    try {
      this.log('Starting execution');
      const result = await task();
      const executionTime = Date.now() - startTime;
      this.log(`Completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logError('Execution failed', error);
      throw error;
    }
  }
}


