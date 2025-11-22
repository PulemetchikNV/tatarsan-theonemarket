# Data Collector Agent

## 🎯 Назначение

Служебный агент для параллельного сбора данных о компаниях из разных источников.

**Особенность:** НЕ использует AI - это простой сборщик данных.

## 📊 Источники данных

1. **HH.ru** - вакансии компании
2. **GitHub** - репозитории и активность
3. **Habr** - статьи и экспертиза

## 🔐 Контракт

```typescript
// Input
companyName: string

// Output
DataCollectorResult {
  hhData?: HHData
  githubData?: GitHubData
  habrData?: HabrData
  collectedAt: string
}
```

## 💡 Использование

```typescript
import { dataCollectorAgent } from './agents/dataCollector';

const data = await dataCollectorAgent.collect('Иннополис');

console.log('Вакансий:', data.hhData?.totalVacancies);
console.log('Репозиториев:', data.githubData?.totalRepos);
console.log('Статей:', data.habrData?.totalArticles);
```

## 🏗️ Архитектура

```
dataCollector/
├── index.ts              # DataCollectorAgent (main)
└── README.md            # Эта документация
```

**Примечание:** У этого агента нет tools/ папки так как он не "думающий".
Он просто собирает данные параллельно без AI.

## 🔗 Интеграция с Orchestrator

Используется через `orchestrator/tools/collectDataTool.ts`:

```typescript
collectDataTool -> dataCollectorAgent.collect()
                -> DataCollectorResult
                -> wrapped in DataCollectionOutput
```

## 📝 Roadmap

- [ ] Добавить LinkedIn источник
- [ ] Добавить кэширование результатов
- [ ] Подключить реальные парсеры вместо моков
- [ ] Добавить retry логику для ненадежных источников

