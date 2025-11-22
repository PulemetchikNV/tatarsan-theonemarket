<?php

namespace App\Enum;

enum HhArea: string
{
    case Moscow = '1';
    case Peterburg = '2';
    case Tatarstan = '1624';

    /**
     * Получить название области
     */
    public function getName(): string
    {
        return match ($this) {
            self::Moscow => 'Москва',
            self::Peterburg => 'Санкт-Петербург',
            self::Tatarstan => 'Татарстан',
        };
    }

    /**
     * Получить ID области
     */
    public function getId(): string
    {
        return $this->value;
    }

    /**
     * Создать enum по ID области
     *
     * @param string $id ID области
     * @return self|null Возвращает enum или null, если ID не найден
     */
    public static function fromId(string $id): ?self
    {
        return self::tryFrom($id);
    }

    /**
     * Получить область как массив для использования в API
     *
     * @return array Массив с полной информацией об области
     */
    public function toArray(): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
        ];
    }

    /**
     * Получить все области
     *
     * @return array Массив всех областей
     */
    public static function getAll(): array
    {
        return array_map(
            fn(self $area) => $area->toArray(),
            self::cases()
        );
    }
}