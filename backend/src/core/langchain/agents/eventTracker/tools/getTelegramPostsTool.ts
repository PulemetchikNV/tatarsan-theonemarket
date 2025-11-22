import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { logger } from '../../../../utils/logger.js';

/**
 * Mock Telegram channels data
 * TODO: Заменить на реальный API Telegram
 */
const MOCK_TG_POSTS = [
  {
    channel: 'tech_events_russia',
    posts: [
      `📅 20-25 декабря состоится конференция TechCrunch Disrupt в Москве.
Главные темы: AI, Web3, стартапы.
Регистрация: https://techcrunch.com/disrupt`,
      `🚀 Хакатон по AI и ML от Яндекса!
Даты: 15-17 января 2025
Локация: Онлайн
Призовой фонд: 500 000 ₽
Регистрация до 10 января: https://yandex.ru/hackathon`,
      `💰 Акселератор GenerationS открывает новый инвестраунд!
Прием заявок до 1 февраля 2025
Инвестиции: до $100k для стартапов
Подробнее: https://generations.ru/invest`,
    ],
  },
  {
    channel: 'startup_digest',
    posts: [
      `Конференция "Стартапы и Инновации" - 10 февраля, СПб
Спикеры из Сбера, VK, Тинькофф
Билеты: https://startup-conf.ru`,
      `💼 Seed раунд на $2M для EdTech стартапа "Учи.ру"
Инвесторы: Runa Capital, ФРИИ
Дата: 15 ноября 2024`,
    ],
  },
  {
    channel: 'tatarstan_tech',
    posts: [
      `🎉 IT-Park Kazan проводит хакатон по блокчейну!
Даты: 5-7 декабря 2024
Призовой фонд: 300 000 ₽
Место: Иннополис, офлайн
Регистрация: https://itpark.tech/hackathon`,
      `📢 Конференция "Цифровой Татарстан" - 1 марта 2025
Место: Казань, IT-Park
Бесплатная регистрация до 20 февраля`,
    ],
  },
];

/**
 * Tool: Получить посты из Telegram каналов
 */
export const getTelegramPostsTool = tool(
  async ({ channelName }) => {
    logger.info(`[EventTracker] Fetching Telegram posts${channelName ? ` from ${channelName}` : ''}`);

    if (channelName) {
      const channel = MOCK_TG_POSTS.find((ch) => ch.channel === channelName);
      if (channel) {
        return JSON.stringify({ channel: channel.channel, posts: channel.posts });
      }
      return JSON.stringify({ error: 'Channel not found' });
    }

    // Return all posts from all channels
    const allPosts = MOCK_TG_POSTS.flatMap((ch) =>
      ch.posts.map((post) => ({ channel: ch.channel, text: post }))
    );

    logger.info(`[EventTracker] Found ${allPosts.length} posts`);
    return JSON.stringify({ totalPosts: allPosts.length, posts: allPosts });
  },
  {
    name: 'get_telegram_posts',
    description: `Получить посты из Telegram каналов (замокированные данные).

Используй для:
- Поиска объявлений о конференциях
- Поиска хакатонов
- Поиска инвестиционных раундов
- Отслеживания новостей о компаниях

Параметры:
- channelName: название канала (опционально, если не указан - вернет все посты)

Доступные каналы:
- tech_events_russia
- startup_digest
- tatarstan_tech

Возвращает: JSON с постами`,
    schema: z.object({
      channelName: z.string().optional().describe('Название канала (опционально)'),
    }),
  }
);

