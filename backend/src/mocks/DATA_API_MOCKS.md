# Data API Mocks

Моки для PHP сервиса data-api (порт 8100).

## Соответствие контрактам

Все моки полностью соответствуют контрактам из `/data-api/api.http`.

### GET /api/roles
```typescript
getRoles(): RolesResponse
```
**Возвращает:** Список всех ролей (Developer, QA, DevOps и т.д.)

### GET /api/vacancies/stats/daily
```typescript
getVacancyStats(params?: { role?: string; days?: number }): VacancyStatsResponse
```
**Параметры:**
- `role` - ID роли для фильтрации (опционально)
- `days` - количество дней статистики, 1-365 (по умолчанию 30)

**Возвращает:** Ежедневная статистика вакансий за N дней

### GET /api/employers
```typescript
getEmployers(params?: { page?: number; limit?: number; search?: string }): EmployersResponse
```
**Параметры:**
- `page` - номер страницы (по умолчанию 1)
- `limit` - элементов на странице, макс 100 (по умолчанию 20)
- `search` - поиск по названию (опционально)

**Возвращает:** Список работодателей с пагинацией

### GET /api/employers/{id}
```typescript
getEmployerDetail(id: number): EmployerDetailResponse | null
```
**Возвращает:** Детальную информацию о работодателе + его вакансии

## Утилиты

### getRegionStats(region: string)
Агрегирует данные для региона:
- Общее количество работодателей
- Общее количество вакансий
- Среднее количество вакансий на компанию
- Средняя зарплата
- Топ работодателей
- Тренды вакансий (последние 7 дней)
- Топ роли

**Используется в:** `/api/v1/dashboard` для быстрого отображения без AI агентов

## Пример использования

```typescript
import { getRegionStats, getEmployers, getVacancyStats } from '@mocks/dataApiMock';

// Для дашборда - быстрая агрегация
const stats = getRegionStats('Татарстан');
console.log(`${stats.totalEmployers} компаний, ${stats.totalVacancies} вакансий`);

// Список работодателей с поиском
const employers = getEmployers({ search: 'банк', page: 1, limit: 10 });

// Статистика по DevOps за последние 7 дней
const devopsStats = getVacancyStats({ role: '160', days: 7 });
```

## Миграция на реальное API

Когда PHP сервис будет готов, замените моки на реальные HTTP запросы:

```typescript
// Было (mock):
import { getRegionStats } from '@mocks/dataApiMock';
const stats = getRegionStats('Татарстан');

// Станет (real API):
const response = await fetch('http://localhost:8100/api/employers');
const employers = await response.json();
```

## Данные в моках

- **5 компаний:** Иннополис, Таттелеком, Bars Group, Сбербанк Технологии, Kaspersky
- **7 ролей:** Developer, QA, DevOps, Data Scientist, Analyst, Product Manager, Designer
- **3 вакансии на компанию:** Backend, DevOps, Frontend (разные зарплаты и требования)
- **30 дней статистики:** 10-50 вакансий в день (случайно генерируется)

