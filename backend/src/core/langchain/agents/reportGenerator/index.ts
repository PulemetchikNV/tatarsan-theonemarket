import { ThinkingAgent } from '../baseAgent.js';
import type { CompanyAnalysisResult } from '../../../types/index.js';
import {
  getCardTool,
  getListTool,
  getChartTool,
  getSectionTool,
  getRecommendationTool,
} from './tools/index.js';
import { REPORT_GENERATOR_SYSTEM_PROMPT } from './prompts/index.js';

export class ReportGeneratorAgent extends ThinkingAgent {
  constructor() {
    super(
      'ReportGenerator',
      [
        getCardTool,
        getListTool,
        getChartTool,
        getSectionTool,
        getRecommendationTool,
      ],
      REPORT_GENERATOR_SYSTEM_PROMPT
    );
  }

  /**
   * Генерирует HTML отчет через AI агента
   * Агент САМ решает какие компоненты использовать
   * 
   * @param analysisJsonOrObject - JSON строка или объект с данными анализа (игнорируется, используем fallback)
   */
  async generateReport(marketDataJson: string): Promise<string> {
    return this.execute(async () => {
      // Вызываем AI агента - он сам решит какие компоненты использовать
      const response = await this.invokeAgent(
        `Создай ПОДРОБНЫЙ HTML отчет, информация о рынке - "${marketDataJson}".`
      );

      this.log('Report generation completed', { 
        responseLength: JSON.stringify(response).length 
      });

      // Парсим результат
      const htmlReport = response.messages.at(-1)?.content;
      
      return htmlReport;
    });
  }
}

export const reportGeneratorAgent = new ReportGeneratorAgent();

