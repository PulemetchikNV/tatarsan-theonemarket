<?php

namespace App\Command;

use App\Entity\Resume;
use App\Entity\Vacancy;
use App\Enum\DataSource;
use App\Enum\HhRole;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:generate-fake-resumes',
    description: 'Генерация фейковых резюме с соотношением конкуренции (18:14:3 для junior:middle:senior)'
)]
class GenerateFakeResumesCommand extends Command
{
    // Соотношение конкуренции: резюме на 1 вакансию
    private const JUNIOR_RATIO = 18;
    private const MIDDLE_RATIO = 14;
    private const SENIOR_RATIO = 3;

    // Диапазоны зарплат по уровням (в рублях)
    private const JUNIOR_SALARY_FROM = 50000;
    private const JUNIOR_SALARY_TO = 100000;
    private const MIDDLE_SALARY_FROM = 150000;
    private const MIDDLE_SALARY_TO = 250000;
    private const SENIOR_SALARY_FROM = 300000;
    private const SENIOR_SALARY_TO = 500000;

    private array $firstNames = [
        'Александр', 'Дмитрий', 'Максим', 'Сергей', 'Андрей', 'Алексей', 'Артем', 'Илья',
        'Кирилл', 'Михаил', 'Никита', 'Матвей', 'Роман', 'Егор', 'Арсений', 'Иван',
        'Денис', 'Евгений', 'Данил', 'Тимур', 'Владислав', 'Игорь', 'Владимир', 'Павел',
        'Анна', 'Мария', 'Елена', 'Дарья', 'Алина', 'Ирина', 'Екатерина', 'Анастасия',
        'Виктория', 'Полина', 'София', 'Юлия', 'Валерия', 'Ксения', 'Вероника', 'Александра',
    ];

    private array $lastNames = [
        'Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев',
        'Козлов', 'Новиков', 'Морозов', 'Волков', 'Алексеев', 'Семенов',
        'Егоров', 'Павлов', 'Степанов', 'Николаев', 'Орлов', 'Андреев', 'Макаров',
        'Никитин', 'Захаров', 'Зайцев', 'Соловьев', 'Борисов', 'Яковлев', 'Григорьев', 'Романов',
    ];

    private array $technologies = [
        'PHP', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust',
        'React', 'Vue.js', 'Angular', 'Node.js', 'Laravel', 'Symfony', 'Django', 'Spring',
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'Git', 'Linux',
    ];

    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption(
                'vacancies-count',
                'c',
                InputOption::VALUE_OPTIONAL,
                'Количество вакансий для расчета (если не указано, будет подсчитано из БД)',
                null
            )
            ->addOption(
                'force',
                'f',
                InputOption::VALUE_NONE,
                'Принудительно создать резюме даже если они уже существуют'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Генерация фейковых резюме');

        $vacanciesCount = $input->getOption('vacancies-count');
        $force = $input->getOption('force');

        // Если количество не указано, считаем из БД
        if ($vacanciesCount === null) {
            $vacanciesCount = $this->entityManager->getRepository(Vacancy::class)
                ->createQueryBuilder('v')
                ->select('COUNT(v.id)')
                ->getQuery()
                ->getSingleScalarResult();
            
            $io->info(sprintf('Найдено вакансий в БД: %d', $vacanciesCount));
        } else {
            $vacanciesCount = (int) $vacanciesCount;
            $io->info(sprintf('Используется указанное количество вакансий: %d', $vacanciesCount));
        }

        if ($vacanciesCount === 0) {
            $io->warning('Нет вакансий для расчета. Используйте --vacancies-count для указания количества.');
            return Command::FAILURE;
        }

        // Рассчитываем количество резюме по уровням
        $juniorCount = $vacanciesCount * self::JUNIOR_RATIO;
        $middleCount = $vacanciesCount * self::MIDDLE_RATIO;
        $seniorCount = $vacanciesCount * self::SENIOR_RATIO;
        $totalResumes = $juniorCount + $middleCount + $seniorCount;

        $io->section('План генерации');
        $io->table(
            ['Уровень', 'Соотношение', 'Количество резюме'],
            [
                ['Junior', sprintf('1:%d', self::JUNIOR_RATIO), $juniorCount],
                ['Middle', sprintf('1:%d', self::MIDDLE_RATIO), $middleCount],
                ['Senior', sprintf('1:%d', self::SENIOR_RATIO), $seniorCount],
                ['ИТОГО', '-', $totalResumes],
            ]
        );

        if (!$force) {
            // Проверяем, есть ли уже резюме
            $existingCount = $this->entityManager->getRepository(Resume::class)
                ->createQueryBuilder('r')
                ->select('COUNT(r.id)')
                ->where('r.source = :source')
                ->setParameter('source', DataSource::HH)
                ->getQuery()
                ->getSingleScalarResult();

            if ($existingCount > 0) {
                $io->warning(sprintf('Найдено %d существующих резюме. Используйте --force для перезаписи.', $existingCount));
                return Command::FAILURE;
            }
        }

        $io->progressStart($totalResumes);

        $roles = HhRole::cases();
        $stats = [
            'junior' => 0,
            'middle' => 0,
            'senior' => 0,
        ];

        // Генерируем Junior резюме
        for ($i = 0; $i < $juniorCount; $i++) {
            $this->createResume('junior', $roles, $stats);
            $io->progressAdvance();
        }

        // Генерируем Middle резюме
        for ($i = 0; $i < $middleCount; $i++) {
            $this->createResume('middle', $roles, $stats);
            $io->progressAdvance();
        }

        // Генерируем Senior резюме
        for ($i = 0; $i < $seniorCount; $i++) {
            $this->createResume('senior', $roles, $stats);
            $io->progressAdvance();
        }

        $this->entityManager->flush();
        $io->progressFinish();

        $io->success('Генерация завершена!');
        $io->table(
            ['Уровень', 'Создано резюме'],
            [
                ['Junior', $stats['junior']],
                ['Middle', $stats['middle']],
                ['Senior', $stats['senior']],
                ['ИТОГО', array_sum($stats)],
            ]
        );

        return Command::SUCCESS;
    }

    private function createResume(string $level, array $roles, array &$stats): void
    {
        $resume = new Resume();
        
        // Выбираем случайную роль
        $role = $roles[array_rand($roles)];
        
        // Генерируем имя
        $firstName = $this->firstNames[array_rand($this->firstNames)];
        $lastName = $this->lastNames[array_rand($this->lastNames)];
        
        // Формируем название резюме
        $roleName = $role->getName();
        $levelName = match($level) {
            'junior' => 'Junior',
            'middle' => 'Middle',
            'senior' => 'Senior',
        };
        
        $resume->setName(sprintf('%s %s', $levelName, $roleName));
        
        // Генерируем описание
        $technologiesCount = match($level) {
            'junior' => 3,
            'middle' => 5,
            'senior' => 7,
        };
        $maxTechs = min($technologiesCount, count($this->technologies));
        if ($maxTechs === 1) {
            $selectedTechs = [array_rand($this->technologies)];
        } else {
            $selectedTechs = array_rand($this->technologies, $maxTechs);
            if (!is_array($selectedTechs)) {
                $selectedTechs = [$selectedTechs];
            }
        }
        $techList = array_map(fn($idx) => $this->technologies[$idx], $selectedTechs);
        
        $experience = match($level) {
            'junior' => '0-1 год',
            'middle' => '2-5 лет',
            'senior' => '5+ лет',
        };
        
        $description = sprintf(
            "Резюме %s %s\n\nОпыт работы: %s\n\nТехнологии: %s\n\nИщу интересные проекты и возможности для профессионального роста.",
            $firstName,
            $lastName,
            $experience,
            implode(', ', $techList)
        );
        
        $resume->setDescription($description);
        
        // Устанавливаем роль
        $resume->setHhRole($role);
        
        // Устанавливаем зарплату в зависимости от уровня
        [$salaryFrom, $salaryTo] = match($level) {
            'junior' => [self::JUNIOR_SALARY_FROM, self::JUNIOR_SALARY_TO],
            'middle' => [self::MIDDLE_SALARY_FROM, self::MIDDLE_SALARY_TO],
            'senior' => [self::SENIOR_SALARY_FROM, self::SENIOR_SALARY_TO],
        };
        
        $resume->setSalaryFrom(rand($salaryFrom, (int)($salaryFrom + ($salaryTo - $salaryFrom) * 0.3)));
        $resume->setSalaryTo(rand((int)($salaryFrom + ($salaryTo - $salaryFrom) * 0.7), $salaryTo));
        $resume->setSalaryCurrency('RUR');
        
        // Устанавливаем источник и уникальный sourceId
        $resume->setSource(DataSource::HH);
        $resume->setSourceId(sprintf('fake_%s_%s_%d', $level, $role->getId(), time() . rand(1000, 9999)));
        
        // Устанавливаем время парсинга (случайное в последние 7 дней)
        $daysAgo = rand(0, 7);
        $parsedAt = new \DateTimeImmutable(sprintf('-%d days', $daysAgo));
        $resume->setParsedAt($parsedAt);
        
        $this->entityManager->persist($resume);
        $stats[$level]++;
        
        // Периодически делаем flush для оптимизации
        if (($stats['junior'] + $stats['middle'] + $stats['senior']) % 100 === 0) {
            $this->entityManager->flush();
        }
    }
}

