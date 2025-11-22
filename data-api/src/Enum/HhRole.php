<?php

namespace App\Enum;

enum HhRole: string
{
    case BI_ANALYST = '156';
    case DEVOPS_ENGINEER = '160';
    case ANALYST = '10';
    case ART_DIRECTOR = '12';
    case BUSINESS_ANALYST = '150';
    case GAME_DESIGNER = '25';
    case DATA_SCIENTIST = '165';
    case DESIGNER = '34';
    case CIO = '36';
    case PRODUCT_MANAGER = '73';
    case METHODOLOGIST = '155';
    case DEVELOPER = '96';
    case PRODUCT_ANALYST = '164';
    case DEVELOPMENT_LEAD = '104';
    case ANALYTICS_LEAD = '157';
    case PROJECT_MANAGER = '107';
    case NETWORK_ENGINEER = '112';
    case SYSTEM_ADMINISTRATOR = '113';
    case SYSTEM_ANALYST = '148';
    case SYSTEM_ENGINEER = '114';
    case SECURITY_SPECIALIST = '116';
    case SUPPORT_SPECIALIST = '121';
    case QA_ENGINEER = '124';
    case CTO = '125';
    case TECHNICAL_WRITER = '126';

    /**
     * Получить название роли
     */
    public function getName(): string
    {
        return match ($this) {
            self::BI_ANALYST => 'BI-аналитик, аналитик данных',
            self::DEVOPS_ENGINEER => 'DevOps-инженер',
            self::ANALYST => 'Аналитик',
            self::ART_DIRECTOR => 'Арт-директор, креативный директор',
            self::BUSINESS_ANALYST => 'Бизнес-аналитик',
            self::GAME_DESIGNER => 'Гейм-дизайнер',
            self::DATA_SCIENTIST => 'Дата-сайентист',
            self::DESIGNER => 'Дизайнер, художник',
            self::CIO => 'Директор по информационным технологиям (CIO)',
            self::PRODUCT_MANAGER => 'Менеджер продукта',
            self::METHODOLOGIST => 'Методолог',
            self::DEVELOPER => 'Программист, разработчик',
            self::PRODUCT_ANALYST => 'Продуктовый аналитик',
            self::DEVELOPMENT_LEAD => 'Руководитель группы разработки',
            self::ANALYTICS_LEAD => 'Руководитель отдела аналитики',
            self::PROJECT_MANAGER => 'Руководитель проектов',
            self::NETWORK_ENGINEER => 'Сетевой инженер',
            self::SYSTEM_ADMINISTRATOR => 'Системный администратор',
            self::SYSTEM_ANALYST => 'Системный аналитик',
            self::SYSTEM_ENGINEER => 'Системный инженер',
            self::SECURITY_SPECIALIST => 'Специалист по информационной безопасности',
            self::SUPPORT_SPECIALIST => 'Специалист технической поддержки',
            self::QA_ENGINEER => 'Тестировщик',
            self::CTO => 'Технический директор (CTO)',
            self::TECHNICAL_WRITER => 'Технический писатель',
        };
    }

    /**
     * Принимает ли роль неполные резюме
     */
    public function acceptsIncompleteResumes(): bool
    {
        return match ($this) {
            self::SUPPORT_SPECIALIST => true,
            default => false,
        };
    }

    /**
     * Является ли роль дефолтной
     */
    public function isDefault(): bool
    {
        return false; // Согласно данным, все роли имеют is_default: false
    }

    /**
     * Устарела ли роль для выбора (select_deprecated)
     */
    public function isSelectDeprecated(): bool
    {
        return false; // Согласно данным, все роли имеют select_deprecated: false
    }

    /**
     * Устарела ли роль для поиска (search_deprecated)
     */
    public function isSearchDeprecated(): bool
    {
        return false; // Согласно данным, все роли имеют search_deprecated: false
    }

    /**
     * Получить ID роли
     */
    public function getId(): string
    {
        return $this->value;
    }

    /**
     * Создать enum по ID роли
     *
     * @param string $id ID роли
     * @return self|null Возвращает enum или null, если ID не найден
     */
    public static function fromId(string $id): ?self
    {
        return self::tryFrom($id);
    }

    /**
     * Получить все роли как массив для использования в API
     *
     * @return array Массив с полной информацией о роли
     */
    public function toArray(): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
        ];
    }

    /**
     * Получить все роли
     *
     * @return array Массив всех ролей
     */
    public static function getAll(): array
    {
        return array_map(
            fn(self $role) => $role->toArray(),
            self::cases()
        );
    }
}

