<?php

namespace App\Command;

use App\Entity\Employer;
use App\Entity\Vacancy;
use App\Enum\DataSource;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:interpolate-vacancies',
    description: 'Интерполяция данных вакансий за последние 90 дней для отслеживания динамики'
)]
class InterpolateVacanciesCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption(
                'days',
                'd',
                InputOption::VALUE_OPTIONAL,
                'Количество дней для интерполяции (по умолчанию 90)',
                '90'
            )
            ->addOption(
                'duplicate-probability',
                null,
                InputOption::VALUE_OPTIONAL,
                'Вероятность дублирования существующей вакансии (0-100, по умолчанию 40)',
                '40'
            )
            ->addOption(
                'new-probability',
                null,
                InputOption::VALUE_OPTIONAL,
                'Вероятность создания новой вакансии на основе существующей (0-100, по умолчанию 30)',
                '30'
            )
            ->addOption(
                'vacancies-per-day',
                null,
                InputOption::VALUE_OPTIONAL,
                'Среднее количество вакансий в день (по умолчанию 50)',
                '50'
            )
            ->addOption(
                'salary-variation',
                null,
                InputOption::VALUE_OPTIONAL,
                'Процент вариации зарплаты (0-100, по умолчанию 15)',
                '15'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $days = (int) $input->getOption('days');
        $duplicateProbability = (int) $input->getOption('duplicate-probability');
        $newProbability = (int) $input->getOption('new-probability');
        $avgVacanciesPerDay = (int) $input->getOption('vacancies-per-day');
        $salaryVariation = (int) $input->getOption('salary-variation');

        // Валидация
        if ($days < 1 || $days > 365) {
            $io->error('Количество дней должно быть от 1 до 365');
            return Command::FAILURE;
        }

        if ($duplicateProbability < 0 || $duplicateProbability > 100) {
            $io->error('Вероятность дублирования должна быть от 0 до 100');
            return Command::FAILURE;
        }

        if ($newProbability < 0 || $newProbability > 100) {
            $io->error('Вероятность создания новой вакансии должна быть от 0 до 100');
            return Command::FAILURE;
        }

        $io->title('Интерполяция данных вакансий');

        $io->info(sprintf('Период: последние %d дней', $days));
        $io->info(sprintf('Вероятность дублирования: %d%%', $duplicateProbability));
        $io->info(sprintf('Вероятность новой вакансии: %d%%', $newProbability));
        $io->info(sprintf('Среднее количество вакансий в день: %d', $avgVacanciesPerDay));
        $io->info(sprintf('Вариация зарплаты: ±%d%%', $salaryVariation));

        // Получаем данные вакансий для интерполяции (сохраняем только нужные данные, не сущности)
        $vacancyData = $this->entityManager->getRepository(Vacancy::class)
            ->createQueryBuilder('v')
            ->select('v.id, v.name, v.description, v.requirements, v.role, v.sourceId, v.salaryFrom, v.salaryTo, v.salaryCurrency, v.publishedAt, e.id as employerId')
            ->join('v.employer', 'e')
            ->where('v.source = :source')
            ->setParameter('source', DataSource::HH)
            ->getQuery()
            ->getResult();

        if (empty($vacancyData)) {
            $io->warning('Не найдено существующих вакансий для интерполяции. Сначала выполните парсинг.');
            return Command::FAILURE;
        }

        $io->info(sprintf('Найдено существующих вакансий: %d', count($vacancyData)));

        $stats = [
            'days_processed' => 0,
            'vacancies_created' => 0,
            'vacancies_duplicated' => 0,
            'vacancies_new' => 0,
            'errors' => 0,
        ];

        $endDate = new \DateTimeImmutable('today');
        $startDate = $endDate->modify("-{$days} days");

        $io->progressStart($days);

        try {
            $currentDate = $startDate;
            $dayIndex = 0;

            while ($currentDate < $endDate) {
                // Количество вакансий для этого дня (с вариацией ±30%)
                $variation = (mt_rand(-30, 30) / 100);
                $vacanciesForDay = max(1, (int) ($avgVacanciesPerDay * (1 + $variation)));

                // Выбираем случайные вакансии для интерполяции
                $selectedVacancies = $this->selectRandomVacancies($vacancyData, $vacanciesForDay);

                foreach ($selectedVacancies as $vacancyDataItem) {
                    try {
                        $rand = mt_rand(1, 100);

                        if ($rand <= $duplicateProbability) {
                            // Дублируем вакансию (тот же sourceId, но новый parsedAt)
                            $this->duplicateVacancy($vacancyDataItem, $currentDate, $salaryVariation, $stats);
                        } elseif ($rand <= $duplicateProbability + $newProbability) {
                            // Создаем новую вакансию на основе существующей (новый sourceId)
                            $this->createNewVacancy($vacancyDataItem, $currentDate, $salaryVariation, $stats);
                        }
                        // Иначе пропускаем (30% случаев по умолчанию)
                    } catch (\Exception $e) {
                        $stats['errors']++;
                        $io->warning(sprintf('Ошибка при обработке вакансии: %s', $e->getMessage()));
                    }
                }

                // Периодически сохраняем изменения
                if ($dayIndex % 10 === 0) {
                    $this->entityManager->flush();
                    $this->entityManager->clear();
                }

                $currentDate = $currentDate->modify('+1 day');
                $dayIndex++;
                $stats['days_processed']++;
                $io->progressAdvance();
            }

            // Финальное сохранение
            $this->entityManager->flush();

            $io->progressFinish();

            $io->success('Интерполяция завершена!');
            $io->table(
                ['Метрика', 'Значение'],
                [
                    ['Дней обработано', $stats['days_processed']],
                    ['Вакансий создано', $stats['vacancies_created']],
                    ['Вакансий продублировано', $stats['vacancies_duplicated']],
                    ['Новых вакансий создано', $stats['vacancies_new']],
                    ['Ошибок', $stats['errors']],
                ]
            );

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Ошибка при интерполяции: ' . $e->getMessage());
            $io->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    /**
     * Выбирает случайные вакансии из списка
     */
    private function selectRandomVacancies(array $vacancyData, int $count): array
    {
        $selected = [];
        $total = count($vacancyData);

        if ($total === 0) {
            return [];
        }

        $count = min($count, $total);

        // Используем случайные индексы без повторений
        $indices = array_rand($vacancyData, $count);
        if (!is_array($indices)) {
            $indices = [$indices];
        }

        foreach ($indices as $index) {
            $selected[] = $vacancyData[$index];
        }

        return $selected;
    }

    /**
     * Дублирует вакансию с новым parsedAt и возможным изменением зарплаты
     */
    private function duplicateVacancy(
        array $originalData,
        \DateTimeImmutable $parsedAt,
        int $salaryVariation,
        array &$stats
    ): void {
        // Проверяем, не существует ли уже такая запись для этого дня
        $dayStart = $parsedAt->setTime(0, 0, 0);
        $dayEnd = $dayStart->modify('+1 day');
        
        $existing = $this->entityManager->getRepository(Vacancy::class)
            ->createQueryBuilder('v')
            ->where('v.source = :source')
            ->andWhere('v.sourceId = :sourceId')
            ->andWhere('v.parsedAt >= :dayStart')
            ->andWhere('v.parsedAt < :dayEnd')
            ->setParameter('source', DataSource::HH)
            ->setParameter('sourceId', $originalData['sourceId'])
            ->setParameter('dayStart', $dayStart)
            ->setParameter('dayEnd', $dayEnd)
            ->getQuery()
            ->getOneOrNullResult();

        if ($existing) {
            return; // Уже есть дубликат на этот день
        }

        // Получаем работодателя по ID
        $employer = $this->entityManager->getReference(Employer::class, $originalData['employerId']);

        $duplicate = new Vacancy();
        $duplicate->setSource(DataSource::HH);
        $duplicate->setSourceId($originalData['sourceId']); // Тот же sourceId
        $duplicate->setName($originalData['name']);
        $duplicate->setDescription($originalData['description']);
        $duplicate->setRequirements($originalData['requirements']);
        $duplicate->setRole($originalData['role']);
        $duplicate->setEmployer($employer);
        $duplicate->setPublishedAt($originalData['publishedAt']);
        $duplicate->setParsedAt($parsedAt);

        // Вариация зарплаты
        if ($originalData['salaryFrom'] !== null) {
            $variation = mt_rand(-$salaryVariation, $salaryVariation) / 100;
            $newSalaryFrom = max(0, (int) ($originalData['salaryFrom'] * (1 + $variation)));
            $duplicate->setSalaryFrom($newSalaryFrom);
        }

        if ($originalData['salaryTo'] !== null) {
            $variation = mt_rand(-$salaryVariation, $salaryVariation) / 100;
            $newSalaryTo = max(0, (int) ($originalData['salaryTo'] * (1 + $variation)));
            $duplicate->setSalaryTo($newSalaryTo);
        }

        $duplicate->setSalaryCurrency($originalData['salaryCurrency']);

        $this->entityManager->persist($duplicate);
        $stats['vacancies_created']++;
        $stats['vacancies_duplicated']++;
    }

    /**
     * Создает новую вакансию на основе существующей (с новым sourceId)
     */
    private function createNewVacancy(
        array $originalData,
        \DateTimeImmutable $parsedAt,
        int $salaryVariation,
        array &$stats
    ): void {
        $newVacancy = new Vacancy();
        $newVacancy->setSource(DataSource::HH);
        
        // Генерируем новый sourceId (используем timestamp + случайное число)
        $newSourceId = 'interpolated_' . $parsedAt->getTimestamp() . '_' . mt_rand(1000, 9999);
        $newVacancy->setSourceId($newSourceId);

        // Немного изменяем название (с вероятностью 70%)
        if (mt_rand(1, 100) <= 70) {
            $nameVariations = [
                'Senior ',
                'Middle ',
                'Junior ',
                'Lead ',
                '',
            ];
            $prefix = $nameVariations[array_rand($nameVariations)];
            $newVacancy->setName($prefix . $originalData['name']);
        } else {
            $newVacancy->setName($originalData['name']);
        }

        $newVacancy->setDescription($originalData['description']);
        $newVacancy->setRequirements($originalData['requirements']);
        $newVacancy->setRole($originalData['role']);
        
        // Получаем работодателя по ID
        $employer = $this->entityManager->getReference(Employer::class, $originalData['employerId']);
        $newVacancy->setEmployer($employer);
        
        // PublishedAt может быть раньше parsedAt (вакансия была опубликована ранее)
        $daysAgo = mt_rand(0, 30);
        $publishedAt = $parsedAt->modify("-{$daysAgo} days");
        $newVacancy->setPublishedAt($publishedAt);
        $newVacancy->setParsedAt($parsedAt);

        // Вариация зарплаты (может быть больше, чем для дубликатов)
        if ($originalData['salaryFrom'] !== null) {
            $variation = mt_rand(-$salaryVariation * 2, $salaryVariation * 2) / 100;
            $newSalaryFrom = max(0, (int) ($originalData['salaryFrom'] * (1 + $variation)));
            $newVacancy->setSalaryFrom($newSalaryFrom);
        }

        if ($originalData['salaryTo'] !== null) {
            $variation = mt_rand(-$salaryVariation * 2, $salaryVariation * 2) / 100;
            $newSalaryTo = max(0, (int) ($originalData['salaryTo'] * (1 + $variation)));
            $newVacancy->setSalaryTo($newSalaryTo);
        }

        $newVacancy->setSalaryCurrency($originalData['salaryCurrency']);

        $this->entityManager->persist($newVacancy);
        $stats['vacancies_created']++;
        $stats['vacancies_new']++;
    }
}

