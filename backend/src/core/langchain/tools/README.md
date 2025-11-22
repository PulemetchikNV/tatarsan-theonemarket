# LangChain Tools

Эта папка содержит LangChain Tools для агентов с доступом к инструментам.

## Структура

### Data Collection Tools

Инструменты для сбора данных о компаниях:

#### `collectHHData.ts`
- `collectHHDataTool` - сбор вакансий с HH.ru
- `searchVacanciesBySkillTool` - поиск вакансий по навыку

#### `collectGitHubData.ts`
- `collectGitHubDataTool` - сбор репозиториев с GitHub
- `searchReposByLanguageTool` - поиск репозиториев по языку

#### `collectHabrData.ts`
- `collectHabrDataTool` - сбор статей компании с Habr
- `searchArticlesByTagTool` - поиск статей по тегу

### Market Research Tools

Инструменты для рыночных исследований:

#### `researchMarket.ts`
- `researchMarketTool` - проведение рыночного исследования
- `getTopTechnologiesTool` - получение топ технологий по спросу
- `getTechDemandTool` - получение спроса на конкретную технологию

## Legacy Tools

Старые инструменты с префиксом `legacy-` будут переработаны позже:
- `legacy-newPosts.ts` - получение RSS постов
- `legacy-getArticleDetails.ts` - детали статьи
- `legacy-summarizeFeed.ts` - суммаризация ленты
- `legacy-tagExtractor.ts` - извлечение тегов

## Использование

### В LangChain Agent

```typescript
import { collectHHDataTool, collectGitHubDataTool } from './tools/index.js';

const agent = createReactAgent({
  llm: model,
  tools: [collectHHDataTool, collectGitHubDataTool],
  prompt,
});
```

### Конвенции

Все tools следуют единому паттерну:

1. **Импорты:**
   - `z` из `zod` для схемы
   - `tool` из `@langchain/core/tools`
   - Функции из моков (`/mocks/`)
   - Логгер из `utils/logger`

2. **Структура:**
   ```typescript
   export const myTool = tool(
     async ({ param1, param2 }) => {
       // Логика инструмента
       // Форматированный результат для LLM (текст с эмодзи)
     },
     {
       name: 'my_tool',
       description: 'Детальное описание для LLM когда использовать',
       schema: z.object({
         param1: z.string().describe('Описание параметра'),
       }),
     }
   );
   ```

3. **Форматирование результата:**
   - Использовать эмодзи для визуальной структуры
   - Четкое разделение секций
   - Читаемые даты (`.toLocaleDateString('ru-RU')`)
   - Числа с разделителями (`.toLocaleString('ru-RU')`)

4. **Обработка ошибок:**
   - Try-catch блоки
   - Логирование через logger
   - Понятные сообщения об ошибках для LLM

## Roadmap

- [ ] Добавить tools для LinkedIn данных
- [ ] Добавить tools для Event Tracking
- [ ] Переработать legacy tools
- [ ] Добавить tools для работы с БД (Prisma)

