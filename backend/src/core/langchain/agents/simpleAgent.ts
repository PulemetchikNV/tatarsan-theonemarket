import { ChatOpenAI } from '@langchain/openai';
import { logger } from '../../utils/logger.js';
import { MODELS } from '../shared/models.js';

/**
 * Базовый класс для простых агентов БЕЗ AI tools
 * 
 * Используется для агентов с жесткой логикой:
 * - DataCollectorAgent - просто собирает данные
 * - IndustryClassifierAgent - просто классифицирует
 * - и т.д.
 * 
 * Для "думающих" агентов используй ThinkingAgent (с createAgent)
 */
export abstract class SimpleAgent {
  protected model: ChatOpenAI;
  protected agentName: string;

  constructor(agentName: string) {
    this.agentName = agentName;
    this.model = MODELS.main;
  }

  protected log(message: string, data?: any) {
    logger.info(`[${this.agentName}] ${message}`, data);
  }

  protected logError(message: string, error: any) {
    logger.error(`[${this.agentName}] ${message}`, error);
  }

  /**
   * Выполняет задачу с логированием времени выполнения
   */
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

