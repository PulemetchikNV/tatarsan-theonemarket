import { ThinkingAgent } from '../baseAgent.js';
import type { DataCollectorResult, EventTrackerResult, Event, InvestmentRound } from '../../../types/index.js';
import {
  getTelegramPostsTool,
  extractEventDataTool,
  type EventData,
} from './tools/index.js';

/**
 * Event Tracker Agent
 * 
 * ДУМАЮЩИЙ агент для отслеживания событий компаний.
 * САМ решает какие источники проверить и как обработать данные.
 * 
 * КОНТРАКТ:
 * Input:  companyName: string, collectedData: DataCollectorResult
 * Output: EventTrackerResult
 * 
 * Используется в:
 * - orchestrator (опционально, для полного анализа)
 * 
 * Tools:
 * - get_telegram_posts: получить посты из Telegram каналов (моки)
 * - extract_event_data: извлечь данные о событии из текста
 * 
 * События:
 * - Конференции, митапы, хакатоны
 * - Инвестиционные раунды
 * - Запуски продуктов
 * - Упоминания в новостях
 */
export class EventTrackerAgent extends ThinkingAgent {
  constructor() {
    super(
      'EventTracker',
      [getTelegramPostsTool, extractEventDataTool],
      `Ты - Event Tracker Agent, эксперт по отслеживанию событий IT-компаний.

Твоя задача: найти и структурировать информацию о событиях компании.

Доступные источники (tools):
1. get_telegram_posts - посты из Telegram каналов (tech_events_russia, startup_digest, tatarstan_tech)
2. extract_event_data - извлечь структурированные данные о событии из текста

Типы событий:
- conference: конференции
- hackathon: хакатоны
- meetup: митапы
- launch: запуски продуктов
- investment_round: инвестиционные раунды (seed, series A, etc)

Стратегия:
1. Используй get_telegram_posts для получения всех постов
2. Для каждого поста используй extract_event_data
3. Фильтруй события по релевантности к целевой компании
4. Разделяй события на:
   - recentEvents: прошедшие события (дата < сегодня)
   - upcomingEvents: предстоящие события (дата >= сегодня)
   - investmentRounds: инвестиционные раунды отдельно
5. Подсчитай newsCount - количество упоминаний компании

ВАЖНО:
- Фокусируйся на событиях связанных с целевой компанией
- Для investment_round обязательно извлекай amount и investors
- Если событие не связано с компанией - пропусти его
- Если дата не указана - считай событие "upcoming"

Финальный результат должен содержать:
- recentEvents: Event[]
- upcomingEvents: Event[]
- investmentRounds: InvestmentRound[]
- newsCount: number`
    );
  }

  /**
   * Отслеживает события для компании
   */
  async track(companyName: string, collectedData: DataCollectorResult): Promise<EventTrackerResult> {
    return this.execute(async () => {
      this.log(`Tracking events for: ${companyName}`);

      // Дополнительный контекст из собранных данных
      const contextInfo = {
        habrArticles: collectedData.habrData?.totalArticles || 0,
        githubActivity: collectedData.githubData?.activity || 0,
        vacancies: collectedData.hhData?.totalVacancies || 0,
      };

      // Вызываем AI агента - он сам решит как искать события
      const response = await this.invokeAgent(
        `Найди и структурируй события для компании "${companyName}".

Дополнительный контекст:
- Статей на Habr: ${contextInfo.habrArticles}
- GitHub активность: ${contextInfo.githubActivity} коммитов/месяц
- Открытых вакансий: ${contextInfo.vacancies}

Используй tools для поиска событий в Telegram каналах.
Верни структурированный список событий (recent, upcoming, investments).`
      );

      this.log('Event tracking completed', {
        responseLength: JSON.stringify(response).length,
      });

      // Парсим результат работы агента
      const result = this.parseAgentResponse(response, companyName, collectedData);

      return result;
    });
  }

  /**
   * Парсит ответ агента и формирует EventTrackerResult
   */
  private parseAgentResponse(
    response: any,
    companyName: string,
    collectedData: DataCollectorResult
  ): EventTrackerResult {
    this.log('Parsing event tracking response');

    // TODO: Правильный парсинг событий из LangChain response
    // Агент вызвал tools, нужно извлечь события из результатов

    // Временная логика - используем данные из Habr как proxy для newsCount
    const newsCount = collectedData.habrData?.totalArticles || 0;

    // Заглушка для MVP
    const result: EventTrackerResult = {
      recentEvents: [],
      upcomingEvents: [],
      investmentRounds: [],
      newsCount,
    };

    // Если есть GitHub активность - добавляем событие запуска
    if (collectedData.githubData && collectedData.githubData.totalRepos > 0) {
      result.recentEvents.push({
        type: 'launch',
        title: `${companyName} активен на GitHub`,
        date: new Date().toISOString(),
        description: `Компания поддерживает ${collectedData.githubData.totalRepos} репозиториев`,
      });
    }

    this.log(`Found ${result.recentEvents.length} recent events, ${result.upcomingEvents.length} upcoming events, ${result.investmentRounds.length} investment rounds`);

    return result;
  }
}

export const eventTrackerAgent = new EventTrackerAgent();

