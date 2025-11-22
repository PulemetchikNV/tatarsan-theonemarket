<?php

namespace App\Service;

use App\Entity\Resume;
use App\Entity\Vacancy;
use App\Enum\DataSource;
use App\Enum\HhRole;
use Doctrine\ORM\EntityManagerInterface;

class MetricsService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * Получить все метрики за период
     *
     * @param \DateTimeImmutable $startDate
     * @param \DateTimeImmutable $endDate
     * @param string|null $region Регион для фильтрации (опционально)
     * @return array
     */
    public function getMetrics(
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
        ?string $region = null
    ): array {
        $connection = $this->entityManager->getConnection();

        return [
            'quantitative' => $this->getQuantitativeMetrics($connection, $startDate, $endDate, $region),
            'salary' => $this->getSalaryMetrics($connection, $startDate, $endDate, $region),
            'structural' => $this->getStructuralMetrics($connection, $startDate, $endDate, $region),
            'dynamics' => $this->getDynamicsMetrics($connection, $startDate, $endDate, $region),
        ];
    }

    /**
     * Количественные метрики
     */
    private function getQuantitativeMetrics(
        $connection,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
        ?string $region
    ): array {
        // Количество активных IT-вакансий в регионе
        $vacanciesCount = $this->getActiveVacanciesCount($connection, $startDate, $endDate, $region);

        // Количество резюме IT-специалистов
        $resumesCount = $this->getResumesCount($connection, $startDate, $endDate, $region);

        // Коэффициент конкуренции по уровням
        $competitionRatios = $this->getCompetitionRatios($connection, $startDate, $endDate, $region);

        return [
            'active_vacancies' => $vacanciesCount,
            'resumes_count' => $resumesCount,
            'competition_ratios' => $competitionRatios,
        ];
    }

    /**
     * Зарплатные показатели
     */
    private function getSalaryMetrics(
        $connection,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
        ?string $region
    ): array {
        // Медианная зарплата по уровням
        $medianSalaries = $this->getMedianSalariesByLevel($connection, $startDate, $endDate, $region);

        // Разрыв между зарплатами в регионе и в Москве/СПб
        $salaryGap = $this->getSalaryGapWithMoscow($connection, $startDate, $endDate, $region);

        // Зарплатная вилка по специализациям
        $salaryRanges = $this->getSalaryRangesBySpecialization($connection, $startDate, $endDate, $region);

        // Доля вакансий с указанием зарплаты
        $salarySpecifiedRatio = $this->getSalarySpecifiedRatio($connection, $startDate, $endDate, $region);

        return [
            'median_by_level' => $medianSalaries,
            'gap_with_moscow' => $salaryGap,
            'ranges_by_specialization' => $salaryRanges,
            'salary_specified_ratio' => $salarySpecifiedRatio,
        ];
    }

    /**
     * Структурные показатели
     */
    private function getStructuralMetrics(
        $connection,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
        ?string $region
    ): array {
        // Доля удалённых вакансий
        $remoteRatio = $this->getRemoteVacanciesRatio($connection, $startDate, $endDate, $region);

        // Распределение по специализациям
        $specializationDistribution = $this->getSpecializationDistribution($connection, $startDate, $endDate, $region);

        // Доля вакансий от технологических компаний
        $techCompaniesRatio = $this->getTechCompaniesRatio($connection, $startDate, $endDate, $region);

        // Средний срок закрытия вакансии (по published_at и parsed_at)
        $avgClosingTime = $this->getAverageClosingTime($connection, $startDate, $endDate, $region);

        return [
            'remote_ratio' => $remoteRatio,
            'specialization_distribution' => $specializationDistribution,
            'tech_companies_ratio' => $techCompaniesRatio,
            'average_closing_time_days' => $avgClosingTime,
        ];
    }

    /**
     * Динамика изменения числа вакансий (год к году)
     */
    private function getDynamicsMetrics(
        $connection,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
        ?string $region
    ): array {
        $currentYear = (int) $endDate->format('Y');
        $previousYear = $currentYear - 1;

        $currentYearStart = new \DateTimeImmutable("{$currentYear}-01-01");
        $currentYearEnd = new \DateTimeImmutable("{$currentYear}-12-31 23:59:59");
        $previousYearStart = new \DateTimeImmutable("{$previousYear}-01-01");
        $previousYearEnd = new \DateTimeImmutable("{$previousYear}-12-31 23:59:59");

        $currentCount = $this->getActiveVacanciesCount($connection, $currentYearStart, $currentYearEnd, $region);
        $previousCount = $this->getActiveVacanciesCount($connection, $previousYearStart, $previousYearEnd, $region);

        $change = $previousCount > 0
            ? round((($currentCount - $previousCount) / $previousCount) * 100, 2)
            : ($currentCount > 0 ? 100 : 0);

        return [
            'current_year' => $currentYear,
            'previous_year' => $previousYear,
            'current_count' => $currentCount,
            'previous_count' => $previousCount,
            'change_percent' => $change,
        ];
    }

    /**
     * Количество активных IT-вакансий
     */
    private function getActiveVacanciesCount($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): int
    {
        $sql = "
            SELECT COUNT(DISTINCT v.id) as count
            FROM vacancies v
            WHERE v.source = :source
                AND v.parsed_at >= :startDate
                AND v.parsed_at <= :endDate
        ";

        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
        ];

        // TODO: Добавить фильтр по региону, когда будет поле area_id в Vacancy

        $result = $connection->executeQuery($sql, $params)->fetchAssociative();
        return (int) ($result['count'] ?? 0);
    }

    /**
     * Количество резюме IT-специалистов
     */
    private function getResumesCount($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): int
    {
        $sql = "
            SELECT COUNT(DISTINCT r.id) as count
            FROM resumes r
            WHERE r.source = :source
                AND r.parsed_at >= :startDate
                AND r.parsed_at <= :endDate
        ";

        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
        ];

        $result = $connection->executeQuery($sql, $params)->fetchAssociative();
        return (int) ($result['count'] ?? 0);
    }

    /**
     * Коэффициент конкуренции (резюме/вакансии) по уровням
     */
    private function getCompetitionRatios($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): array
    {
        $levels = ['junior', 'middle', 'senior'];

        $ratios = [];
        foreach ($levels as $level) {
            $vacanciesCount = $this->getVacanciesCountByLevel($connection, $startDate, $endDate, $level, $region);
            $resumesCount = $this->getResumesCountByLevel($connection, $startDate, $endDate, $level, $region);

            $ratio = $vacanciesCount > 0
                ? round($resumesCount / $vacanciesCount, 2)
                : ($resumesCount > 0 ? null : 0);

            $ratios[$level] = [
                'vacancies' => $vacanciesCount,
                'resumes' => $resumesCount,
                'ratio' => $ratio,
            ];
        }

        return $ratios;
    }

    /**
     * Количество вакансий по уровню
     */
    private function getVacanciesCountByLevel($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, string $level, ?string $region): int
    {
        $levelPattern = $this->getLevelPattern($level);

        $sql = "
            SELECT COUNT(DISTINCT v.id) as count
            FROM vacancies v
            WHERE v.source = :source
                AND v.parsed_at >= :startDate
                AND v.parsed_at <= :endDate
                AND (
                    LOWER(v.name) LIKE :pattern
                    OR LOWER(v.description) LIKE :pattern
                )
        ";

        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
            'pattern' => $levelPattern,
        ];

        $result = $connection->executeQuery($sql, $params)->fetchAssociative();
        return (int) ($result['count'] ?? 0);
    }

    /**
     * Количество резюме по уровню
     */
    private function getResumesCountByLevel($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, string $level, ?string $region): int
    {
        $levelPattern = $this->getLevelPattern($level);

        $sql = "
            SELECT COUNT(DISTINCT r.id) as count
            FROM resumes r
            WHERE r.source = :source
                AND r.parsed_at >= :startDate
                AND r.parsed_at <= :endDate
                AND (
                    LOWER(r.name) LIKE :pattern
                    OR LOWER(r.description) LIKE :pattern
                )
        ";

        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
            'pattern' => $levelPattern,
        ];

        $result = $connection->executeQuery($sql, $params)->fetchAssociative();
        return (int) ($result['count'] ?? 0);
    }

    /**
     * Получить паттерн для поиска уровня
     */
    private function getLevelPattern(string $level): string
    {
        $patterns = [
            'junior' => '%junior%',
            'middle' => '%middle%',
            'senior' => '%senior%',
        ];

        return $patterns[$level] ?? '%';
    }

    /**
     * Медианная зарплата по уровням
     */
    private function getMedianSalariesByLevel($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): array
    {
        $levels = ['junior', 'middle', 'senior'];
        $medians = [];

        foreach ($levels as $level) {
            $levelPattern = $this->getLevelPattern($level);

            // Для MySQL используем подзапрос для вычисления медианы
            $sql = "
                SELECT AVG(salary) as median
                FROM (
                    SELECT 
                        CASE 
                            WHEN v.salary_from IS NOT NULL AND v.salary_to IS NOT NULL 
                            THEN (v.salary_from + v.salary_to) / 2
                            WHEN v.salary_from IS NOT NULL 
                            THEN v.salary_from
                            WHEN v.salary_to IS NOT NULL 
                            THEN v.salary_to
                            ELSE NULL
                        END as salary
                    FROM vacancies v
                    WHERE v.source = :source
                        AND v.parsed_at >= :startDate
                        AND v.parsed_at <= :endDate
                        AND (
                            LOWER(v.name) LIKE :pattern
                            OR LOWER(v.description) LIKE :pattern
                        )
                        AND v.salary_currency = 'RUR'
                        AND (v.salary_from IS NOT NULL OR v.salary_to IS NOT NULL)
                    ORDER BY salary
                    LIMIT 2 - (SELECT COUNT(*) FROM vacancies v2 
                        WHERE v2.source = :source2
                        AND v2.parsed_at >= :startDate2
                        AND v2.parsed_at <= :endDate2
                        AND (LOWER(v2.name) LIKE :pattern2 OR LOWER(v2.description) LIKE :pattern2)
                        AND v2.salary_currency = 'RUR'
                        AND (v2.salary_from IS NOT NULL OR v2.salary_to IS NOT NULL)
                        AND (
                            CASE 
                                WHEN v2.salary_from IS NOT NULL AND v2.salary_to IS NOT NULL 
                                THEN (v2.salary_from + v2.salary_to) / 2
                                WHEN v2.salary_from IS NOT NULL 
                                THEN v2.salary_from
                                WHEN v2.salary_to IS NOT NULL 
                                THEN v2.salary_to
                                ELSE NULL
                            END
                        ) < (
                            CASE 
                                WHEN v.salary_from IS NOT NULL AND v.salary_to IS NOT NULL 
                                THEN (v.salary_from + v.salary_to) / 2
                                WHEN v.salary_from IS NOT NULL 
                                THEN v.salary_from
                                WHEN v.salary_to IS NOT NULL 
                                THEN v.salary_to
                                ELSE NULL
                            END
                        )
                    ) % 2
                    OFFSET (SELECT (COUNT(*) - 1) / 2 FROM vacancies v3 
                        WHERE v3.source = :source3
                        AND v3.parsed_at >= :startDate3
                        AND v3.parsed_at <= :endDate3
                        AND (LOWER(v3.name) LIKE :pattern3 OR LOWER(v3.description) LIKE :pattern3)
                        AND v3.salary_currency = 'RUR'
                        AND (v3.salary_from IS NOT NULL OR v3.salary_to IS NOT NULL)
                    )
                ) as subquery
            ";

            // Для PostgreSQL используем percentile_cont для точной медианы
            $sql = "
                SELECT 
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 
                        CASE 
                            WHEN v.salary_from IS NOT NULL AND v.salary_to IS NOT NULL 
                            THEN (v.salary_from + v.salary_to) / 2
                            WHEN v.salary_from IS NOT NULL 
                            THEN v.salary_from
                            WHEN v.salary_to IS NOT NULL 
                            THEN v.salary_to
                            ELSE NULL
                        END
                    ) as median
                FROM vacancies v
                WHERE v.source = :source
                    AND v.parsed_at >= :startDate
                    AND v.parsed_at <= :endDate
                    AND (
                        LOWER(v.name) LIKE :pattern
                        OR LOWER(v.description) LIKE :pattern
                    )
                    AND v.salary_currency = 'RUR'
                    AND (v.salary_from IS NOT NULL OR v.salary_to IS NOT NULL)
            ";

            $params = [
                'source' => DataSource::HH->value,
                'startDate' => $startDate->format('Y-m-d H:i:s'),
                'endDate' => $endDate->format('Y-m-d H:i:s'),
                'pattern' => $levelPattern,
            ];

            $result = $connection->executeQuery($sql, $params)->fetchAssociative();
            $medians[$level] = $result['median'] !== null ? (int) round((float) $result['median']) : null;
        }

        return $medians;
    }

    /**
     * Разрыв между зарплатами в регионе и в Москве/СПб
     */
    private function getSalaryGapWithMoscow($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): ?array
    {
        // TODO: Реализовать когда будет поле area_id в Vacancy
        // Пока возвращаем null, так как нет информации о регионе
        return null;
    }

    /**
     * Зарплатная вилка по специализациям
     */
    private function getSalaryRangesBySpecialization($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): array
    {
        $specializations = $this->getSpecializations();

        $ranges = [];
        foreach ($specializations as $spec) {
            $pattern = $spec['pattern'];

            // Формируем условие для роли
            $roleCondition = '';
            $params = [
                'source' => DataSource::HH->value,
                'startDate' => $startDate->format('Y-m-d H:i:s'),
                'endDate' => $endDate->format('Y-m-d H:i:s'),
                'pattern' => $pattern,
            ];

            if (!empty($spec['role_id'])) {
                $roleCondition = 'OR v.role = :roleId';
                $params['roleId'] = $spec['role_id'];
            }

            $sql = "
                SELECT 
                    MIN(
                        CASE 
                            WHEN v.salary_from IS NOT NULL THEN v.salary_from
                            WHEN v.salary_to IS NOT NULL THEN v.salary_to
                            ELSE NULL
                        END
                    ) as min_salary,
                    MAX(
                        CASE 
                            WHEN v.salary_to IS NOT NULL THEN v.salary_to
                            WHEN v.salary_from IS NOT NULL THEN v.salary_from
                            ELSE NULL
                        END
                    ) as max_salary,
                    AVG(
                        CASE 
                            WHEN v.salary_from IS NOT NULL AND v.salary_to IS NOT NULL 
                            THEN (v.salary_from + v.salary_to) / 2
                            WHEN v.salary_from IS NOT NULL 
                            THEN v.salary_from
                            WHEN v.salary_to IS NOT NULL 
                            THEN v.salary_to
                            ELSE NULL
                        END
                    ) as avg_salary
                FROM vacancies v
                WHERE v.source = :source
                    AND v.parsed_at >= :startDate
                    AND v.parsed_at <= :endDate
                    AND (
                        LOWER(v.name) LIKE :pattern
                        OR LOWER(v.description) LIKE :pattern
                        {$roleCondition}
                    )
                    AND v.salary_currency = 'RUR'
                    AND (v.salary_from IS NOT NULL OR v.salary_to IS NOT NULL)
            ";

            $result = $connection->executeQuery($sql, $params)->fetchAssociative();

            $ranges[$spec['name']] = [
                'min' => $result['min_salary'] !== null ? (int) $result['min_salary'] : null,
                'max' => $result['max_salary'] !== null ? (int) $result['max_salary'] : null,
                'avg' => $result['avg_salary'] !== null ? (int) round((float) $result['avg_salary']) : null,
            ];
        }

        return $ranges;
    }

    /**
     * Доля вакансий с указанием зарплаты
     */
    private function getSalarySpecifiedRatio($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): float
    {
        $sql = "
            SELECT 
                COUNT(CASE WHEN v.salary_from IS NOT NULL OR v.salary_to IS NOT NULL THEN 1 END) as with_salary,
                COUNT(*) as total
            FROM vacancies v
            WHERE v.source = :source
                AND v.parsed_at >= :startDate
                AND v.parsed_at <= :endDate
        ";

        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
        ];

        $result = $connection->executeQuery($sql, $params)->fetchAssociative();

        $total = (int) ($result['total'] ?? 0);
        if ($total === 0) {
            return 0.0;
        }

        $withSalary = (int) ($result['with_salary'] ?? 0);
        return round(($withSalary / $total) * 100, 2);
    }

    /**
     * Доля удалённых вакансий
     */
    private function getRemoteVacanciesRatio($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): float
    {
        $remotePatterns = ['%удален%', '%remote%', '%work from home%', '%work from home%', '%дистанцион%'];

        $sql = "
            SELECT 
                COUNT(CASE WHEN (
                    LOWER(v.name) LIKE :pattern1
                    OR LOWER(v.name) LIKE :pattern2
                    OR LOWER(v.name) LIKE :pattern3
                    OR LOWER(v.description) LIKE :pattern1
                    OR LOWER(v.description) LIKE :pattern2
                    OR LOWER(v.description) LIKE :pattern3
                ) THEN 1 END) as remote_count,
                COUNT(*) as total
            FROM vacancies v
            WHERE v.source = :source
                AND v.parsed_at >= :startDate
                AND v.parsed_at <= :endDate
        ";

        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
            'pattern1' => '%удален%',
            'pattern2' => '%remote%',
            'pattern3' => '%дистанцион%',
        ];

        $result = $connection->executeQuery($sql, $params)->fetchAssociative();

        $total = (int) ($result['total'] ?? 0);
        if ($total === 0) {
            return 0.0;
        }

        $remoteCount = (int) ($result['remote_count'] ?? 0);
        return round(($remoteCount / $total) * 100, 2);
    }

    /**
     * Распределение по специализациям
     */
    private function getSpecializationDistribution($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): array
    {
        $specializations = $this->getSpecializations();
        $total = $this->getActiveVacanciesCount($connection, $startDate, $endDate, $region);

        $distribution = [];
        foreach ($specializations as $spec) {
            $pattern = $spec['pattern'];

            // Формируем условие для роли
            $roleCondition = '';
            $params = [
                'source' => DataSource::HH->value,
                'startDate' => $startDate->format('Y-m-d H:i:s'),
                'endDate' => $endDate->format('Y-m-d H:i:s'),
                'pattern' => $pattern,
            ];

            if (!empty($spec['role_id'])) {
                $roleCondition = 'OR v.role = :roleId';
                $params['roleId'] = $spec['role_id'];
            }

            $sql = "
                SELECT COUNT(DISTINCT v.id) as count
                FROM vacancies v
                WHERE v.source = :source
                    AND v.parsed_at >= :startDate
                    AND v.parsed_at <= :endDate
                    AND (
                        LOWER(v.name) LIKE :pattern
                        OR LOWER(v.description) LIKE :pattern
                        {$roleCondition}
                    )
            ";

            $result = $connection->executeQuery($sql, $params)->fetchAssociative();
            $count = (int) ($result['count'] ?? 0);

            $distribution[$spec['name']] = [
                'count' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 2) : 0,
            ];
        }

        return $distribution;
    }

    /**
     * Доля вакансий от технологических компаний
     */
    private function getTechCompaniesRatio($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): float
    {
        $techPatterns = [
            '%разработк%', '%программирован%', '%IT%', '%айти%', '%софт%', '%технолог%',
            '%digital%', '%software%', '%tech%', '%информационн%', '%компьютер%'
        ];

        $sql = "
            SELECT 
                COUNT(CASE WHEN (
                    LOWER(e.name) LIKE :pattern1
                    OR LOWER(e.name) LIKE :pattern2
                    OR LOWER(e.description) LIKE :pattern1
                    OR LOWER(e.description) LIKE :pattern2
                ) THEN 1 END) as tech_count,
                COUNT(*) as total
            FROM vacancies v
            INNER JOIN employers e ON v.employer_id = e.id
            WHERE v.source = :source
                AND v.parsed_at >= :startDate
                AND v.parsed_at <= :endDate
        ";

        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
            'pattern1' => '%IT%',
            'pattern2' => '%разработк%',
        ];

        $result = $connection->executeQuery($sql, $params)->fetchAssociative();

        $total = (int) ($result['total'] ?? 0);
        if ($total === 0) {
            return 0.0;
        }

        $techCount = (int) ($result['tech_count'] ?? 0);
        return round(($techCount / $total) * 100, 2);
    }

    /**
     * Средний срок закрытия вакансии (в днях)
     */
    private function getAverageClosingTime($connection, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate, ?string $region): ?float
    {
        // Для PostgreSQL используем EXTRACT для вычисления разницы в днях
        $sql = "
            SELECT 
                AVG(EXTRACT(EPOCH FROM (v.parsed_at - v.published_at)) / 86400) as avg_days
            FROM vacancies v
            WHERE v.source = :source
                AND v.parsed_at >= :startDate
                AND v.parsed_at <= :endDate
                AND v.published_at IS NOT NULL
                AND v.parsed_at >= v.published_at
        ";

        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
        ];

        $result = $connection->executeQuery($sql, $params)->fetchAssociative();

        return $result['avg_days'] !== null ? round((float) $result['avg_days'], 2) : null;
    }

    /**
     * Получить список специализаций с паттернами
     */
    private function getSpecializations(): array
    {
        return [
            [
                'name' => 'backend',
                'pattern' => '%backend%',
                'role_id' => HhRole::DEVELOPER->getId(),
            ],
            [
                'name' => 'frontend',
                'pattern' => '%frontend%',
                'role_id' => HhRole::DEVELOPER->getId(),
            ],
            [
                'name' => 'mobile',
                'pattern' => '%mobile%',
                'role_id' => HhRole::DEVELOPER->getId(),
            ],
            [
                'name' => 'data_science',
                'pattern' => '%data science%',
                'role_id' => HhRole::DATA_SCIENTIST->getId(),
            ],
            [
                'name' => 'devops',
                'pattern' => '%devops%',
                'role_id' => HhRole::DEVOPS_ENGINEER->getId(),
            ],
            [
                'name' => 'analytics',
                'pattern' => '%аналитик%',
                'role_id' => HhRole::ANALYST->getId(),
            ],
            [
                'name' => 'qa',
                'pattern' => '%qa%',
                'role_id' => HhRole::QA_ENGINEER->getId(),
            ],
        ];
    }
}

