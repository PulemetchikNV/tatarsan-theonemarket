import { EventEmitter } from 'events';
import { ThinkingAgent } from '../baseAgent.js';
import { collectDataTool } from './tools/collectDataTool.js';
import { generateReportTool } from './tools/generateReportTool.js';
import { FINAL_SYSTEM_PROMPT, CREATE_DASHBOARD_INVOKE_PROMPT } from './prompts/index.js';

// Увеличиваем лимит слушателей для множественных tool вызовов
EventEmitter.defaultMaxListeners = 20;

export class OrchestratorAgent extends ThinkingAgent {
  constructor() {
    super(
      'Orchestrator',
      [
        // Единственный инструмент - это доступ к субагенту DataCollector
        collectDataTool,
        generateReportTool,
      ],
      FINAL_SYSTEM_PROMPT
    );
  }

  async analyzeDashboard(region: string = 'Татарстан'): Promise<{ htmlComponents: string; totalHealthScore: number }> {
    return this.execute(async () => {
      this.log(`📊 Starting dashboard analysis for region: ${region}`);

      // Формируем запрос для оркестратора
      // Он должен понять, что нужно использовать collect_market_data с запросом "Собери данные по региону X"
      const userQuery = CREATE_DASHBOARD_INVOKE_PROMPT(region);
      
      const agentResponseRaw = await this.invokeAgent(userQuery);
      
      // Получаем финальный ответ (предполагается JSON с HTML компонентами)
      // Обработка зависит от того, возвращает ли invokeAgent строку или объект с messages
      let agentResponse: any;
      
      if (agentResponseRaw && typeof agentResponseRaw === 'object' && 'output' in agentResponseRaw) {
          agentResponse = agentResponseRaw.output;
      } else if (agentResponseRaw && typeof agentResponseRaw === 'object' && 'messages' in agentResponseRaw) {
          agentResponse = agentResponseRaw.messages.at(-1)?.content;
      } else {
          agentResponse = agentResponseRaw;
      }

      this.log('Orchestrator finished thinking');

      // Парсинг результата (JSON -> Object)
      let result: { htmlComponents: string; totalHealthScore: number, rawResponse: any };
      
      try {
        let outputText = typeof agentResponse === 'string' ? agentResponse : JSON.stringify(agentResponse);
        
        // Очистка от маркдауна
        outputText = outputText.replace(/```json\n?|\n?```/g, '').trim();
        
        // Попытка парсинга
        if (outputText.startsWith('{')) {
             result = JSON.parse(outputText);
        } else {
             // Если вернул не JSON, а просто текст
             this.log('Response is not JSON', { outputText });
             throw new Error('Agent returned non-JSON response');
        }

        // Базовая валидация структуры
        if (!result.htmlComponents) {
           result = {
               htmlComponents: `<div class="error">Incomplete data received from agent.</div>`,
               totalHealthScore: 0,
               rawResponse: agentResponse
           };
        }
        
        // Сохраняем сырой ответ для отладки
        result.rawResponse = agentResponse;

      } catch (error) {
        this.logError('Failed to parse Orchestrator response', error);
        // Fallback
        result = {
          htmlComponents: typeof agentResponse === 'string' 
            ? `<div class="raw-response">${agentResponse}</div>` 
            : `<div class="error">Error processing request.</div>`,
          totalHealthScore: 0,
          rawResponse: agentResponse,
        };
      }

      return result;
    });
  }
}

export const orchestratorAgent = new OrchestratorAgent();
