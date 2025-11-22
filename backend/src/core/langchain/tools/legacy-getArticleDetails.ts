import { z } from 'zod'
import { tool } from '@langchain/core/tools'
import { rssService } from '../../services'
import { createModuleLogger } from '../../utils/logger'

const logger = createModuleLogger('getArticleDetailsTool')

/**
 * LangChain Tool: получение детальной информации о статье
 * 
 * Использует rssService для получения полного содержимого статьи по URL.
 */
export const getArticleDetailsTool = tool(
    async ({ source, url }) => {
        try {
            logger.info({ source, url }, 'Tool getArticleDetails вызван')

            // Проверяем поддержку источника
            if (!rssService.isSourceSupported(source)) {
                const available = rssService.getAvailableSources().join(', ')
                return `❌ Источник "${source}" не поддерживается. Доступные источники: ${available}`
            }

            // Получаем статью
            const article = await rssService.getArticleContent(source, url)

            // Форматируем детальную информацию
            const date = article.publishedAt.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })

            const result = `📖 **${article.title}**

✍️ Автор: ${article.author || 'Аноним'}
📅 Опубликовано: ${date}
🏷️ Теги: ${article.tags.join(', ')}
🔗 Ссылка: ${article.url}

${article.summary ? `📝 Краткое описание:\n${article.summary}\n\n` : ''}${article.content ? `📄 Полное содержание:\n${article.content}` : '⚠️ Полное содержание недоступно'}`

            return result

        } catch (error) {
            logger.error({ err: error }, 'Ошибка в getArticleDetailsTool')
            return `❌ Не удалось получить статью: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        }
    },
    {
        name: 'get_article_details',
        description: `Получает подробную информацию о конкретной статье, включая полное содержание.

Используй этот инструмент когда пользователь:
- Хочет узнать подробности о конкретной статье
- Просит рассказать содержание статьи
- Спрашивает "что в этой статье" или "о чем эта статья"
- Указывает URL статьи и хочет получить её содержание

Параметры:
- source: источник статьи (habr, vcru). habr - Хабр, vcru - vc.ru
- url: полная ссылка на статью

Возвращает: детальную информацию о статье с полным содержанием, автором, датой, тегами.`,
        schema: z.object({
            source: z.enum(['habr', 'vcru']).describe('Источник статьи: habr (Хабр), vcru (vc.ru)'),
            url: z.string().url().describe('Полная URL ссылка на статью'),
        }),
    }
)

