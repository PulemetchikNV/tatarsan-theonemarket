# API Routes

Роуты реализованы напрямую в `src/core/server.ts` для простоты.

## Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Dashboard

```
GET /api/v1/dashboard
```

Возвращает агрегированную статистику по региону.

**Response:**
```typescript
{
  htmlComponents: string  // HTML контент для рендера
  totalHealthScore: number
}
```

**Статус:** 🏗️ В разработке (пока заглушка)

---

### Company Analysis

```
GET /api/v1/company/:companyName
```

Выполняет полный анализ компании через оркестратор.

**Parameters:**
- `companyName` (path) - название компании для анализа

**Process Flow:**
```
1. Orchestrator.analyzeCompany(companyName)
   ├─ Сбор данных (HH, GitHub, Habr)
   ├─ Анализ (sentiment, strengths, weaknesses)
   ├─ Классификация (Tech-индустрии)
   └─ Рыночное исследование

2. ReportGenerator.generateReport(analysisResult)
   └─ Генерирует HTML через AI tools

3. Формирует CompanyResponse для фронта
```

**Response:**
```typescript
{
  name: string           // Название компании
  industry: string       // Индустрия (EdTech, FinTech, etc)
  htmlComponents: string // HTML контент для рендера
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/company/Иннополис
```

**Response example:**
```json
{
  "name": "Иннополис",
  "industry": "EdTech",
  "htmlComponents": "<div class='content-wrap'>...</div>"
}
```

---

## Architecture

### Request → Orchestrator → Report Generator → Response

```
Frontend Request
    ↓
GET /api/v1/company/CompanyName
    ↓
OrchestratorAgent.analyzeCompany()
    ├─ DataCollector (mock данные)
    ├─ Analyzer (AI анализ)
    ├─ IndustryClassifier (NLP)
    └─ MarketResearcher (думающий агент)
    ↓
    = CompanyAnalysisResult
    ↓
ReportGeneratorAgent.generateReport()
    ├─ get_card (метрики)
    ├─ get_list (списки)
    ├─ get_chart (графики)
    ├─ get_section (секции)
    └─ get_recommendation (вердикт)
    ↓
    = HTML string
    ↓
CompanyResponse { name, industry, htmlComponents }
    ↓
Frontend (рендерит HTML)
```

---

## Error Handling

Все ошибки логируются через `logger` и возвращают:

```json
{
  "error": "Internal Server Error",
  "message": "Детальное описание ошибки"
}
```

**Status Code:** 500

---

## Logging

Каждый запрос логируется на всех этапах:

```
📊 Dashboard request received
🔍 Company analysis request: CompanyName
🚀 Starting orchestrator for: CompanyName
📝 Generating HTML report for: CompanyName
✅ Company analysis complete: CompanyName
```

Или в случае ошибки:

```
❌ Company analysis error: [error details]
```

---

## CORS

CORS настроен на `origin: true` - разрешены запросы с любых доменов (для разработки).

---

## Future Improvements

### Dashboard Route
- [ ] Запускать оркестратор для множества компаний
- [ ] Агрегировать результаты
- [ ] Кэшировать данные

### Company Route
- [ ] Добавить query параметры (force refresh, cache TTL)
- [ ] Streaming response для длительных операций
- [ ] WebSocket для real-time обновлений процесса

### General
- [ ] Rate limiting
- [ ] Authentication/Authorization
- [ ] Request validation (Zod schemas)
- [ ] Response caching (Redis)

