# Data API - Переключатель Mock/Real

## Быстрый старт

Переключение между mock данными и реальным PHP API делается **одной константой**:

**Файл:** `src/core/dataApi.ts`

```typescript
// ═══════════════════════════════════════════════════════════
// 🔧 КОНСТАНТА ДЛЯ ПЕРЕКЛЮЧЕНИЯ МЕЖДУ MOCK И REAL API
// ═══════════════════════════════════════════════════════════
const IS_MOCK = true; // Измени на false для использования реального API
// ═══════════════════════════════════════════════════════════
```

## Режимы работы

### 🔧 Mock Mode (по умолчанию)
```typescript
const IS_MOCK = true;
```
- Использует `src/mocks/dataApiMock.ts`
- Возвращает статичные тестовые данные
- Не требует запуска data-api сервиса
- Быстро, для разработки

### 🌐 Real API Mode
```typescript
const IS_MOCK = false;
```
- Использует `src/core/apiConnector.ts`
- Делает реальные HTTP запросы к PHP сервису
- Требует запуск data-api: `cd data-api && docker compose up`
- URL: `http://localhost:8100/api`

## Архитектура

```
src/core/dataApi.ts (единая точка входа)
    ├─ IS_MOCK = true  → src/mocks/dataApiMock.ts
    └─ IS_MOCK = false → src/core/apiConnector.ts
                              ↓
                     http://localhost:8100/api
```

## Где используется

Все места в коде импортируют из `dataApi.ts`:

### ✅ MarketResearcher Tools
- `tools/researchMarketFromDataApi.ts`
- `tools/getTechDemandFromDataApi.ts`

### ✅ DataCollector
- `agents/dataCollector/index.ts`

## API Методы

Доступны в обоих режимах:

```typescript
import { getRoles, getVacancyStats, getEmployers, getEmployerDetail } from './dataApi.js';

// GET /api/roles
const roles = await getRoles();

// GET /api/vacancies/stats/daily
const stats = await getVacancyStats({ days: 30 });

// GET /api/employers
const employers = await getEmployers({ limit: 100 });

// GET /api/employers/{id}
const employer = await getEmployerDetail(1);
```

## Запуск Real API

```bash
# Терминал 1: запусти data-api (PHP)
cd data-api
docker compose up

# Терминал 2: измени константу и запусти backend
# В src/core/dataApi.ts: const IS_MOCK = false;
cd backend
./dev.sh
```

## Конфигурация

**Переменная окружения** (опционально):
```env
# backend/.env
DATA_API_URL=http://localhost:8100/api
```

По умолчанию: `http://localhost:8100/api`

