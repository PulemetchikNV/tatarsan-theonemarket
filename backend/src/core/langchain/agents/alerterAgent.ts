import { BaseAgent } from './baseAgent.js';
import type { CompanyAnalysisResult } from '../../types/index.js';

/**
 * Alerter Agent
 * Генерирует персонализированные алерты:
 * - Критичные изменения (резкий рост/падение)
 * - Новые возможности для инвесторов
 * - Важные события компании
 * 
 * Для MVP: простая генерация сообщений на основе анализа
 */
export class AlerterAgent extends BaseAgent {
  constructor() {
    super('Alerter');
  }

  async generateAlerts(analysis: CompanyAnalysisResult): Promise<string[]> {
    return this.execute(async () => {
      this.log(`Generating alerts for: ${analysis.company.name}`);

      const alerts: string[] = [];

      // Health Score based alerts
      if (analysis.healthScore >= 80) {
        alerts.push(`🟢 Высокий Health Score (${analysis.healthScore}/100) - компания показывает отличные результаты`);
      } else if (analysis.healthScore < 50) {
        alerts.push(`🔴 Низкий Health Score (${analysis.healthScore}/100) - требует внимания`);
      }

      // Recommendation alerts
      if (analysis.recommendation === 'invest') {
        alerts.push(`💰 Рекомендация: ИНВЕСТИРОВАТЬ - ${analysis.reasoning}`);
      }

      // GitHub activity alerts
      if (analysis.dataCollector.githubData?.activity && analysis.dataCollector.githubData.activity > 200) {
        alerts.push(`🔥 Высокая активность в GitHub: ${analysis.dataCollector.githubData.activity} коммитов за месяц`);
      }

      // Vacancy growth alerts
      if (analysis.dataCollector.hhData && analysis.dataCollector.hhData.totalVacancies > 5) {
        alerts.push(`📈 Активный рост: ${analysis.dataCollector.hhData.totalVacancies} открытых вакансий`);
      }

      // Investment alerts
      if (analysis.eventTracker.investmentRounds.length > 0) {
        const latestRound = analysis.eventTracker.investmentRounds[0];
        alerts.push(`💸 Инвестиционный раунд: ${latestRound.type} - ${latestRound.amount || 'сумма не раскрыта'}`);
      }

      // Tech stack quality alerts
      if (analysis.analyzer.techStackQuality >= 80) {
        alerts.push(`⚡ Качественный tech stack (${analysis.analyzer.techStackQuality}/100)`);
      }

      return alerts;
    });
  }
}

export const alerterAgent = new AlerterAgent();

