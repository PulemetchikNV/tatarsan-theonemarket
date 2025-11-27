import { createAgent } from 'langchain';
import type { Tool } from 'langchain';
import { MODELS } from '../shared/models.js';
import { logger } from '../../utils/logger.js';
import z from 'zod';

/**
 * Базовый класс для "думающих" агентов с LangChain tools
 * 
 * ИСПОЛЬЗУЙ ЭТОТ КЛАСС для агентов которые должны САМИ принимать решения:
 * - MarketResearcherAgent - исследует рынок, сам выбирает какие данные собрать
 * - AnalyzerAgent - анализирует компанию, сам решает что анализировать
 * - OrchestratorAgent - координирует других агентов
 * 
 * Для простых агентов без AI используй SimpleAgent
 * 
 * Как работает:
 * 1. Получают список инструментов (tools)
 * 2. Имеют system prompt с инструкциями
 * 3. САМИ решают какие инструменты использовать
 * 4. Могут делать несколько вызовов инструментов
 * 5. Рассуждают и принимают решения
 */
export abstract class ThinkingAgent {
  protected agent: ReturnType<typeof createAgent>; // LangChain agent executor
  protected agentName: string;

  constructor(
    agentName: string,
    tools: Tool[],
    systemPrompt: string,
    model = MODELS.main
  ) {
    this.agentName = agentName;
    
    // Создаем агента с инструментами через LangChain
    this.agent = createAgent({
      model,
      tools,
      systemPrompt,
      contextSchema: z.object({
        role: z.string().optional(),
        query: z.string().optional(),
      })
    });

    this.log('Thinking Agent initialized', { toolsCount: tools.length });
  }

  protected log(message: string, data?: any) {
    logger.info(`[${this.agentName}] ${message}`, data);
  }

  protected logError(message: string, error: any) {
    logger.error(`[${this.agentName}] ${message}`, error);
  }

  /**
   * Выполняет задачу с логированием
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

  /**
   * Вызывает LangChain агента с сообщением
   * 
   * Агент:
   * - Читает сообщение
   * - Решает какие tools использовать
   * - Вызывает tools
   * - Анализирует результаты
   * - Формирует ответ
   * 
   * Это АВТОНОМНОЕ принятие решений!
   */
  protected async invokeAgent(userMessage: string, context?: Record<string, any>): Promise<ReturnType<typeof this.agent.invoke>> {
    this.log('Invoking agent', { message: userMessage.substring(0, 100) });
    
    const response = await this.agent.invoke(
      {
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        // Настройки для LangSmith
        // Это сделает трейсы в дэшборде красивыми и понятными
        runName: `${this.agentName} Run`,
        metadata: {
          agent_name: this.agentName,
          timestamp: Date.now(),
        },
        context,
      }
    );

    return response;
  }
}

// Экспортируем как BaseAgent для обратной совместимости
export { ThinkingAgent as BaseAgent };
