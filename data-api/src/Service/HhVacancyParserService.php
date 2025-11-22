<?php

namespace App\Service;

use App\Entity\Employer;
use App\Entity\Vacancy;
use App\Enum\DataSource;
use App\Enum\HhRole;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class HhVacancyParserService
{
    private const API_BASE_URL = 'https://api.hh.ru';
    private const PER_PAGE = 100; // Максимум вакансий на странице

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ?LoggerInterface $logger = null
    ) {
    }

    /**
     * Парсинг вакансий по профессиональной роли
     * Всегда парсит только Татарстан (area=1624)
     *
     * @param string|HhRole $roleId ID роли (из HhRole enum или строка)
     * @param int|null $maxPages Максимальное количество страниц для парсинга (null = все)
     * @return array Статистика парсинга
     */
    public function parseByRole(string|HhRole $roleId, ?int $maxPages = null): array
    {
        $roleIdString = $roleId instanceof HhRole ? $roleId->getId() : $roleId;
        $areaId = '1624'; // Татарстан - хардкод
        
        $this->logger?->info('Начало парсинга вакансий', [
            'professional_role' => $roleIdString,
            'area' => $areaId,
        ]);

        $stats = [
            'total_found' => 0,
            'pages_parsed' => 0,
            'employers_created' => 0,
            'employers_updated' => 0,
            'vacancies_created' => 0,
            'vacancies_updated' => 0,
            'errors' => 0,
        ];

        $page = 0;
        $hasMore = true;

        while ($hasMore && ($maxPages === null || $page < $maxPages)) {
            try {
                $params = [
                    'professional_role' => $roleIdString,
                    'area' => $areaId, // Татарстан - хардкод
                    'per_page' => self::PER_PAGE,
                    'page' => $page,
                ];

                $queryString = http_build_query($params);
                $url = sprintf('%s/vacancies?%s', self::API_BASE_URL, $queryString);

                $this->logger?->debug('Запрос к API', ['url' => $url, 'page' => $page]);

                $response = $this->fetchApi($url);

                if (!$response) {
                    $this->logger?->warning('Пустой ответ от API', ['page' => $page]);
                    break;
                }

                $data = json_decode($response, true);

                if (!isset($data['items']) || !is_array($data['items'])) {
                    $this->logger?->warning('Некорректный формат ответа', ['page' => $page]);
                    break;
                }

                if ($page === 0) {
                    $stats['total_found'] = $data['found'] ?? 0;
                    $this->logger?->info('Найдено вакансий', ['total' => $stats['total_found']]);
                }

                $items = $data['items'];
                if (empty($items)) {
                    $hasMore = false;
                    break;
                }

                foreach ($items as $item) {
                    try {
                        $this->parseVacancy($item, $stats);
                    } catch (\Exception $e) {
                        $stats['errors']++;
                        $this->logger?->error('Ошибка при парсинге вакансии', [
                            'vacancy_id' => $item['id'] ?? 'unknown',
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                $stats['pages_parsed']++;
                $this->entityManager->flush();
                $this->entityManager->clear(); // Освобождаем память

                $this->logger?->info('Страница обработана', [
                    'page' => $page,
                    'items' => count($items),
                ]);

                // Проверяем, есть ли еще страницы
                $totalPages = isset($data['pages']) ? $data['pages'] : 0;
                if ($page >= $totalPages - 1) {
                    $hasMore = false;
                }

                $page++;

                // Небольшая задержка, чтобы не перегружать API
                usleep(200000); // 0.2 секунды

            } catch (\Exception $e) {
                $stats['errors']++;
                $this->logger?->error('Ошибка при парсинге страницы', [
                    'page' => $page,
                    'error' => $e->getMessage(),
                ]);
                break;
            }
        }

        $this->logger?->info('Парсинг завершен', $stats);

        return $stats;
    }

    /**
     * Парсинг одной вакансии
     */
    private function parseVacancy(array $data, array &$stats): void
    {
        $sourceId = (string) $data['id'];
        $todayStart = new \DateTimeImmutable('today');
        $todayEnd = $todayStart->modify('+1 day');

        // Проверяем, существует ли уже вакансия и была ли она спарсена сегодня
        $vacancy = $this->entityManager->getRepository(Vacancy::class)
            ->createQueryBuilder('v')
            ->where('v.source = :source')
            ->andWhere('v.sourceId = :sourceId')
            ->andWhere('v.parsedAt >= :todayStart')
            ->andWhere('v.parsedAt < :todayEnd')
            ->setParameter('source', DataSource::HH)
            ->setParameter('sourceId', $sourceId)
            ->setParameter('todayStart', $todayStart)
            ->setParameter('todayEnd', $todayEnd)
            ->getQuery()
            ->getOneOrNullResult();

        // if (!$vacancy) {
        //     // Если не найдена сегодня, ищем вообще (может быть спарсена вчера)
        //     $vacancy = $this->entityManager->getRepository(Vacancy::class)
        //         ->findOneBy([
        //             'source' => DataSource::HH,
        //             'sourceId' => $sourceId,
        //         ]);
        // }

        if (!$vacancy) {
            $vacancy = new Vacancy();
            $vacancy->setSource(DataSource::HH);
            $vacancy->setSourceId($sourceId);
            $stats['vacancies_created']++;
        } else {
            $stats['vacancies_updated']++;
        }

        // Обновляем данные вакансии
        $vacancy->setName($data['name'] ?? '');
        
        // Описание и требования из snippet
        if (isset($data['snippet'])) {
            $snippet = $data['snippet'];
            $description = '';
            if (!empty($snippet['requirement'])) {
                $description .= '<p><strong>Требования:</strong> ' . $snippet['requirement'] . '</p>';
            }
            if (!empty($snippet['responsibility'])) {
                $description .= '<p><strong>Обязанности:</strong> ' . $snippet['responsibility'] . '</p>';
            }
            if ($description) {
                $vacancy->setDescription($description);
            }
            if (!empty($snippet['requirement'])) {
                $vacancy->setRequirements($snippet['requirement']);
            }
        }

        // Локация не сохраняем - всегда парсим только Татарстан

        // Роль
        if (isset($data['professional_roles'][0]['id'])) {
            $role = HhRole::fromId($data['professional_roles'][0]['id']);
            if ($role) {
                $vacancy->setHhRole($role);
            }
        }

        // Зарплата
        if (isset($data['salary'])) {
            $salary = $data['salary'];
            if (isset($salary['from'])) {
                $vacancy->setSalaryFrom((int) $salary['from']);
            }
            if (isset($salary['to'])) {
                $vacancy->setSalaryTo((int) $salary['to']);
            }
            if (isset($salary['currency'])) {
                $vacancy->setSalaryCurrency($salary['currency']);
            }
        }

        // Дата публикации
        if (isset($data['published_at'])) {
            try {
                $publishedAt = new \DateTimeImmutable($data['published_at']);
                $vacancy->setPublishedAt($publishedAt);
            } catch (\Exception $e) {
                // Игнорируем ошибки парсинга даты
            }
        }

        // Обновляем время парсинга
        $vacancy->updateParsedAt();

        // Обрабатываем работодателя
        if (isset($data['employer'])) {
            $employer = $this->parseEmployer($data['employer'], $stats);
            $vacancy->setEmployer($employer);
        }

        $this->entityManager->persist($vacancy);
    }

    /**
     * Парсинг работодателя
     */
    private function parseEmployer(array $data, array &$stats): Employer
    {
        $sourceId = (string) $data['id'];

        // Проверяем, существует ли уже работодатель
        $employer = $this->entityManager->getRepository(Employer::class)
            ->findOneBy([
                'source' => DataSource::HH,
                'sourceId' => $sourceId,
            ]);

        if (!$employer) {
            $employer = new Employer();
            $employer->setSource(DataSource::HH);
            $employer->setSourceId($sourceId);
            $stats['employers_created']++;
        } else {
            $stats['employers_updated']++;
        }

        // Обновляем данные работодателя
        $employer->setName($data['name'] ?? '');

        // Локация (если есть в данных работодателя)
        // В API HH работодатель может не иметь прямой локации, но можно получить из вакансий

        $this->entityManager->persist($employer);

        return $employer;
    }

    /**
     * Выполнение HTTP запроса к API
     */
    private function fetchApi(string $url): ?string
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'User-Agent: HH-Parser/1.0',
                    'Accept: application/json',
                ],
                'timeout' => 30,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);

        if ($response === false) {
            $error = error_get_last();
            $this->logger?->error('Ошибка HTTP запроса', [
                'url' => $url,
                'error' => $error['message'] ?? 'Unknown error',
            ]);
            return null;
        }

        return $response;
    }

    /**
     * Парсинг вакансий для всех ролей из HhRole enum
     * Всегда парсит только Татарстан (area=1624)
     *
     * @param int|null $maxPages Максимальное количество страниц для каждой роли (null = все)
     * @return array Общая статистика парсинга
     */
    public function parseAllRoles(?int $maxPages = null): array
    {
        $this->logger?->info('Начало парсинга всех ролей');

        $totalStats = [
            'roles_processed' => 0,
            'total_found' => 0,
            'total_pages_parsed' => 0,
            'total_employers_created' => 0,
            'total_employers_updated' => 0,
            'total_vacancies_created' => 0,
            'total_vacancies_updated' => 0,
            'total_errors' => 0,
            'roles' => [],
        ];

        $roles = HhRole::cases();

        foreach ($roles as $role) {
            $this->logger?->info('Парсинг роли', [
                'role' => $role->getName(),
                'role_id' => $role->getId(),
            ]);

            try {
                $roleStats = $this->parseByRole($role, $maxPages);

                $totalStats['roles_processed']++;
                $totalStats['total_found'] += $roleStats['total_found'];
                $totalStats['total_pages_parsed'] += $roleStats['pages_parsed'];
                $totalStats['total_employers_created'] += $roleStats['employers_created'];
                $totalStats['total_employers_updated'] += $roleStats['employers_updated'];
                $totalStats['total_vacancies_created'] += $roleStats['vacancies_created'];
                $totalStats['total_vacancies_updated'] += $roleStats['vacancies_updated'];
                $totalStats['total_errors'] += $roleStats['errors'];

                $totalStats['roles'][] = [
                    'role' => $role->getName(),
                    'role_id' => $role->getId(),
                    'stats' => $roleStats,
                ];

                // Небольшая задержка между ролями
                // usleep(500000); // 0.5 секунды

            } catch (\Exception $e) {
                $totalStats['total_errors']++;
                $this->logger?->error('Ошибка при парсинге роли', [
                    'role' => $role->getName(),
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->logger?->info('Парсинг всех ролей завершен', $totalStats);

        return $totalStats;
    }
}

