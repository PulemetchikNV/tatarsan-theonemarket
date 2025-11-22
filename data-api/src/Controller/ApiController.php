<?php

namespace App\Controller;

use App\Enum\DataSource;
use App\Enum\HhRole;
use App\Entity\Employer;
use App\Entity\Vacancy;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_')]
class ApiController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * Получить список всех ролей
     */
    #[Route('/roles', name: 'roles', methods: ['GET'])]
    public function getRoles(): JsonResponse
    {
        $roles = HhRole::getAll();

        return $this->json([
            'success' => true,
            'data' => $roles,
            'total' => count($roles),
        ]);
    }

    /**
     * Статистика изменения количества вакансий по дням
     * 
     * Query параметры:
     * - role: ID роли для фильтрации (опционально)
     * - days: Количество дней для анализа (по умолчанию 30)
     */
    #[Route('/vacancies/stats/daily', name: 'vacancies_stats_daily', methods: ['GET'])]
    public function getDailyStats(Request $request): JsonResponse
    {
        $roleId = $request->query->get('role');
        $days = (int) ($request->query->get('days', 30));

        // Валидация days
        if ($days < 1 || $days > 365) {
            return $this->json([
                'success' => false,
                'error' => 'Параметр days должен быть от 1 до 365',
            ], 400);
        }

        // Валидация role
        $role = null;
        if ($roleId) {
            $role = HhRole::fromId($roleId);
            if (!$role) {
                return $this->json([
                    'success' => false,
                    'error' => "Роль с ID '{$roleId}' не найдена",
                ], 400);
            }
        }

        // Вычисляем даты
        $endDate = new \DateTimeImmutable('today');
        $startDate = $endDate->modify("-{$days} days");

        // Строим запрос через DBAL для использования SQL функций
        $connection = $this->entityManager->getConnection();
        
        $sql = "
            SELECT 
                DATE(v.parsed_at) as date,
                COUNT(v.id) as count
            FROM vacancies v
            WHERE v.source = :source
                AND v.parsed_at >= :startDate
                AND v.parsed_at < :endDate
        ";
        
        $params = [
            'source' => DataSource::HH->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->modify('+1 day')->format('Y-m-d H:i:s'),
        ];
        
        // Фильтр по роли
        if ($role) {
            $sql .= " AND v.role = :roleId";
            $params['roleId'] = $role->getId();
        }
        
        $sql .= " GROUP BY DATE(v.parsed_at) ORDER BY date ASC";
        
        $results = $connection->executeQuery($sql, $params)->fetchAllAssociative();

        // Формируем полный список дней (заполняем пропуски нулями)
        $stats = [];
        $currentDate = $startDate;
        $resultsMap = [];
        
        foreach ($results as $result) {
            $resultsMap[$result['date']] = (int) $result['count'];
        }

        while ($currentDate <= $endDate) {
            $dateKey = $currentDate->format('Y-m-d');
            $stats[] = [
                'date' => $dateKey,
                'count' => $resultsMap[$dateKey] ?? 0,
            ];
            $currentDate = $currentDate->modify('+1 day');
        }

        return $this->json([
            'success' => true,
            'data' => $stats,
            'filters' => [
                'role' => $role ? [
                    'id' => $role->getId(),
                    'name' => $role->getName(),
                ] : null,
                'days' => $days,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'total' => count($stats),
        ]);
    }

    /**
     * Получить список работодателей
     * 
     * Query параметры:
     * - page: Номер страницы (по умолчанию 1)
     * - limit: Количество на странице (по умолчанию 20, максимум 100)
     * - search: Поиск по названию (опционально)
     */
    #[Route('/employers', name: 'employers', methods: ['GET'])]
    public function getEmployers(Request $request): JsonResponse
    {
        $page = max(1, (int) ($request->query->get('page', 1)));
        $limit = min(100, max(1, (int) ($request->query->get('limit', 20))));
        $search = $request->query->get('search');

        $qb = $this->entityManager->getRepository(Employer::class)
            ->createQueryBuilder('e')
            ->where('e.source = :source')
            ->setParameter('source', DataSource::HH);

        // Поиск по названию
        if ($search) {
            $qb->andWhere('e.name LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        // Подсчет общего количества
        $totalQb = clone $qb;
        $total = (int) $totalQb->select('COUNT(e.id)')
            ->getQuery()
            ->getSingleScalarResult();

        // Пагинация
        $offset = ($page - 1) * $limit;
        $employers = $qb->select('e')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->orderBy('e.name', 'ASC')
            ->getQuery()
            ->getResult();

        // Формируем ответ
        $data = array_map(function (Employer $employer) {
            return [
                'id' => $employer->getId(),
                'name' => $employer->getName(),
                'description' => $employer->getDescription(),
                'source' => $employer->getSource()->value,
                'source_id' => $employer->getSourceId(),
                'vacancies_count' => $employer->getVacancies()->count(),
                'created_at' => $employer->getCreatedAt()->format('Y-m-d H:i:s'),
                'updated_at' => $employer->getUpdatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $employers);

        return $this->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => (int) ceil($total / $limit),
            ],
        ]);
    }

    /**
     * Получить детальную информацию о работодателе
     */
    #[Route('/employers/{id}', name: 'employer_detail', methods: ['GET'])]
    public function getEmployer(int $id): JsonResponse
    {
        $employer = $this->entityManager->getRepository(Employer::class)->find($id);

        if (!$employer) {
            return $this->json([
                'success' => false,
                'error' => 'Работодатель не найден',
            ], 404);
        }

        // Получаем вакансии работодателя
        $vacancies = $employer->getVacancies()->toArray();
        $vacanciesData = array_map(function (Vacancy $vacancy) {
            return [
                'id' => $vacancy->getId(),
                'name' => $vacancy->getName(),
                'description' => $vacancy->getDescription(),
                'requirements' => $vacancy->getRequirements(),
                'role' => $vacancy->getRole(),
                'role_name' => $vacancy->getHhRole()?->getName(),
                'salary_from' => $vacancy->getSalaryFrom(),
                'salary_to' => $vacancy->getSalaryTo(),
                'salary_currency' => $vacancy->getSalaryCurrency(),
                'published_at' => $vacancy->getPublishedAt()?->format('Y-m-d H:i:s'),
                'parsed_at' => $vacancy->getParsedAt()->format('Y-m-d H:i:s'),
            ];
        }, $vacancies);

        return $this->json([
            'success' => true,
            'data' => [
                'id' => $employer->getId(),
                'name' => $employer->getName(),
                'description' => $employer->getDescription(),
                'source' => $employer->getSource()->value,
                'source_id' => $employer->getSourceId(),
                'vacancies_count' => count($vacancies),
                'vacancies' => $vacanciesData,
                'created_at' => $employer->getCreatedAt()->format('Y-m-d H:i:s'),
                'updated_at' => $employer->getUpdatedAt()->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}

