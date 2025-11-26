# 🎯 IT-Пульс Татарстана - Финальная структура Backend

## ✨ Чистая архитектура (старый код удален!)

```
backend/
├── package.json              ✅ Dependencies
├── tsconfig.json             ✅ TypeScript config
├── Dockerfile                ✅ Container
├── env.example               ✅ Environment variables
├── .gitignore                ✅ Git ignore
├── README.md                 ✅ Documentation
│
└── src/
    ├── index.ts              ✅ Entry point
    │
    └── core/
        ├── server.ts         ✅ Fastify server
        │
        ├── api/              ✅ REST API Layer
        │   ├── routes.ts     - Route definitions
        │   └── handlers.ts   - Request handlers
        │
        ├── langchain/        ✅ AI Agents (8 файлов)
        │   └── agents/
        │       ├── index.ts                    - Exports
        │       ├── baseAgent.ts                - Base class
        │       ├── orchestratorAgent.ts        🎯 ГЛАВНЫЙ
        │       ├── dataCollectorAgent.ts       #1
        │       ├── analyzerAgent.ts            #2
        │       ├── industryClassifierAgent.ts  #3
        │       ├── marketResearcherAgent.ts    #4
        │       ├── eventTrackerAgent.ts        #5
        │       ├── alerterAgent.ts             #6
        │       └── reportGeneratorAgent.ts     #7
        │
        ├── types/            ✅ TypeScript Types
        │   └── index.ts      - All interfaces
        │
        └── utils/            ✅ Utilities
            ├── index.ts      - Exports + extractJson
            └── logger.ts     - Pino logger
```

## 🗑️ Удалено из старого проекта

- ❌ `mainAgent.ts` - заменен на orchestratorAgent
- ❌ `validatorAgent.ts` - не нужен
- ❌ `tools/` - старые тулзы (newPosts, getArticle, etc)
- ❌ `getArticle.ts` - из RSS проекта
- ❌ `schemas/validationSchema.ts` - из RSS проекта
- ❌ `shared/models.ts` - из RSS проекта
- ❌ `const/sources.ts` - константы RSS
- ❌ `services/` - все старые сервисы (RSS, messages, sessions)
- ❌ `utils/messageRoleMapper.ts` - не нужен
- ❌ `utils/__tests__/` - старые тесты

## 🎯 Главный агент: Orchestrator

**Только один точка входа для всех операций:**

```typescript
import { orchestratorAgent } from './core/langchain/agents';

// Анализ компании
const result = await orchestratorAgent.analyzeCompany('Таттелеком', true);

// Дашборд
const dashboard = await orchestratorAgent.getDashboard();
```

### Orchestrator координирует 7 агентов:

1. **Data Collector** → собирает данные (HH, GitHub, Habr)
2. **Analyzer** → анализирует данные (sentiment, insights)
3. **Industry Classifier** → классифицирует (industry, stage)
4. **Market Researcher** → исследует рынок (trends, demand)
5. **Event Tracker** → отслеживает события (conferences, investments)
6. **Alerter** → генерирует алерты
7. **Report Generator** → создает отчеты

## 🚀 API Endpoints

```bash
# Health check
GET /health

# Анализ компании (все 7 агентов через orchestrator)
POST /api/v1/analyze
Body: { "companyName": "Таттелеком", "deepAnalysis": true }

# Дашборд
GET /api/v1/dashboard
```

## 📦 Зависимости

```json
{
  "dependencies": {
    "@langchain/core": "^0.3.0",
    "@langchain/openai": "^0.3.0",
    "langchain": "^0.3.0",
    "fastify": "^5.1.0",
    "@fastify/cors": "^10.0.1",
    "zod": "^3.23.8",
    "dotenv": "^16.4.5",
    "pino": "^9.5.0"
  }
}
```

## ⚡ Workflow

```
User → POST /api/v1/analyze
          ↓
    handlers.ts (analyzeCompanyHandler)
          ↓
    orchestratorAgent.analyzeCompany()
          ↓
    7 agents execute in parallel/sequence
          ↓
    Final result with health score & recommendation
          ↓
    JSON Response
```

## 🎯 Ключевые особенности

✅ **Чистая архитектура** - только код IT-Пульс  
✅ **Один главный агент** - orchestrator координирует всех  
✅ **7 специализированных агентов** - каждый делает свою работу  
✅ **Type-safe** - полная типизация TypeScript  
✅ **Fast** - параллельное выполнение где возможно  
✅ **Scalable** - легко добавлять новые агенты  

## 🛠️ Запуск

```bash
npm install
cp env.example .env
# Добавь OPENAI_API_KEY в .env
npm run dev
# http://localhost:3000
```

---

**Статус**: ✅ Готово к разработке  
**Команда**: The One Market  
**Проект**: IT-Пульс Татарстана

