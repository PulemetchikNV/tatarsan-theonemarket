<?php

namespace App\Controller;

use App\Service\MetricsService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/metrics', name: 'metrics_')]
class MetricsController extends AbstractController
{
    public function __construct(
        private readonly MetricsService $metricsService
    ) {
    }

    /**
     * Получить все метрики за период
     * 
     * Query параметры:
     * - start_date: Начальная дата (формат: Y-m-d, по умолчанию: 30 дней назад)
     * - end_date: Конечная дата (формат: Y-m-d, по умолчанию: сегодня)
     * - region: Регион для фильтрации (опционально)
     */
    #[Route('', name: 'get_all', methods: ['GET'])]
    public function getMetrics(Request $request): JsonResponse
    {
        $startDateStr = $request->query->get('start_date');
        $endDateStr = $request->query->get('end_date');
        $region = $request->query->get('region');

        // Определяем даты
        $endDate = $endDateStr 
            ? \DateTimeImmutable::createFromFormat('Y-m-d', $endDateStr)
            : new \DateTimeImmutable('today');

        $startDate = $startDateStr
            ? \DateTimeImmutable::createFromFormat('Y-m-d', $startDateStr)
            : (clone $endDate)->modify('-30 days');

        // Валидация дат
        if ($startDate === false || $endDate === false) {
            return $this->json([
                'success' => false,
                'error' => 'Неверный формат даты. Используйте формат Y-m-d (например: 2024-01-01)',
            ], 400);
        }

        if ($startDate > $endDate) {
            return $this->json([
                'success' => false,
                'error' => 'Начальная дата не может быть больше конечной',
            ], 400);
        }

        // Ограничение на период (максимум 2 года)
        $maxPeriod = $startDate->modify('+2 years');
        if ($endDate > $maxPeriod) {
            return $this->json([
                'success' => false,
                'error' => 'Период не может превышать 2 года',
            ], 400);
        }

        try {
            $metrics = $this->metricsService->getMetrics($startDate, $endDate, $region);

            return $this->json([
                'success' => true,
                'data' => $metrics,
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'region' => $region,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Ошибка при вычислении метрик: ' . $e->getMessage(),
            ], 500);
        }
    }
}

