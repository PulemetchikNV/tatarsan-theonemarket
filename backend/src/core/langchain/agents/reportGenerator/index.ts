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
import { MODELS } from '../../shared/models.js';
import { ROLES } from '../../../const.js';

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
      REPORT_GENERATOR_SYSTEM_PROMPT,
      MODELS.reportGenerator
    );
  }

  /**
   * Генерирует HTML отчет через AI агента
   * Агент САМ решает какие компоненты использовать
   * 
   * @param analysisJsonOrObject - JSON строка или объект с данными анализа (игнорируется, используем fallback)
   */
  async generateReport(marketDataJson: string, role: keyof typeof ROLES): Promise<string> {
    return this.execute(async () => {
      // Вызываем AI агента - он сам решит какие компоненты использовать
      const roleData = ROLES[role];
      const userRoleDescription = `
        <userRole description="Роль пользователя, для которого генерируется отчет">
          ${roleData?.name}
        </userRole>
        <htmlRequirements description="ОБЯЗАТЕЛЬНО СФОКУСИРОВАТЬСЯ В ИТОГОВОМ ОТЧЕТЕ НА ЭТОЙ ИНФОРМАЦИИ">
          ${roleData?.neededStatistics}
        </htmlRequirements>
      `
      const response = await this.invokeAgent(
        `
        <goal>
          Создай ПОДРОБНЫЙ HTML отчет, основываясь на информации о рынке (marketDataJson)".
        </goal>
        ${roleData && userRoleDescription}
        <marketDataJson>
          ${marketDataJson}
        </marketDataJson>
        `
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
