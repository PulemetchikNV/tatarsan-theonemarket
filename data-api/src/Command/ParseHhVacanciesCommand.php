<?php

namespace App\Command;

use App\Enum\HhRole;
use App\Service\HhVacancyParserService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:parse-hh-vacancies',
    description: 'Парсинг вакансий с HeadHunter API'
)]
class ParseHhVacanciesCommand extends Command
{
    public function __construct(
        private readonly HhVacancyParserService $parserService
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument(
                'role',
                InputArgument::OPTIONAL,
                'ID роли для парсинга (например, 165 для Data Scientist). Используйте "all" для парсинга всех ролей',
                '165'
            )
            ->addOption(
                'max-pages',
                'm',
                InputOption::VALUE_OPTIONAL,
                'Максимальное количество страниц для парсинга (по умолчанию - все)',
                null
            )
            ->addOption(
                'role-name',
                'r',
                InputOption::VALUE_OPTIONAL,
                'Использовать имя роли из HhRole enum вместо ID',
                null
            )
            ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $roleInput = $input->getArgument('role');
        $roleName = $input->getOption('role-name');
        $maxPages = $input->getOption('max-pages') ? (int) $input->getOption('max-pages') : null;

        // Проверка на парсинг всех ролей
        if (strtolower($roleInput) === 'all') {
            return $this->parseAllRoles($io, $maxPages);
        }

        // Если указано имя роли, пытаемся найти её в enum
        if ($roleName) {
            $role = HhRole::tryFrom($roleName);
            if (!$role) {
                $io->error("Роль '{$roleName}' не найдена в HhRole enum");
                return Command::FAILURE;
            }
            $roleId = $role;
        } else {
            // Пытаемся найти роль по ID в enum
            $role = HhRole::fromId($roleInput);
            $roleId = $role ?? $roleInput; // Если не найдено, используем как строку
        }

        $io->title('Парсинг вакансий HeadHunter');

        if ($role instanceof HhRole) {
            $io->info(sprintf('Роль: %s (ID: %s)', $role->getName(), $role->getId()));
        } else {
            $io->info(sprintf('Роль ID: %s', $roleId));
        }

        $io->info('Область: Татарстан (ID: 1624) - хардкод');

        if ($maxPages) {
            $io->info(sprintf('Максимум страниц: %d', $maxPages));
        }

        $io->progressStart(100);

        try {
            $stats = $this->parserService->parseByRole($roleId, $maxPages);

            $io->progressFinish();

            $io->success('Парсинг завершен!');
            $io->table(
                ['Метрика', 'Значение'],
                [
                    ['Всего найдено', $stats['total_found']],
                    ['Страниц обработано', $stats['pages_parsed']],
                    ['Работодателей создано', $stats['employers_created']],
                    ['Работодателей обновлено', $stats['employers_updated']],
                    ['Вакансий создано', $stats['vacancies_created']],
                    ['Вакансий обновлено', $stats['vacancies_updated']],
                    ['Ошибок', $stats['errors']],
                ]
            );

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Ошибка при парсинге: ' . $e->getMessage());
            $io->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    private function parseAllRoles(SymfonyStyle $io, ?int $maxPages): int
    {
        $io->title('Парсинг вакансий для всех ролей HeadHunter');

        $io->info('Область: Татарстан (ID: 1624) - хардкод');

        if ($maxPages) {
            $io->info(sprintf('Максимум страниц для каждой роли: %d', $maxPages));
        }

        $roles = HhRole::cases();
        $io->info(sprintf('Всего ролей для обработки: %d', count($roles)));

        try {
            $totalStats = $this->parserService->parseAllRoles($maxPages);

            $io->success('Парсинг всех ролей завершен!');
            
            $io->table(
                ['Метрика', 'Значение'],
                [
                    ['Ролей обработано', $totalStats['roles_processed']],
                    ['Всего найдено вакансий', $totalStats['total_found']],
                    ['Всего страниц обработано', $totalStats['total_pages_parsed']],
                    ['Работодателей создано', $totalStats['total_employers_created']],
                    ['Работодателей обновлено', $totalStats['total_employers_updated']],
                    ['Вакансий создано', $totalStats['total_vacancies_created']],
                    ['Вакансий обновлено', $totalStats['total_vacancies_updated']],
                    ['Ошибок', $totalStats['total_errors']],
                ]
            );

            // Детальная статистика по ролям
            if (!empty($totalStats['roles'])) {
                $io->section('Статистика по ролям');
                $rows = [];
                foreach ($totalStats['roles'] as $roleData) {
                    $rows[] = [
                        $roleData['role'],
                        $roleData['stats']['total_found'],
                        $roleData['stats']['vacancies_created'],
                        $roleData['stats']['vacancies_updated'],
                    ];
                }
                $io->table(
                    ['Роль', 'Найдено', 'Создано', 'Обновлено'],
                    $rows
                );
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Ошибка при парсинге: ' . $e->getMessage());
            $io->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}

