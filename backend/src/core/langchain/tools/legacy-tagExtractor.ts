import { z } from 'zod'
import { tool } from 'langchain'
import { rssService } from '../../services'
import { createModuleLogger } from '../../utils'

const logger = createModuleLogger('tagExtractorTool')

/**
 * LangChain Tool: извлечение тегов из статьи
 * 
 * Получает теги/категории для конкретной статьи.
 * Может быть использован для анализа тематики статей и поиска связанного контента.
 */
export const tagExtractorTool = tool(
    async ({ source, url }) => {
        try {
            logger.info({ source, url }, 'Tool tagExtractor вызван')

            // Проверяем поддержку источника
            if (!rssService.isSourceSupported(source)) {
                const available = rssService.getAvailableSources().join(', ')
                return `❌ Источник "${source}" не поддерживается. Доступные источники: ${available}`
            }

            // Получаем статью
            const article = await rssService.getArticleContent(source, url)

            if (!article.tags || article.tags.length === 0) {
                logger.info({ source, url, title: article.title }, 'Теги не найдены')
                return `⚠️ Теги для статьи "${article.title}" не найдены`
            }

            // Анализируем теги
            const tags = article.tags
            const primaryTag = tags[0] // Основной тег
            const relatedTags = tags.slice(1) // Связанные теги

            logger.info({ source, url, tagsCount: tags.length, primaryTag }, 'Теги извлечены')

            const result = `🏷️ Теги для статьи "${article.title}":

**Основная категория:** ${primaryTag}

${relatedTags.length > 0 ? `**Связанные темы:** ${relatedTags.join(', ')}` : ''}

**Всего тегов:** ${tags.length}
**Список:** ${tags.map(tag => `#${tag}`).join(' ')}

💡 Эти теги помогут найти похожие статьи на темы: ${tags.join(', ')}`

            return result

        } catch (error) {
            logger.error({ err: error, source, url }, 'Ошибка в tagExtractorTool')
            return `❌ Не удалось извлечь теги: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        }
    },
    {
        name: 'tag_extractor',
        description: `Извлекает теги и категории из статьи для анализа тематики.

Используй этот инструмент когда пользователь:
- Хочет узнать какие темы освещает статья
- Спрашивает о категориях или тегах статьи
- Ищет связанные темы для дальнейшего поиска
- Хочет понять основную направленность статьи

Параметры:
- source: источник статьи (habr, vcru). habr - Хабр, vcru - vc.ru
- url: полная ссылка на статью

Возвращает: список тегов и категорий статьи с указанием основной темы и связанных тем.`,
        schema: z.object({
            source: z.enum(['habr', 'vcru']).describe('Источник статьи: habr (Хабр), vcru (vc.ru)'),
            url: z.string().url().describe('Полная URL ссылка на статью'),
        }),
    }
)

