<?php

namespace App\Entity;

use App\Enum\DataSource;
use App\Enum\HhRole;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\HasLifecycleCallbacks;
use Doctrine\ORM\Mapping\PreUpdate;

/**
 * Резюме (Resume) - универсальная сущность для разных источников
 */
#[ORM\Entity]
#[ORM\Table(name: 'resumes')]
#[ORM\HasLifecycleCallbacks]
#[ORM\Index(columns: ['name'], name: 'idx_resume_name')]
#[ORM\Index(columns: ['source'], name: 'idx_resume_source')]
#[ORM\Index(columns: ['parsed_at'], name: 'idx_resume_parsed')]
#[ORM\Index(columns: ['created_at'], name: 'idx_resume_created')]
class Resume
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $id = null;

    /**
     * Название резюме
     */
    #[ORM\Column(type: Types::STRING, length: 500)]
    private string $name;

    /**
     * Описание резюме (HTML или plain text)
     */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    /**
     * Источник данных
     */
    #[ORM\Column(type: Types::STRING, length: 50, enumType: DataSource::class)]
    private DataSource $source;

    /**
     * ID резюме в системе источника
     */
    #[ORM\Column(type: Types::STRING, length: 255)]
    private string $sourceId;

    /**
     * Роль (для HH используем HhRole, для других - строка)
     * Если source = HH, то здесь ID роли из HhRole enum
     * Для других источников - произвольная строка
     */
    #[ORM\Column(type: Types::STRING, length: 50, nullable: true)]
    private ?string $role = null;

    /**
     * Минимальная ожидаемая зарплата
     */
    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $salaryFrom = null;

    /**
     * Максимальная ожидаемая зарплата
     */
    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $salaryTo = null;

    /**
     * Валюта зарплаты (RUR, USD, EUR и т.д.)
     */
    #[ORM\Column(type: Types::STRING, length: 10, nullable: true)]
    private ?string $salaryCurrency = null;

    /**
     * Время парсинга (для отслеживания динамики)
     */
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $parsedAt;

    /**
     * Дата создания записи в БД
     */
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    /**
     * Дата последнего обновления
     */
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->parsedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getSource(): DataSource
    {
        return $this->source;
    }

    public function setSource(DataSource $source): self
    {
        $this->source = $source;
        return $this;
    }

    public function getSourceId(): string
    {
        return $this->sourceId;
    }

    public function setSourceId(string $sourceId): self
    {
        $this->sourceId = $sourceId;
        return $this;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(?string $role): self
    {
        $this->role = $role;
        return $this;
    }

    /**
     * Установить роль из HhRole enum (для HH)
     */
    public function setHhRole(?HhRole $role): self
    {
        $this->role = $role?->getId();
        return $this;
    }

    /**
     * Получить HhRole enum (если source = HH)
     */
    public function getHhRole(): ?HhRole
    {
        if ($this->source === DataSource::HH && $this->role !== null) {
            return HhRole::fromId($this->role);
        }
        return null;
    }

    public function getSalaryFrom(): ?int
    {
        return $this->salaryFrom;
    }

    public function setSalaryFrom(?int $salaryFrom): self
    {
        $this->salaryFrom = $salaryFrom;
        return $this;
    }

    public function getSalaryTo(): ?int
    {
        return $this->salaryTo;
    }

    public function setSalaryTo(?int $salaryTo): self
    {
        $this->salaryTo = $salaryTo;
        return $this;
    }

    public function getSalaryCurrency(): ?string
    {
        return $this->salaryCurrency;
    }

    public function setSalaryCurrency(?string $salaryCurrency): self
    {
        $this->salaryCurrency = $salaryCurrency;
        return $this;
    }

    public function getParsedAt(): \DateTimeImmutable
    {
        return $this->parsedAt;
    }

    public function setParsedAt(\DateTimeImmutable $parsedAt): self
    {
        $this->parsedAt = $parsedAt;
        return $this;
    }

    /**
     * Обновить время парсинга (вызывать при каждом парсинге)
     */
    public function updateParsedAt(): self
    {
        $this->parsedAt = new \DateTimeImmutable();
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}

