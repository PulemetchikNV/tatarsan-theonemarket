import { BaseAgent } from './baseAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { DataCollectorResult, MarketResearcherResult } from '../../types/index.js';

/**
 * Market Researcher Agent
 * Исследует рынок и тренды:
 * - Анализ трендов технологий
 * - Спрос на специалистов
 * - Динамика зарплат
 * - Конкурентный анализ
 * - Оценка потенциала роста
 */
export class MarketResearcherAgent extends BaseAgent {
  private promptTemplate: ChatPromptTemplate;

  constructor() {
    super('MarketResearcher');
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Ты эксперт по исследованию IT-рынка Татарстана. Анализируй рыночные тренды и спрос на технологии.

Оцени:
1. Market Trends - ключевые тренды рынка (3-5 пунктов)
2. Demand For Tech - спрос на каждую технологию (баллы 0-100)
3. Competitor Analysis - краткий анализ конкурентной среды
4. Growth Potential - потенциал роста компании (0-100)

Отвечай ТОЛЬКО в формате JSON:
{{
  "marketTrends": ["тренд1", "тренд2", ...],
  "demandForTech": {{"TypeScript": 85, "React": 90, ...}},
  "competitorAnalysis": "краткий анализ",
  "growthPotential": 75
}}`,
      ],
      [
        'user',
        `Проанализируй рыночную ситуацию для компании "{companyName}":

Tech Stack компании: {techStack}
Вакансии на рынке: {marketVacancies}
Средние зарплаты: {salaries}
Активность в GitHub: {githubActivity}`,
      ],
    ]);
  }

  async research(companyName: string, collectedData: DataCollectorResult): Promise<MarketResearcherResult> {
    return this.execute(async () => {
      this.log(`Researching market for: ${companyName}`);

      const chain = this.promptTemplate.pipe(this.model);

      const response = await chain.invoke({
        companyName,
        techStack: JSON.stringify(collectedData.hhData?.requiredSkills || []),
        marketVacancies: collectedData.hhData?.totalVacancies || 0,
        salaries: collectedData.hhData?.avgSalary || 0,
        githubActivity: collectedData.githubData?.activity || 0,
      });

      const result = this.parseResponse(response.content as string);
      return result;
    });
  }

  private parseResponse(content: string): MarketResearcherResult {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonStr);

      return {
        marketTrends: parsed.marketTrends || [],
        demandForTech: parsed.demandForTech || {},
        competitorAnalysis: parsed.competitorAnalysis || 'Недостаточно данных',
        growthPotential: parsed.growthPotential || 50,
      };
    } catch (error) {
      this.logError('Failed to parse market research response', error);
      return {
        marketTrends: ['Недостаточно данных для анализа'],
        demandForTech: {},
        competitorAnalysis: 'Недостаточно данных',
        growthPotential: 50,
      };
    }
  }
}

export const marketResearcherAgent = new MarketResearcherAgent();

