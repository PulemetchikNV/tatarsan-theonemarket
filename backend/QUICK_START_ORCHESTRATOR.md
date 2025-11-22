# Quick Start - Orchestrator Agent

## 🚀 Быстрый старт

### Использование

```typescript
import { orchestratorAgent } from './agents/orchestrator';

// Полный анализ компании
const result = await orchestratorAgent.analyzeCompany('Иннополис');

console.log('Health Score:', result.healthScore);
console.log('Recommendation:', result.recommendation);
console.log('Reasoning:', result.reasoning);
```

## 🎯 Что происходит внутри

Агент АВТОМАТИЧЕСКИ выполняет все фазы:

### ⚡ ФАЗА 1: Сбор данных
```
🔍 collect_data("Иннополис")
  ├─ HH.ru → 15 вакансий, навыки
  ├─ GitHub → 8 репозиториев, языки
  └─ Habr → 10 статей, темы
```

### ⚡ ФАЗА 2: Анализ (параллельно)
```
📊 analyze_data() + classify_industry() + research_market()
  ├─ Sentiment: positive
  ├─ Индустрия: EdTech
  └─ Потенциал роста: 85/100
```

### ⚡ ФАЗА 3: Генерация отчета
```
📄 generate_report()
  └─ JSON для фронтенда
```

## 📋 Флоу выполнения

```
User → analyzeCompany("X")
         ↓
    ФАЗА 1: collect_data ✅
         ↓ collectedData
    ФАЗА 2: analyze + classify + research ✅
         ↓ analysisResult
    ФАЗА 3: generate_report ✅
         ↓
    CompanyAnalysisResult
```

## 🔧 Tools (железные контракты)

Каждый tool возвращает:
```typescript
{
  success: boolean,
  data?: ResultType,
  error?: string,
  executionTime: number
}
```

### Список tools

| Tool | Фаза | Что делает |
|------|------|-----------|
| `collect_data` | 1 | Собирает данные из HH, GitHub, Habr |
| `analyze_data` | 2.1 | Анализирует sentiment, strengths |
| `classify_industry` | 2.2 | Определяет Tech-индустрию |
| `research_market` | 2.3 | Исследует рынок и тренды |
| `generate_report` | 3 | Создает итоговый отчет |

## 💡 Примеры

### Базовый пример

```typescript
const result = await orchestratorAgent.analyzeCompany('Таттелеком');
// Агент САМ выполнит все фазы
```

### С обработкой ошибок

```typescript
try {
  const result = await orchestratorAgent.analyzeCompany('UnknownCompany');
  
  if (result.healthScore >= 70) {
    console.log('✅ Рекомендуем инвестировать');
  }
} catch (error) {
  console.error('Анализ провалился:', error);
}
```

### Доступ к деталям

```typescript
const result = await orchestratorAgent.analyzeCompany('Иннополис');

// Данные ФАЗЫ 1
console.log('Вакансий:', result.dataCollector.hhData?.totalVacancies);
console.log('Репозиториев:', result.dataCollector.githubData?.totalRepos);

// Данные ФАЗЫ 2
console.log('Sentiment:', result.analyzer.sentiment);
console.log('Индустрия:', result.industryClassifier.primaryIndustry);
console.log('Потенциал роста:', result.marketResearcher.growthPotential);

// Итоговая оценка
console.log('Health Score:', result.healthScore);
console.log('Рекомендация:', result.recommendation);
```

## 🏗️ Архитектура

```
orchestrator/
├── index.ts              # OrchestratorAgent (вызывай отсюда)
├── types.ts              # TypeScript типы
├── tools/                # Tools для агента
│   ├── collectDataTool.ts
│   ├── analyzeDataTool.ts
│   ├── classifyIndustryTool.ts
│   ├── researchMarketTool.ts
│   └── generateReportTool.ts
└── README.md             # Полная документация
```

## 📖 Документация

- **Полная документация:** `orchestrator/README.md`
- **Рефакторинг:** `ORCHESTRATOR_REFACTOR.md`
- **Архитектура агентов:** `AGENT_ARCHITECTURE.md`

## 🔥 Ключевые фичи

- ✅ **Автономность** - агент САМ управляет процессом
- ✅ **Thinking Agent** - использует createAgent + tools
- ✅ **Железные контракты** - единый формат для всех tools
- ✅ **Фазы** - четкий порядок: 1 → 2 → 3
- ✅ **Reasoning** - агент думает и принимает решения
- ✅ **Мониторинг** - executionTime для каждой фазы

## 🚀 Начни сейчас!

```bash
# 1. Импортируй агента
import { orchestratorAgent } from './agents/orchestrator';

# 2. Вызови анализ
const result = await orchestratorAgent.analyzeCompany('YourCompany');

# 3. Получи результат
console.log(result);
```

Агент сделает всё остальное! 🎉

