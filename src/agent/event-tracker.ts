import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { logger } from "../utils/logger";
import * as dotenv from "dotenv";

dotenv.config();

// Event Data Schema
export const EventDataSchema = z.object({
    eventName: z.string().describe("Название мероприятия"),
    eventType: z.enum(["conference", "hackathon", "investment_round"])
        .describe("Тип мероприятия: конференция, хакатон или инвестраунд"),
    date: z.string().optional().describe("Дата проведения (если указана)"),
    location: z.string().optional().describe("Место проведения: онлайн/оффлайн/город"),
    description: z.string().optional().describe("Краткое описание мероприятия"),
    registrationLink: z.string().optional().describe("Ссылка на регистрацию"),
    organizer: z.string().optional().describe("Организатор мероприятия"),
});

export type EventData = z.infer<typeof EventDataSchema>;

// Mock Telegram channels data
const MOCK_TG_POSTS = [
    {
        channel: "tech_events_russia",
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
        channel: "startup_digest",
        posts: [
            `Конференция "Стартапы и Инновации" - 10 февраля, СПб
Спикеры из Сбера, VK, Тинькофф
Билеты: https://startup-conf.ru`,
        ],
    },
];

// Tool 1: Get Telegram Posts (Mocked)
export const getTelegramPostsTool = tool(
    async ({ channelName }: { channelName?: string }) => {
        logger.info(`Fetching posts from Telegram channels...`);

        if (channelName) {
            const channel = MOCK_TG_POSTS.find(ch => ch.channel === channelName);
            if (channel) {
                return JSON.stringify({ channel: channel.channel, posts: channel.posts });
            }
            return JSON.stringify({ error: "Channel not found" });
        }

        // Return all posts from all channels
        const allPosts = MOCK_TG_POSTS.flatMap(ch =>
            ch.posts.map(post => ({ channel: ch.channel, text: post }))
        );

        return JSON.stringify({ totalPosts: allPosts.length, posts: allPosts });
    },
    {
        name: "get_telegram_posts",
        description: "Получить посты из Telegram каналов (замокированные данные). Можно указать конкретный канал или получить все посты.",
        schema: z.object({
            channelName: z.string().optional().describe("Название канала (опционально)"),
        }),
    }
);

// Tool 2: Extract Event Data (using LLM)
export const extractEventDataTool = tool(
    async ({ postText }: { postText: string }) => {
        logger.info("Extracting event data from post...");

        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0,
        });

        const prompt = `Ты - эксперт по анализу объявлений о мероприятиях.
Проанализируй следующий текст и извлеки информацию о мероприятии.

Текст поста:
"${postText}"

Определи:
- eventName: название мероприятия
- eventType: тип (conference/hackathon/investment_round)
- date: дата проведения (если указана)
- location: место проведения
- description: краткое описание
- registrationLink: ссылка на регистрацию (если есть)
- organizer: организатор (если указан)

Если это НЕ мероприятие (конференция/хакатон/инвестраунд), верни null.`;

        const structuredModel = model.withStructuredOutput(EventDataSchema);

        try {
            const result = await structuredModel.invoke(prompt);
            logger.info("Event data extracted successfully");
            return JSON.stringify(result);
        } catch (error) {
            logger.error("Failed to extract event data:", error);
            return JSON.stringify({ error: "Failed to parse event" });
        }
    },
    {
        name: "extract_event_data",
        description: "Анализирует текст поста и извлекает структурированные данные о мероприятии (конференция, хакатон, инвестраунд)",
        schema: z.object({
            postText: z.string().describe("Текст поста для анализа"),
        }),
    }
);

// Event Tracker Agent
export class EventTrackerAgent {
    private model: ChatGoogleGenerativeAI;
    private tools: any[];

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0,
        });

        this.tools = [getTelegramPostsTool, extractEventDataTool];
    }

    async trackEvents(): Promise<EventData[]> {
        logger.info("Starting event tracking...");

        // 1. Get all posts from Telegram
        const postsResult = await getTelegramPostsTool.invoke({});
        const { posts } = JSON.parse(postsResult);

        const events: EventData[] = [];

        // 2. Extract event data from each post
        for (const post of posts) {
            try {
                const eventResult = await extractEventDataTool.invoke({ postText: post.text });
                const eventData = JSON.parse(eventResult);

                if (eventData && !eventData.error) {
                    events.push(eventData);
                }
            } catch (error) {
                logger.error(`Failed to process post from ${post.channel}:`, error);
            }
        }

        logger.info(`Found ${events.length} events`);
        return events;
    }

    getTools() {
        return this.tools;
    }
}
