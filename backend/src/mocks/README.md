# Mock APIs

Эта папка содержит моковые API для эмуляции внешних источников данных.

## Назначение

В MVP версии используются моки для быстрой разработки и тестирования агентов.
В будущем эти моки будут заменены на реальные парсеры (PHP Parser Service).

## Структура

### `hhMock.ts` - HH.ru API Mock
Эмулирует API HeadHunter для получения вакансий.

**Функции:**
- `fetchHHVacancies(companyName)` - получить вакансии компании
- `searchVacanciesBySkill(skill)` - поиск вакансий по навыку

**Возвращает:** `HHData` с вакансиями, средними зарплатами и требуемыми навыками

### `githubMock.ts` - GitHub API Mock
Эмулирует GitHub API для получения репозиториев.

**Функции:**
- `fetchGitHubRepos(companyName)` - получить репозитории компании
- `searchReposByLanguage(language)` - поиск репозиториев по языку

**Возвращает:** `GitHubData` с репозиториями, языками и статистикой активности

### `habrMock.ts` - Habr API Mock
Эмулирует API Habr для получения статей компании.

**Функции:**
- `fetchHabrArticles(companyName)` - получить статьи компании
- `searchArticlesByTag(tag)` - поиск статей по тегу

**Возвращает:** `HabrData` со статьями и топиками

### `marketMock.ts` - Market Research API Mock
Эмулирует API для рыночных исследований.

**Функции:**
- `fetchMarketResearch(companyName, industry?)` - получить рыночные данные
- `getTopTechnologies(limit?)` - топ технологий по спросу
- `getTechDemand(technology)` - спрос на конкретную технологию

**Возвращает:** `MarketResearcherResult` с трендами, спросом на технологии и анализом конкурентов

## Использование

### В агентах (прямое использование)

```typescript
import { fetchHHVacancies } from '../../../mocks/hhMock.js';

const hhData = await fetchHHVacancies('Таттелеком');
```

### В LangChain Tools (через tools)

```typescript
import { collectHHDataTool } from './tools/collectHHData.js';

// Tools автоматически используют моки и форматируют результат для LLM
```

## Данные

Моки содержат реалистичные данные для тестовых компаний:
- **Таттелеком** - телеком компания
- **Иннополис** - образовательная IT-компания
- **default** - универсальные данные для других компаний

## Roadmap

- [ ] Подключение реального HH.ru парсера (PHP)
- [ ] Подключение реального GitHub API
- [ ] Подключение реального Habr парсера
- [ ] Интеграция с внешними рыночными аналитическими сервисами

