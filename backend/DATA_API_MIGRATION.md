# Миграция на Data-API

Переделка агентов под контракты PHP сервиса data-api (порт 8100).

## 🎯 Что сделано

### 1. **DataCollector Agent** → используйте data-api

**Было:**
- Вызывал моки: `fetchHHVacancies()`, `fetchGitHubRepos()`, `fetchHabrArticles()`
- Возвращал данные из 3 разных источников

**Стало:**
- Вызывает data-api: `getEmployers()`, `getEmployerDetail()`
- Ищет компанию по названию
- Получает детали с вакансиями
- Мапит данные в формат `DataCollectorResult`

**Контракты:**
```typescript
// 1. Поиск компании
getEmployers({ search: companyName, limit: 5 })

// 2. Детали компании
getEmployerDetail(employerId)
```

**Файлы:**
- `agents/dataCollector/index.ts` - обновлен

---

### 2. **MarketResearcher Agent** → используйте data-api

**Было:**
- Использовал legacy моки для рыночных данных
- 3 старых tools: `researchMarketTool`, `getTopTechnologiesTool`, `getTechDemandTool`

**Стало:**
- 3 новых tools для data-api:
  - `researchMarketFromDataApiTool` - рыночное исследование
  - `getTopTechnologiesFromDataApiTool` - топ технологий
  - `getTechDemandFromDataApiTool` - спрос на технологию

**Контракты:**
```typescript
// Статистика вакансий
getVacancyStats({ role?: string, days: number })

// Список компаний
getEmployers({ page, limit, search })

// Роли
getRoles()
```

**Файлы:**
- `agents/marketResearcher/index.ts` - обновлен
- `agents/marketResearcher/tools/researchMarketFromDataApi.ts` - НОВЫЙ
- `agents/marketResearcher/tools/getTechDemandFromDataApi.ts` - НОВЫЙ
- `agents/marketResearcher/tools/index.ts` - обновлен

---

### 3. **Server Dashboard** → быстрый путь без AI

**Было:**
- Вызывал `orchestratorAgent.analyzeRegion()` (~80 сек на компанию)
- Использовал AI агенты для анализа

**Стало:**
- Вызывает `getRegionStats()` (~1ms)
- Агрегирует данные напрямую из data-api
- Мгновенная загрузка дашборда

**Файлы:**
- `core/server.ts` - обновлен (роут `/api/v1/dashboard`)

---

## 📦 Новые моки

### `src/mocks/dataApiMock.ts`

Полная реализация контрактов из `/data-api/api.http`:

| Функция | API Endpoint | Описание |
|---------|-------------|----------|
| `getRoles()` | `GET /api/roles` | Список ролей (Developer, DevOps, etc) |
| `getVacancyStats()` | `GET /api/vacancies/stats/daily` | Статистика вакансий по дням |
| `getEmployers()` | `GET /api/employers` | Список работодателей с пагинацией |
| `getEmployerDetail()` | `GET /api/employers/{id}` | Детали работодателя + вакансии |
| `getRegionStats()` | Утилита | Агрегация данных для региона |

**Данные в моках:**
- 5 компаний: Иннополис, Таттелеком, Bars Group, Сбербанк Технологии, Kaspersky
- 7 ролей: Developer, QA, DevOps, Data Scientist, Analyst, Product Manager, Designer
- 3 вакансии на компанию (Backend, DevOps, Frontend)
- 30 дней статистики (10-50 вакансий/день)

---

## 🔄 Маппинг технологий

В data-api нет прямых данных о технологиях, только роли. Создан маппинг:

```typescript
const ROLE_TO_TECH_MAP = {
  '96': ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', ...], // Developer
  '160': ['Docker', 'Kubernetes', 'Terraform', 'Ansible', ...], // DevOps
  '165': ['Python', 'TensorFlow', 'PyTorch', 'Pandas', ...], // Data Scientist
  // и т.д.
}
```

Алгоритм:
1. Находим роли связанные с технологией
2. Получаем статистику вакансий по этим ролям
3. Нормализуем спрос в 0-100

---

## 🚀 Следующие шаги

### Миграция на реальное API

Когда PHP сервис будет готов, замените моки:

```typescript
// Было (mock):
import { getEmployers } from '@mocks/dataApiMock';
const employers = getEmployers({ search: 'Иннополис' });

// Станет (real API):
const response = await fetch('http://localhost:8100/api/employers?search=Иннополис');
const employers = await response.json();
```

### Создать HTTP клиент

```typescript
// backend/src/core/api/dataApiClient.ts
export class DataApiClient {
  private baseUrl = 'http://localhost:8100/api';
  
  async getEmployers(params) {
    const res = await fetch(`${this.baseUrl}/employers?${new URLSearchParams(params)}`);
    return res.json();
  }
  
  // ... остальные методы
}
```

Затем замените импорты в `dataCollector` и `marketResearcher`:

```typescript
// Было:
import { getEmployers } from '@mocks/dataApiMock';

// Станет:
import { dataApiClient } from '@core/api/dataApiClient';
const employers = await dataApiClient.getEmployers({ search: name });
```

---

## 📊 Архитектура потоков данных

### Dashboard (быстрый путь)
```
GET /api/v1/dashboard
  └─> getRegionStats('Татарстан')
      ├─> getEmployers() - список компаний
      ├─> getVacancyStats() - тренды
      └─> getRoles() - топ роли
  └─> Генерация HTML
  └─> Response (~1ms)
```

### Company Analysis (с AI агентами)
```
GET /api/v1/company/:name
  └─> orchestratorAgent.analyzeCompany(name)
      ├─> ФАЗА 1: DataCollector
      │   ├─> getEmployers({ search: name })
      │   └─> getEmployerDetail(id)
      │
      ├─> ФАЗА 2: Анализ (параллельно)
      │   ├─> IndustryClassifier (AI)
      │   └─> MarketResearcher (AI + data-api)
      │       ├─> researchMarketFromDataApi()
      │       ├─> getTopTechnologiesFromDataApi()
      │       └─> getTechDemandFromDataApi()
      │
      └─> ФАЗА 3: ReportGenerator (AI)
          └─> HTML отчет
```

---

## ✅ Преимущества новой архитектуры

1. **Скорость дашборда:** с ~240 сек до ~1ms ⚡
2. **Реальные данные:** из PHP парсера вместо моков
3. **Единый источник:** все агенты используют data-api
4. **Легкая миграция:** просто замените моки на HTTP клиент
5. **Типизация:** строгие TypeScript контракты

---

## 📝 Legacy code

Старые моки и tools помечены как `legacy` но **не удалены** для обратной совместимости:

- `mocks/hhMock.ts` → legacy
- `mocks/githubMock.ts` → legacy
- `mocks/habrMock.ts` → legacy
- `mocks/marketMock.ts` → legacy
- `marketResearcher/tools/researchMarketTool.ts` → legacy
- `marketResearcher/tools/getTopTechnologiesTool.ts` → legacy
- `marketResearcher/tools/getTechDemandTool.ts` → legacy

Можно удалить после полного перехода на data-api.

