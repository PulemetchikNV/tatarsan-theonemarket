# Dashboard Flow - БЕЗ компаний

## Проблема

Раньше dashboard анализировал конкретные компании через `analyzeRegion()`, но в `dataApiMock` нет компаний - там есть **работодатели** (employers), вакансии, роли.

## Решение

Создан новый flow для dashboard который работает через **marketResearcher** БЕЗ привязки к компаниям.

## Архитектура

```
GET /api/v1/dashboard
  ↓
server.ts → orchestratorAgent.analyzeDashboard('Татарстан')
  ↓
orchestrator → marketResearcherAgent.analyzeRegion('Татарстан')
  ↓
marketResearcher → AI агент использует tools:
  ├─ research_market_from_data_api (days=30)
  │  └─ Получает: работодателей, вакансии, роли, тренды
  │
  └─ get_top_technologies_from_data_api (limit=15)
     └─ Получает: топ технологий по спросу
  ↓
Результат возвращается в server.ts
  ↓
server.ts формирует HTML дашборда с:
  - Количество работодателей
  - Открытые вакансии
  - Средняя зарплата
  - Тренд рынка
  - Топ работодатели
  - Топ технологии
  - Рыночные тренды
```

## Изменения

### 1. orchestrator/index.ts

**Добавлен метод:**
```typescript
async analyzeDashboard(region: string = 'Татарстан')
```

- Вызывает `marketResearcherAgent.analyzeRegion()` напрямую
- НЕ использует `analyzeCompany()` и НЕ работает с компаниями
- Возвращает сырые данные от marketResearcher для обработки

### 2. marketResearcher/index.ts

**Добавлен метод:**
```typescript
async analyzeRegion(region: string = 'Татарстан')
```

- Вызывает AI агента для исследования рынка региона
- Агент САМ использует tools:
  - `research_market_from_data_api` - общая картина рынка
  - `get_top_technologies_from_data_api` - топ технологий
- Возвращает результат работы агента

### 3. server.ts

**Обновлен endpoint:**
```typescript
GET /api/v1/dashboard
```

- Вызывает `orchestratorAgent.analyzeDashboard()` вместо `analyzeRegion()`
- Формирует HTML дашборд на основе рыночных данных (НЕ компаний)
- Показывает:
  - Работодателей в регионе (не компании)
  - Открытые вакансии
  - Топ работодатели по вакансиям
  - Топ технологии по спросу
  - Рыночные тренды

## Data API Mock

Используется `dataApiMock.ts`:

```typescript
getRoles()              // Роли (Developer, QA, DevOps, etc)
getVacancyStats()       // Статистика вакансий за период
getEmployers()          // Список работодателей
getEmployerDetail()     // Детали работодателя с вакансиями
```

## Результат

✅ Dashboard работает через агенты БЕЗ привязки к компаниям  
✅ Все данные получаются из data-api mock  
✅ MarketResearcher использует свои tools для исследования рынка  
✅ Orchestrator координирует процесс через агентов  

## Тестирование

```bash
# Запустить backend
cd backend && ./dev.sh

# Тестировать dashboard
curl -X GET http://localhost:3000/api/v1/dashboard | jq

# Смотреть логи
docker compose logs -f
```

## Логи работы

```
[Orchestrator] 📊 Starting dashboard analysis for region: Татарстан
[MarketResearcher] Analyzing market for region: Татарстан
[MarketResearcher] Invoking agent
researchMarketFromDataApi 🔍 Researching market from data-api
researchMarketFromDataApi ✅ Market research completed
getTechDemandFromDataApi 🔍 Getting top technologies from data-api
getTechDemandFromDataApi ✅ Top technologies retrieved
[MarketResearcher] Region market analysis completed
[Orchestrator] Dashboard market research completed
✅ Dashboard response sent (market analysis via AI)
```

## TODO

- [ ] Парсинг результата работы AI агента (сейчас mock данные в server.ts)
- [ ] Добавить кеширование результатов анализа
- [ ] Добавить параметр `region` в query params
- [ ] Добавить фильтры по дням (days parameter)

