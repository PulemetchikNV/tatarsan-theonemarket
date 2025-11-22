<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251122120548 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE resumes (id SERIAL NOT NULL, name VARCHAR(500) NOT NULL, description TEXT DEFAULT NULL, source VARCHAR(50) NOT NULL, source_id VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT NULL, salary_from INT DEFAULT NULL, salary_to INT DEFAULT NULL, salary_currency VARCHAR(10) DEFAULT NULL, parsed_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_resume_name ON resumes (name)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_resume_source ON resumes (source)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_resume_parsed ON resumes (parsed_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_resume_created ON resumes (created_at)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN resumes.parsed_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN resumes.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN resumes.updated_at IS '(DC2Type:datetime_immutable)'
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE resumes
        SQL);
    }
}
