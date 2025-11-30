# 🔄 Миграция LangChain → LangGraph

## Цель
Перевести текущую архитектуру агентов на LangGraph с паттерном "Role-driven Adaptive Pipeline".

---

## 📚 Общие ресурсы для изучения
- **LangGraph Docs**: "Quickstart", "Core Concepts" (nodes, edges, state)
- **LangGraph Docs**: "How-to Guides" → "Subgraphs" (для понимания композиции)
- **LangGraph Docs**: "Conceptual Guides" → "Thinking in LangGraph"
- **LangChain Blog**: "From LangChain to LangGraph" (миграционный гайд)

---

## Фаза 0: Подготовка
> 📖 Изучить: LangGraph Quickstart, State Management

- [ ] **0.1** Установить зависимости (`@langchain/langgraph`)
- [ ] **0.2** Изучить базовые концепции: StateGraph, nodes, edges, conditional edges
- [ ] **0.3** Создать папку `src/core/langgraph/` для новой архитектуры
- [ ] **0.4** Определить `GraphState` интерфейс (role, region, collectedData, analysis, report)

---

## Фаза 1: State & Types
> 📖 Изучить: LangGraph → "State Management", TypedDict/Annotations

- [ ] **1.1** Создать `src/core/langgraph/state.ts` - определить GraphState
  ```
  Поля: role, region, query, collectedData (schema-agnostic), analysis, report
  ```
- [ ] **1.2** Создать `src/core/langgraph/types.ts` - типы для ролей, конфиги
- [ ] **1.3** Определить `channels` для state (как данные мержатся между нодами)
  > 📖 Изучить: "Reducers" в LangGraph docs

---

## Фаза 2: Data Collector Nodes (LLM Agents)
> 📖 Изучить: LangGraph → "Tool Calling", "Prebuilt ReAct Agent"

- [ ] **2.1** Создать `src/core/langgraph/nodes/collectMainData.ts`
  - LLM agent с tools: getRegionStats, getVacancies, getSalaries
  - Принимает `role` → сам решает какие tools вызывать
  > 📖 Изучить: "create_react_agent" в LangGraph

- [ ] **2.2** Создать `src/core/langgraph/nodes/collectMarketResearch.ts`
  - LLM agent с tools: getMarketMetrics, getTrends, getCompetition
  - Адаптируется под роль (investor vs hr)

- [ ] **2.3** Создать `src/core/langgraph/nodes/collectEvents.ts`
  - LLM agent с tools: getTelegramPosts, extractEventData
  - Опционально включается для некоторых ролей

- [ ] **2.4** Написать промпты для каждого collector с учётом ролей
  > 📖 Изучить: "Prompt Engineering for Agents" в LangChain docs

---

## Фаза 3: Processing Nodes
> 📖 Изучить: LangGraph → "Nodes", просто функции (state) → state

- [ ] **3.1** Создать `src/core/langgraph/nodes/mergeData.ts`
  - Простая функция (не LLM) - объединяет collectedData
  - Добавляет fallback значения если что-то не собрали

- [ ] **3.2** Создать `src/core/langgraph/nodes/analyzeAndClassify.ts`
  - LLM node - анализирует собранные данные
  - Считает Health Score на основе того что есть
  - Schema-agnostic: работает с любыми данными
  > 📖 Изучить: "Structured Output" в LangChain (для парсинга результата)

- [ ] **3.3** Создать `src/core/langgraph/nodes/generateReport.ts`
  - LLM node с tools (getCard, getChart, getList, etc.)
  - Знает роль → генерирует персонализированный отчёт

---

## Фаза 4: Graph Assembly
> 📖 Изучить: LangGraph → "Graph Composition", "Parallel Execution"

- [ ] **4.1** Создать `src/core/langgraph/graph.ts` - собрать граф
  ```
  START → [parallel: collectMain, collectMarket, collectEvents]
        → mergeData 
        → analyzeAndClassify 
        → generateReport 
        → END
  ```
  > 📖 Изучить: "Branching" и "Fan-out/Fan-in" в LangGraph docs

- [ ] **4.2** Настроить параллельное выполнение data collectors
  > 📖 Изучить: "Parallel Node Execution" в How-to Guides

- [ ] **4.3** Добавить conditional edge для collectEvents (только для некоторых ролей)
  > 📖 Изучить: "Conditional Edges" в LangGraph docs

- [ ] **4.4** Скомпилировать граф: `graph.compile()`

---

## Фаза 5: Integration & API
> 📖 Изучить: LangGraph → "Streaming", "Checkpointing"

- [ ] **5.1** Создать `src/core/langgraph/index.ts` - экспорт для использования
- [ ] **5.2** Обновить API endpoint `/api/dashboard` для использования нового графа
- [ ] **5.3** Добавить streaming для real-time обновлений (опционально)
  > 📖 Изучить: "Streaming" в LangGraph docs
- [ ] **5.4** Добавить checkpointing для возможности resume (опционально)
  > 📖 Изучить: "Persistence" в LangGraph docs

---

## Фаза 6: Testing & Cleanup
> 📖 Изучить: LangGraph → "Testing", LangSmith integration

- [ ] **6.1** Протестировать граф с разными ролями (investor, hr, tech_lead)
- [ ] **6.2** Настроить LangSmith трейсинг для дебага
  > 📖 Изучить: "LangSmith" → "Tracing LangGraph"
- [ ] **6.3** Сравнить результаты с текущей LangChain реализацией
- [ ] **6.4** Удалить старый код из `src/core/langchain/agents/` (после проверки)
- [ ] **6.5** Обновить документацию

---

## Фаза 7: Advanced (после MVP)
> 📖 Изучить: LangGraph → "Human-in-the-loop", "Multi-agent"

- [ ] **7.1** Добавить Human-in-the-loop для критичных отчётов
  > 📖 Изучить: "Interrupt" и "Human-in-the-loop" в docs
- [ ] **7.2** Добавить memory для повторных запросов того же пользователя
  > 📖 Изучить: "Memory" в LangGraph docs
- [ ] **7.3** Рассмотреть multi-agent supervisor если нужна динамическая маршрутизация
  > 📖 Изучить: "Multi-agent Systems" в LangGraph docs

---

## 📁 Целевая структура файлов

```
src/core/langgraph/
├── index.ts                 # Экспорт графа
├── graph.ts                 # Сборка графа (nodes + edges)
├── state.ts                 # GraphState definition
├── types.ts                 # Types, configs
├── nodes/
│   ├── collectMainData.ts   # LLM Agent - сбор основных данных
│   ├── collectMarketResearch.ts  # LLM Agent - исследование рынка
│   ├── collectEvents.ts     # LLM Agent - события
│   ├── mergeData.ts         # Action - объединение данных
│   ├── analyzeAndClassify.ts    # LLM - анализ и Health Score
│   └── generateReport.ts    # LLM Agent - генерация отчёта
├── tools/                   # Переиспользуем существующие tools
│   └── index.ts             # Re-export tools из langchain/
└── prompts/
    ├── collectors.ts        # Промпты для data collectors
    ├── analyzer.ts          # Промпт для анализа
    └── reporter.ts          # Промпт для генерации отчёта
```

---

## 🎯 Definition of Done

- [ ] Граф работает для всех ролей (investor, hr, tech_lead, founder)
- [ ] Data collectors адаптивно собирают данные под роль
- [ ] Отчёты персонализированы под роль получателя
- [ ] Трейсы видны в LangSmith
- [ ] Старый код удалён
- [ ] Документация обновлена

