# NLP Agent - Industry Classifier

Изолированный NLP агент на LangChain (JS/TS) для анализа компаний, классификации по индустриям и определения технологических стеков.

## Возможности

- **Industry Classification**: Классификация компаний (Fintech, AI, Gaming, E-commerce, SaaS)
- **Company Linking**: Извлечение названия компании и связанных компаний
- **Tech Stack Detection**: Определение используемых технологий
- **Confidence Scoring**: Оценка уверенности анализа (0-1)
- **Structured Output**: Строгая валидация схемы через Zod

## Установка

```bash
pnpm install
```

## Конфигурация

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Добавьте ваш Google API ключ:

```env
GOOGLE_API_KEY=your_api_key_here
```

## Использование

### Локальный дебаг

```bash
pnpm debug
```

### В вашем проекте

```typescript
import { NLPAgent } from 'nlp-agent';

const agent = new NLPAgent();
const result = await agent.analyze("Stripe is a fintech company...");

console.log(result);
// {
//   companyName: "Stripe",
//   industry: "Fintech",
//   techStack: ["Ruby", "Go", "React"],
//   relatedCompanies: ["PayPal", "Adyen"],
//   summary: "...",
//   confidence: 0.95
// }
```

## Структура проекта

```
.
├── src/
│   ├── agent/
│   │   ├── analyzer.ts       # Основной класс NLPAgent
│   │   └── prompts.ts        # LangChain промпты
│   ├── utils/
│   │   └── logger.ts         # Логирование
│   └── index.ts              # Экспорты
├── debug.ts                  # Скрипт для отладки
├── package.json
└── tsconfig.json
```

## Типы данных

```typescript
interface AnalysisResult {
  companyName: string;
  industry: "Fintech" | "AI" | "Gaming" | "E-commerce" | "SaaS" | "Other";
  subIndustry?: string;
  techStack: string[];
  relatedCompanies: string[];
  summary: string;
  confidence: number;
}
```

## Скрипты

- `pnpm debug` - запуск отладочного скрипта
- `pnpm build` - компиляция TypeScript
- `pnpm start` - запуск собранного проекта

## Модель

Использует **Gemini 2.5 Flash** через LangChain.
