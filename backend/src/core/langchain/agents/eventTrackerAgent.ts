import { BaseAgent } from './baseAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { DataCollectorResult, EventTrackerResult } from '../../types/index.js';

/**
 * Event Tracker Agent
 * Отслеживает события компании:
 * - Конференции, митапы, хакатоны
 * - Инвестиционные раунды
 * - Запуски продуктов
 * - Упоминания в новостях
 */
export class EventTrackerAgent extends SimpleAgent {
  private promptTemplate: ChatPromptTemplate;

  constructor() {
    super('EventTracker');
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Ты эксперт по отслеживанию событий IT-компаний. Анализируй активность и события компании.

На основе данных определи:
1. Recent Events - недавние события (конференции, митапы, запуски)
2. Upcoming Events - предстоящие события
3. Investment Rounds - инвестиционные раунды
4. News Count - количество упоминаний в новостях/статьях

Типы событий: conference, hackathon, meetup, launch, investment

Отвечай ТОЛЬКО в формате JSON:
{{
  "recentEvents": [
    {{"type": "conference", "title": "название", "date": "2024-11-20", "description": "описание"}},
    ...
  ],
  "upcomingEvents": [...],
  "investmentRounds": [
    {{"type": "seed", "amount": "$500K", "date": "2024-10-15", "investors": ["Investor1"]}},
    ...
  ],
  "newsCount": 10
}}`,
      ],
      [
        'user',
        `Отследи события для компании "{companyName}":

Статьи на Habr: {habrArticles}
GitHub активность: {githubActivity}
Вакансии: {vacancies}`,
      ],
    ]);
  }

  async track(companyName: string, collectedData: DataCollectorResult): Promise<EventTrackerResult> {
    return this.execute(async () => {
      this.log(`Tracking events for: ${companyName}`);

      const chain = this.promptTemplate.pipe(this.model);

      const response = await chain.invoke({
        companyName,
        habrArticles: JSON.stringify(collectedData.habrData?.articles || []),
        githubActivity: JSON.stringify(collectedData.githubData || {}),
        vacancies: collectedData.hhData?.totalVacancies || 0,
      });

      const result = this.parseResponse(response.content as string);
      return result;
    });
  }

  private parseResponse(content: string): EventTrackerResult {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonStr);

      return {
        recentEvents: parsed.recentEvents || [],
        upcomingEvents: parsed.upcomingEvents || [],
        investmentRounds: parsed.investmentRounds || [],
        newsCount: parsed.newsCount || 0,
      };
    } catch (error) {
      this.logError('Failed to parse event tracker response', error);
      return {
        recentEvents: [],
        upcomingEvents: [],
        investmentRounds: [],
        newsCount: 0,
      };
    }
  }
}

export const eventTrackerAgent = new EventTrackerAgent();

