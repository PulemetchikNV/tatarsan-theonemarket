<?php

namespace App\Entity;

use App\Enum\DataSource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\HasLifecycleCallbacks;
use Doctrine\ORM\Mapping\PreUpdate;

/**
 * Работодатель (Employer) - универсальная сущность для разных источников
 */
#[ORM\Entity]
#[ORM\Table(name: 'employers')]
#[ORM\HasLifecycleCallbacks]
#[ORM\Index(columns: ['name'], name: 'idx_employer_name')]
#[ORM\Index(columns: ['source'], name: 'idx_employer_source')]
class Employer
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $id = null;

    /**
     * Название компании
     */
    #[ORM\Column(type: Types::STRING, length: 500)]
    private string $name;

    /**
     * Описание компании (HTML или plain text)
     */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    /**
     * Источник данных
     */
    #[ORM\Column(type: Types::STRING, length: 50, enumType: DataSource::class)]
    private DataSource $source;

    /**
     * ID работодателя в системе источника
     */
    #[ORM\Column(type: Types::STRING, length: 255)]
    private string $sourceId;

    /**
     * Вакансии работодателя
     */
    #[ORM\OneToMany(targetEntity: Vacancy::class, mappedBy: 'employer')]
    private Collection $vacancies;

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
        $this->vacancies = new ArrayCollection();
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

    /**
     * @return Collection<int, Vacancy>
     */
    public function getVacancies(): Collection
    {
        return $this->vacancies;
    }

    public function addVacancy(Vacancy $vacancy): self
    {
        if (!$this->vacancies->contains($vacancy)) {
            $this->vacancies->add($vacancy);
            $vacancy->setEmployer($this);
        }

        return $this;
    }

    public function removeVacancy(Vacancy $vacancy): self
    {
        $this->vacancies->removeElement($vacancy);

        return $this;
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}

