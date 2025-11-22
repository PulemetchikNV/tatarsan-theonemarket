# Схема базы данных для интеграции с API HeadHunter

## Обзор

База данных спроектирована для хранения данных о работодателях и вакансиях из API HeadHunter (hh.ru).

## Таблицы

### 1. `employers` - Работодатели

Основная информация о компаниях-работодателях.

#### Основные поля:

- `id` (INTEGER, PRIMARY KEY) - Внутренний ID записи
- `hh_id` (STRING, UNIQUE) - ID работодателя в системе HeadHunter
- `name` (STRING) - Название компании
- `description` (TEXT, nullable) - Описание компании (HTML)
- `branded_description` (TEXT, nullable) - Описание с брендингом (HTML)
- `site_url` (STRING, nullable) - URL официального сайта
- `alternate_url` (STRING, nullable) - Альтернативный URL на hh.ru
- `vacancies_url` (STRING, nullable) - URL страницы с вакансиями
- `area_id` (STRING, nullable) - ID региона (соответствует HhArea enum)
- `area_name` (STRING, nullable) - Название региона
- `industries` (JSON, nullable) - Отрасли (массив объектов)
- `logo_urls` (JSON, nullable) - URL логотипов (объект с размерами)
- `open_vacancies` (INTEGER, nullable) - Количество открытых вакансий
- `accredited_it_employer` (BOOLEAN) - Аккредитованный IT-работодатель
- `trusted` (BOOLEAN) - Доверенный работодатель
- `type` (STRING, nullable) - Тип работодателя (company, direct, agency)
- `insider_interviews` (JSON, nullable) - Интервью с инсайдерами
- `created_at` (DATETIME_IMMUTABLE) - Дата создания записи в БД
- `updated_at` (DATETIME_IMMUTABLE) - Дата последнего обновления

#### Индексы:

- `idx_employer_hh_id` - на поле `hh_id` (для быстрого поиска по ID HH)
- `idx_employer_name` - на поле `name` (для поиска по названию)
- `idx_employer_area` - на поле `area_id` (для фильтрации по региону)

### 2. `vacancies` - Вакансии

Информация о вакансиях от работодателей.

#### Основные поля:

- `id` (INTEGER, PRIMARY KEY) - Внутренний ID записи
- `hh_id` (STRING, UNIQUE) - ID вакансии в системе HeadHunter
- `name` (STRING) - Название вакансии
- `description` (TEXT, nullable) - Описание вакансии (HTML)
- `requirement` (TEXT, nullable) - Требования к кандидату (HTML)
- `responsibility` (TEXT, nullable) - Обязанности (HTML)
- `employer_id` (INTEGER, FOREIGN KEY) - Связь с работодателем
- `area_id` (STRING, nullable) - ID региона (соответствует HhArea enum)
- `area_name` (STRING, nullable) - Название региона
- `salary_from` (INTEGER, nullable) - Минимальная зарплата
- `salary_to` (INTEGER, nullable) - Максимальная зарплата
- `salary_currency` (STRING, nullable) - Валюта зарплаты (RUR, USD, EUR)
- `salary_gross` (BOOLEAN, nullable) - Указана ли зарплата до вычета налогов
- `employment` (JSON, nullable) - Тип занятости (объект с id и name)
- `schedule` (JSON, nullable) - График работы (объект с id и name)
- `experience` (JSON, nullable) - Опыт работы (объект с id и name)
- `type` (JSON, nullable) - Тип вакансии (объект с id и name)
- `specializations` (JSON, nullable) - Специализации (массив)
- `key_skills` (JSON, nullable) - Навыки (массив объектов)
- `published_at` (DATETIME_IMMUTABLE, nullable) - Дата публикации вакансии
- `created_at` (DATETIME_IMMUTABLE, nullable) - Дата создания вакансии в HH
- `archived` (BOOLEAN) - Вакансия архивирована
- `response_url` (STRING, nullable) - URL для отклика
- `alternate_url` (STRING, nullable) - Альтернативный URL на hh.ru
- `apply_alternate_url` (STRING, nullable) - URL для отклика через форму
- `contacts` (JSON, nullable) - Контакты (объект)
- `db_created_at` (DATETIME_IMMUTABLE) - Дата создания записи в БД
- `db_updated_at` (DATETIME_IMMUTABLE) - Дата последнего обновления

#### Индексы:

- `idx_vacancy_hh_id` - на поле `hh_id` (для быстрого поиска по ID HH)
- `idx_vacancy_name` - на поле `name` (для поиска по названию)
- `idx_vacancy_employer` - на поле `employer_id` (для связи с работодателем)
- `idx_vacancy_area` - на поле `area_id` (для фильтрации по региону)
- `idx_vacancy_published` - на поле `published_at` (для сортировки по дате)
- `idx_vacancy_archived` - на поле `archived` (для фильтрации активных вакансий)

## Связи

### One-to-Many: Employer → Vacancy

- Один работодатель может иметь множество вакансий
- Связь реализована через `employer_id` в таблице `vacancies`
- При удалении работодателя каскадно удаляются все его вакансии (`ON DELETE CASCADE`)

## Особенности

### JSON поля

Некоторые поля хранятся в формате JSON для гибкости:
- `industries`, `logo_urls`, `insider_interviews` в `employers`
- `employment`, `schedule`, `experience`, `type`, `specializations`, `key_skills`, `contacts` в `vacancies`

Это позволяет хранить структурированные данные без создания дополнительных таблиц.

### Автоматическое обновление

Обе Entity используют `HasLifecycleCallbacks` для автоматического обновления поля `updated_at` при изменении записи.

### Уникальность

- `hh_id` в обеих таблицах имеет ограничение UNIQUE для предотвращения дублирования данных из API

## Использование

### Создание миграции

```bash
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

### Примеры запросов

#### Получить работодателя с вакансиями:

```php
$employer = $entityManager->getRepository(Employer::class)
    ->findOneBy(['hhId' => '12345']);

$vacancies = $employer->getVacancies();
```

#### Найти вакансии по региону:

```php
$vacancies = $entityManager->getRepository(Vacancy::class)
    ->findBy(['areaId' => HhArea::Tatarstan->getId()]);
```

#### Найти активные вакансии с зарплатой:

```php
$vacancies = $entityManager->getRepository(Vacancy::class)
    ->createQueryBuilder('v')
    ->where('v.archived = false')
    ->andWhere('v.salaryFrom IS NOT NULL')
    ->orderBy('v.publishedAt', 'DESC')
    ->getQuery()
    ->getResult();
```

## Соответствие с API HeadHunter

### Employer API

Структура соответствует ответу эндпоинта:
- `GET /employers/{employer_id}` - https://api.hh.ru/openapi/redoc#tag/Rabotodatel/operation/get-employer-info

### Vacancy API

Структура соответствует ответу эндпоинта:
- `GET /vacancies` - https://api.hh.ru/openapi/redoc#tag/Poisk-vakansij/operation/get-vacancies
- `GET /vacancies/{vacancy_id}` - детальная информация о вакансии

## Расширение

При необходимости можно добавить:
- Таблицу для навыков (key_skills) с нормализацией
- Таблицу для специализаций
- Таблицу для отраслей (industries)
- Таблицу для истории изменений вакансий
- Индексы для полнотекстового поиска

