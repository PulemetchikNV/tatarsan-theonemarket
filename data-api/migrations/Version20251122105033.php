<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251122105033 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE employers (id SERIAL NOT NULL, name VARCHAR(500) NOT NULL, description TEXT DEFAULT NULL, location VARCHAR(50) DEFAULT NULL, source VARCHAR(50) NOT NULL, source_id VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_employer_name ON employers (name)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_employer_location ON employers (location)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_employer_source ON employers (source)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX unique_source_id ON employers (source, source_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN employers.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN employers.updated_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE vacancies (id SERIAL NOT NULL, employer_id INT NOT NULL, name VARCHAR(500) NOT NULL, description TEXT DEFAULT NULL, requirements TEXT DEFAULT NULL, location VARCHAR(50) DEFAULT NULL, source VARCHAR(50) NOT NULL, source_id VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT NULL, salary_from INT DEFAULT NULL, salary_to INT DEFAULT NULL, salary_currency VARCHAR(10) DEFAULT NULL, published_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, parsed_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_vacancy_name ON vacancies (name)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_vacancy_employer ON vacancies (employer_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_vacancy_location ON vacancies (location)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_vacancy_source ON vacancies (source)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_vacancy_published ON vacancies (published_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_vacancy_parsed ON vacancies (parsed_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX unique_vacancy_source_id ON vacancies (source, source_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN vacancies.published_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN vacancies.parsed_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN vacancies.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN vacancies.updated_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vacancies ADD CONSTRAINT FK_99165A5941CD9E7A FOREIGN KEY (employer_id) REFERENCES employers (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE vacancies DROP CONSTRAINT FK_99165A5941CD9E7A
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE employers
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE vacancies
        SQL);
    }
}
