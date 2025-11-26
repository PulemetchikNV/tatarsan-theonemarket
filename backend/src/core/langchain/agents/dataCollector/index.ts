import { BaseAgent } from '../baseAgent.js';
import { getRegionStatsTool } from './tools/index.js';

/**
 * DataCollectorAgent
 * 
 * Изолированный агент, который:
 * 1. Принимает запрос (например, "дай статистику по Татарстану")
 * 2. САМ решает использовать getRegionStatsTool
 * 3. Возвращает результат в формате JSON
 */
export class DataCollectorAgent extends BaseAgent {
  constructor() {
    const tools = [getRegionStatsTool];
    
    const systemPrompt = `
You are an expert Data Collector.
Your GOAL is to fetch market data using available tools based on user request.

RULES:
1. You must use the available tools to get real data. Do not invent data.
2. Return ONLY valid JSON as the final response. 
3. Do not add markdown formatting (like \`\`\`json), no intro, no outro. Just the raw JSON string.
4. If the tool returns data, output that data directly as JSON.
`;

    super('DataCollector', tools, systemPrompt);
  }

  /**
   * Основной метод запуска
   * @param query Запрос на сбор данных (например: "Собери статистику по рынку IT в Татарстане")
   */
  public async collect(query: string): Promise<any> {
    this.log('Processing data collection request', { query });

    try {
      // Агент думает и вызывает тулы
      const result = await this.invokeAgent(query);
      
      // Обработка результата в зависимости от формата ответа LangChain
      // Обычно result - это строка (output), но иногда объект { output: string }
      let outputText = typeof result === 'string' ? result : result?.output;

      if (!outputText) {
         return { error: "No output from agent", raw: result };
      }

      try {
        // Очистка от маркдауна если агент все-таки его добавил
        const cleanJson = outputText.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        // Если не удалось распарсить JSON, возвращаем структуру с сырым ответом
        // Это важно, чтобы вызывающий код не падал
        this.log('Response is not pure JSON, returning raw', { outputText });
        return { raw_response: outputText };
      }

    } catch (error) {
      this.logError('Failed to collect data', error);
      throw error;
    }
  }
}

// Экспортируем синглтон
export const dataCollectorAgent = new DataCollectorAgent();
