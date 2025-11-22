# 🏗️ Архитектура IT-Пульс Татарстана

## ⏰ Критические ограничения: 5 часов на всё

**Стратегия:** Максимальная параллелизация работы, минимум конфликтов, быстрый MVP

---

## 📁 Структура проекта (Monorepo)

```
tatarsan-theonemarket/
├── docker-compose.yml           # Orchestration для всех сервисов
├── .env.example
│
├── backend/                     # Backend API (Node.js/Python - решим позже)
│   ├── Dockerfile
│   ├── package.json / requirements.txt
│   │
│   ├── src/
│   │   ├── api/                 # 🔵 ЗОНА: Данил
│   │   │   ├── routes/
│   │   │   │   ├── companies.js      # GET /api/companies
│   │   │   │   ├── vacancies.js      # GET /api/vacancies
│   │   │   │   ├── metrics.js        # GET /api/metrics
│   │   │   │   └── technologies.js   # GET /api/technologies
│   │   │   ├── controllers/
│   │   │   └── middleware/
│   │   │
│   │   ├── parsers/             # 🔵 ЗОНА: Данил
│   │   │   ├── hh-parser.js     # HH.ru парсер
│   │   │   ├── github-parser.js # GitHub парсер
│   │   │   ├── habr-parser.js   # Habr парсер
│   │   │   └── base-parser.js   # Общий класс для парсеров
│   │   │
│   │   ├── langchain/           # 🟢 ЗОНА: Минтимер
│   │   │   ├── models/          # Конфигурация LLM моделей
│   │   │   │   ├── local-llm.py
│   │   │   │   └── openai-client.py
│   │   │   ├── agents/          # AI агенты
│   │   │   │   ├── analyzer-agent.py       # Классификация компаний
│   │   │   │   ├── nlp-agent.py           # NLP анализ текстов
│   │   │   │   └── sentiment-agent.py     # Sentiment analysis
│   │   │   ├── tools/           # LangChain tools
│   │   │   │   ├── text-classifier.py
│   │   │   │   ├── tech-stack-extractor.py
│   │   │   │   └── company-categorizer.py
│   │   │   ├── chains/          # LangChain chains
│   │   │   │   ├── analysis-chain.py
│   │   │   │   └── classification-chain.py
│   │   │   └── utils/
│   │   │       ├── prompts.py   # Шаблоны промптов
│   │   │       └── embeddings.py
│   │   │
│   │   ├── database/            # 🔵 ЗОНА: Данил (начальная настройка)
│   │   │   ├── models/          # ORM модели
│   │   │   ├── migrations/
│   │   │   └── seeds/           # Тестовые данные
│   │   │
│   │   ├── services/            # Бизнес-логика (общая)
│   │   │   ├── company-service.js
│   │   │   ├── vacancy-service.js
│   │   │   └── metrics-service.js
│   │   │
│   │   └── utils/
│   │       ├── logger.js
│   │       └── cache.js
│   │
│   └── scripts/
│       ├── run-parsers.js       # Запуск всех парсеров
│       └── seed-db.js           # Заполнение тестовыми данными
│
├── frontend/                    # 🟡 ЗОНА: Андрей (полная изоляция!)
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   │
│   ├── public/
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   │
│   │   ├── api/                 # API клиент
│   │   │   ├── client.js        # Axios/Fetch конфиг
│   │   │   └── endpoints.js     # Все эндпоинты в одном месте
│   │   │
│   │   ├── views/               # Страницы
│   │   │   ├── DashboardView.vue      # Главная с метриками
│   │   │   ├── CompaniesView.vue      # Список компаний
│   │   │   ├── VacanciesView.vue      # Вакансии
│   │   │   └── TechnologiesView.vue   # Технологии
│   │   │
│   │   ├── components/          # Компоненты
│   │   │   ├── charts/
│   │   │   │   ├── MetricsChart.vue
│   │   │   │   ├── SalaryChart.vue
│   │   │   │   └── TechStackChart.vue
│   │   │   ├── ui/
│   │   │   │   ├── SearchBar.vue
│   │   │   │   ├── FilterPanel.vue
│   │   │   │   └── CompanyCard.vue
│   │   │   └── layout/
│   │   │       ├── Header.vue
│   │   │       └── Sidebar.vue
│   │   │
│   │   ├── stores/              # Pinia stores
│   │   │   ├── companies.js
│   │   │   ├── vacancies.js
│   │   │   └── metrics.js
│   │   │
│   │   ├── router/
│   │   │   └── index.js
│   │   │
│   │   └── utils/
│   │       ├── formatters.js    # Форматирование данных
│   │       └── constants.js
│   │
│   └── tests/
│
├── presentation/                # 🟣 ЗОНА: Лиля (полная изоляция!)
│   ├── slides/
│   │   └── main.pptx
│   ├── assets/
│   │   ├── screenshots/         # Скриншоты из приложения
│   │   └── diagrams/            # Архитектурные диаграммы
│   └── demo-script.md           # Сценарий демонстрации
│
└── docs/
    ├── tz.md
    ├── todo.md
    ├── architecture.md          # Этот файл
    └── api-spec.md              # API контракт (создать первым!)
```

---

## 🎯 Изоляция зон ответственности (НЕТ КОНФЛИКТОВ!)

### 🟡 Андрей - Frontend (100% изоляция)
- **Папка:** `frontend/` - только он туда заходит
- **Работа:** Vue.js приложение, компоненты, графики, UI/UX
- **API контракт:** Работает по заранее определенному `api-spec.md`
- **Моки:** Может использовать mock данные пока бэк не готов
- **Конфликты:** НОЛЬ (никто больше не трогает frontend/)

### 🔵 Данил - Backend Core + Parsers
- **Папки:** `backend/api/`, `backend/parsers/`, `backend/database/`
- **Работа:** API endpoints, парсеры, настройка БД, роуты
- **Изоляция от ML:** НЕ трогает `backend/langchain/` вообще
- **Конфликты:** Минимальны - только возможно в `services/` с Минтимером

### 🟢 Минтимер - ML/AI Layer
- **Папка:** `backend/langchain/` - только он туда заходит
- **Работа:** Все агенты, NLP, классификация, анализ
- **Интеграция:** Через API контракт вызывает функции из `services/`
- **Конфликты:** НОЛЬ в основной работе

### 🟣 Лиля - Presentation
- **Папка:** `presentation/` - полная изоляция
- **Работа:** Презентация, демо-сценарий
- **Конфликты:** НОЛЬ

---

## 🔄 Workflow: Как работаем параллельно

### Этап 0: Подготовка (первые 15 минут, ВСЕ ВМЕСТЕ)
1. **Создаем `api-spec.md`** - API контракт (эндпоинты + структура данных)
2. **Создаем mock данные** - sample JSON для фронтенда
3. **Настраиваем Docker Compose** - все поднимается одной командой
4. **Договариваемся о структурах данных** - Company, Vacancy, Metrics

```json
// Пример контракта
GET /api/metrics
{
  "totalCompanies": 150,
  "totalVacancies": 450,
  "avgSalary": 120000,
  "topTechnologies": ["Python", "JavaScript", "Go"],
  "activityIndex": 87
}
```

### Этап 1: Параллельная работа (4 часа)

#### 🟡 Андрей (Frontend):
- **Час 1:** Настройка Vue + роутинг + базовый layout + API клиент с моками
- **Час 2:** Dashboard с графиками (даже с fake data выглядит круто!)
- **Час 3:** Компоненты для компаний/вакансий + поиск/фильтры
- **Час 4:** Полировка UI, адаптив, интеграция с реальным API

#### 🔵 Данил (Backend):
- **Час 1:** Setup проекта + Docker + БД + базовые модели + API endpoints (возвращают моки)
- **Час 2:** Парсер HH.ru (самый важный!) + сохранение в БД
- **Час 3:** Парсер GitHub + Habr (упрощенные версии)
- **Час 4:** Интеграция с ML агентами Минтимера + деплой

#### 🟢 Минтимер (ML/AI):
- **Час 1:** Setup LangChain + подключение модели (локальная LLM или OpenAI)
- **Час 2:** Агент для классификации компаний (fintech/AI/gaming/etc)
- **Час 3:** Агент для извлечения tech stack из текста вакансий
- **Час 4:** Sentiment analysis + интеграция с основным API

#### 🟣 Лиля (Presentation):
- **Часы 1-2:** Презентация проекта (слайды)
- **Час 3:** Архитектурные диаграммы + сценарий демо
- **Час 4:** Финальная сборка презентации + репетиция

### Этап 2: Интеграция (последние 45 минут)
- **Минтимер + Данил:** Подключение ML агентов к API
- **Андрей:** Переключение с моков на реальное API
- **Лиля:** Делает финальные скриншоты готового продукта
- **ВСЕ:** Smoke тест всей системы

---

## 🐳 Docker Compose структура

### docker-compose.yml

```yaml
version: '3.8'

services:
  # База данных
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: itpulse
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  # Redis для кэширования
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:password@db:5432/itpulse
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
      # ML API endpoint для связи с langchain
      ML_SERVICE_URL: http://ml-service:8000
    depends_on:
      - db
      - redis
      - ml-service
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - app-network
    command: npm run dev

  # ML Service (Python + LangChain)
  ml-service:
    build:
      context: ./backend
      dockerfile: Dockerfile.ml
    ports:
      - "8000:8000"
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      DATABASE_URL: postgresql://admin:password@db:5432/itpulse
    depends_on:
      - db
    volumes:
      - ./backend/langchain:/app/langchain
    networks:
      - app-network
    command: python -m uvicorn langchain.main:app --host 0.0.0.0 --port 8000 --reload

  # Frontend (Vue.js)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - app-network
    command: npm run dev

  # Nginx (опционально, для продакшена)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

---

## 🔌 API Endpoints (контракт для параллельной работы)

### Core Endpoints

```
GET    /api/metrics              # Ключевые метрики IT-экосистемы
GET    /api/companies            # Список компаний + фильтры
GET    /api/companies/:id        # Детали компании
GET    /api/vacancies            # Список вакансий + фильтры
GET    /api/vacancies/:id        # Детали вакансии
GET    /api/technologies         # Топ технологий + статистика
GET    /api/search               # Универсальный поиск
```

### ML Endpoints (внутренние, backend → ml-service)

```
POST   /ml/classify-company      # Классификация компании
POST   /ml/extract-tech-stack    # Извлечение технологий
POST   /ml/analyze-sentiment     # Анализ тональности
```

---

## 🚀 Dockerfile примеры

### backend/Dockerfile (Node.js)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### backend/Dockerfile.ml (Python ML Service)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY langchain/ ./langchain/

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "langchain.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### frontend/Dockerfile (Vue.js)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

---

## 🎯 Критические точки синхронизации

### 1. API Контракт (создать ПЕРВЫМ!)
- **Кто:** Данил пишет черновик → все согласовывают
- **Формат:** `api-spec.md` с примерами запросов/ответов
- **Зачем:** Андрей и Минтимер знают какие данные ожидать

### 2. Модели данных
- **Кто:** Данил определяет структуру БД
- **Зачем:** Все работают с одинаковыми типами

### 3. Mock данные
- **Кто:** Данил создает `mock-data.json`
- **Зачем:** Андрей может работать независимо от готовности API

### 4. ML интеграция
- **Кто:** Минтимер создает отдельный FastAPI сервис
- **Зачем:** Backend просто дергает HTTP endpoints, не зависит от Python

---

## ⚡ Оптимизация для 5 часов

### Что делаем:
- ✅ Один основной парсер (HH.ru) - самый важный источник данных
- ✅ Упрощенные GitHub/Habr парсеры (базовая функциональность)
- ✅ 2-3 ключевых ML агента (классификация + tech stack)
- ✅ Dashboard с основными метриками и графиками
- ✅ Mock данные для красивой демонстрации
- ✅ Docker Compose для быстрого разворачивания

### Что НЕ делаем (оставляем на потом):
- ❌ Real-time обновления (WebSocket)
- ❌ Мобильное приложение
- ❌ Сложная аналитика и прогнозы
- ❌ Систему уведомлений
- ❌ Production-ready инфраструктуру
- ❌ Тесты (если совсем не успеваем)

---

## 📊 Приоритеты для каждой зоны

### Андрей (Frontend):
1. **Критично:** Dashboard с графиками (даже с fake data)
2. **Важно:** Список компаний + поиск
3. **Nice to have:** Детальные страницы компаний

### Данил (Backend):
1. **Критично:** API endpoints + парсер HH.ru
2. **Важно:** БД и сохранение данных
3. **Nice to have:** GitHub/Habr парсеры

### Минтимер (ML):
1. **Критично:** Классификация компаний по индустриям
2. **Важно:** Извлечение tech stack из вакансий
3. **Nice to have:** Sentiment analysis

### Лиля (Presentation):
1. **Критично:** Презентация проекта
2. **Важно:** Демо-сценарий
3. **Nice to have:** Архитектурные диаграммы

---

## 🎬 План демонстрации

1. **Вступление** (Лиля) - проблема и решение
2. **Архитектура** (Данил) - как устроена система
3. **Live Demo** (Андрей) - показ работающего Dashboard
4. **ML возможности** (Минтимер) - как работает AI анализ
5. **Заключение** (Лиля) - планы развития

---

## 🔥 Checklist запуска

```bash
# 1. Клонируем репо
git clone <repo>
cd tatarsan-theonemarket

# 2. Создаем .env файл
cp .env.example .env

# 3. Поднимаем все сервисы
docker-compose up -d

# 4. Проверяем что все работает
curl http://localhost:3000/api/metrics    # Backend API
curl http://localhost:8000/health         # ML Service
open http://localhost:5173                # Frontend

# 5. Запускаем парсеры (заполняем БД)
docker-compose exec backend npm run parse

# 6. Открываем Dashboard и наслаждаемся!
```

---

**🎯 Главное правило:** Каждый работает в своей зоне. Минимум коммуникации после первых 15 минут. Максимум параллелизма. Успеем за 5 часов!
