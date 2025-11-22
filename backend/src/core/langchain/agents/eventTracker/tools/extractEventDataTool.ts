import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { logger } from '../../../../utils/logger.js';
import { MODELS } from '../../../shared/models.js';

/**
 * Event Data Schema
 */
export const EventDataSchema = z.object({
  eventName: z.string().describe('Название мероприятия'),
  eventType: z
    .enum(['conference', 'hackathon', 'investment_round', 'meetup', 'launch'])
    .describe('Тип мероприятия'),
  date: z.string().optional().describe('Дата проведения (если указана)'),
  location: z.string().optional().describe('Место проведения: онлайн/оффлайн/город'),
  description: z.string().optional().describe('Краткое описание мероприятия'),
  registrationLink: z.string().optional().describe('Ссылка на регистрацию'),
  organizer: z.string().optional().describe('Организатор мероприятия'),
  amount: z.string().optional().describe('Сумма инвестиций (для investment_round)'),
  investors: z.array(z.string()).optional().describe('Инвесторы (для investment_round)'),
});

export type EventData = z.infer<typeof EventDataSchema>;

/**
 * Tool: Извлечь данные о мероприятии из текста
 */
export const extractEventDataTool = tool(
  async ({ postText }) => {
    logger.info('[EventTracker] Extracting event data from post');

    const prompt = `Ты - эксперт по анализу объявлений о мероприятиях.
Проанализируй следующий текст и извлеки информацию о мероприятии.

Текст поста:
"${postText}"

Определи:
- eventName: название мероприятия
- eventType: тип (conference/hackathon/investment_round/meetup/launch)
- date: дата проведения (если указана)
- location: место проведения
- description: краткое описание
- registrationLink: ссылка на регистрацию (если есть)
- organizer: организатор (если указан)
- amount: сумма инвестиций (только для investment_round)
- investors: список инвесторов (только для investment_round)

ВАЖНО:
- Если это НЕ мероприятие (конференция/хакатон/инвестраунд/митап/запуск), верни { eventName: "NOT_AN_EVENT" }
- Для investment_round обязательно укажи amount и investors если они есть в тексте`;

    const structuredModel = MODELS.main.withStructuredOutput(EventDataSchema as any);

    try {
      const result = await structuredModel.invoke(prompt);
      
      // Фильтруем не-события
      if (result.eventName === 'NOT_AN_EVENT') {
        return JSON.stringify({ error: 'Not an event' });
      }

      logger.info('[EventTracker] Event data extracted successfully', {
        eventName: result.eventName,
        eventType: result.eventType,
      });
      
      return JSON.stringify(result);
    } catch (error) {
      logger.error('[EventTracker] Failed to extract event data:', error);
      return JSON.stringify({ error: 'Failed to parse event' });
    }
  },
  {
    name: 'extract_event_data',
    description: `Анализирует текст поста и извлекает структурированные данные о мероприятии.

Используй для:
- Парсинга объявлений о конференциях
- Парсинга хакатонов
- Парсинга инвестиционных раундов
- Парсинга митапов и запусков продуктов

Параметры:
- postText: текст поста для анализа

Возвращает: JSON с данными о событии или { error: "..." } если это не событие`,
    schema: z.object({
      postText: z.string().describe('Текст поста для анализа'),
    }),
  }
);

