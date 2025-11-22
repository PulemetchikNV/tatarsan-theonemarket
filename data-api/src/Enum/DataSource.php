<?php

namespace App\Enum;

enum DataSource: string
{
    case HH = 'hh';

    /**
     * Получить название источника
     */
    public function getName(): string
    {
        return match ($this) {
            self::HH => 'HeadHunter',
        };
    }

    /**
     * Получить ID источника
     */
    public function getId(): string
    {
        return $this->value;
    }

    /**
     * Создать enum по ID источника
     *
     * @param string $id ID источника
     * @return self|null Возвращает enum или null, если ID не найден
     */
    public static function fromId(string $id): ?self
    {
        return self::tryFrom($id);
    }

    /**
     * Получить источник как массив для использования в API
     *
     * @return array Массив с полной информацией об источнике
     */
    public function toArray(): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
        ];
    }

    /**
     * Получить все источники
     *
     * @return array Массив всех источников
     */
    public static function getAll(): array
    {
        return array_map(
            fn(self $source) => $source->toArray(),
            self::cases()
        );
    }
}

