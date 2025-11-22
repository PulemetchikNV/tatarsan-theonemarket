<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251122112028 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            DROP INDEX idx_employer_location
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE employers DROP location
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX idx_vacancy_location
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vacancies DROP location
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vacancies ADD location VARCHAR(50) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_vacancy_location ON vacancies (location)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE employers ADD location VARCHAR(50) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_employer_location ON employers (location)
        SQL);
    }
}
