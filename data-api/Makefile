# Цвета для форматирования
YELLOW := \033[1;33m
GREEN  := \033[1;32m
RED    := \033[1;31m
BLUE   := \033[1;34m
NC     := \033[0m # Без цвета

.PHONY: init up down restart docker-up docker-down docker-down-clear docker-pull docker-build \
        app-init console composer-update composer-install help

# Показать список доступных команд
help:
	@echo "${YELLOW}Доступные команды:${NC}"
	@echo ""
	@awk '/^[a-zA-Z0-9_-]+:/ { \
		helpMessage = match(lastLine, /^# (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 2, RLENGTH); \
			printf "  ${GREEN}%-20s${NC} %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "${BLUE}Используйте ${RED}make <команда>${BLUE} для выполнения операции${NC}"

# Полная инициализация проекта
init:		   docker-down-clear docker-pull docker-build up app-init
	@echo "${GREEN}Проект успешно инициализирован${NC}"

# Запуск контейнеров
up:			 docker-up
	@echo "${GREEN}Контейнеры запущены${NC}"

# Остановка контейнеров
down:		   docker-down
	@echo "${GREEN}Контейнеры остановлены${NC}"

# Перезапуск контейнеров
restart:		down up
	@echo "${GREEN}Контейнеры перезапущены${NC}"

# Запуск контейнеров в фоновом режиме
docker-up:
	@echo "${BLUE}Запуск контейнеров...${NC}"
	docker compose up -d
	@echo "${GREEN}Контейнеры успешно запущены${NC}"

# Остановка контейнеров
docker-down:
	@echo "${BLUE}Остановка контейнеров...${NC}"
	docker compose down
	@echo "${GREEN}Контейнеры успешно остановлены${NC}"

# Остановка контейнеров с удалением томов
docker-down-clear:
	@echo "${BLUE}Остановка контейнеров и удаление томов...${NC}"
	docker compose down -v --remove-orphans
	@echo "${GREEN}Контейнеры остановлены и тома удалены${NC}"

# Загрузка образов контейнеров
docker-pull:
	@echo "${BLUE}Загрузка образов контейнеров...${NC}"
	docker compose pull
	@echo "${GREEN}Образы успешно загружены${NC}"

# Сборка образов контейнеров
docker-build:
	@echo "${BLUE}Сборка образов контейнеров...${NC}"
	docker compose build --pull
	@echo "${GREEN}Образы успешно собраны${NC}"

# Инициализация приложения
app-init:	   composer-install db-create migrations-up
	@echo "${GREEN}Приложение успешно инициализировано${NC}"

# Создание базы данных
db-create:
	@echo "${BLUE}Создание базы данных...${NC}"
	docker compose run --rm app_data_api php bin/console doctrine:database:create --if-not-exists
	@echo "${GREEN}База данных создана${NC}"

# Применение миграций
migrations-up:
	@echo "${BLUE}Применение миграций...${NC}"
	docker compose run --rm app_data_api php bin/console doctrine:migrations:migrate -n
	@echo "${GREEN}Миграции успешно применены${NC}"

# Запуск консоли в контейнере
console:
	@echo "${BLUE}Запуск консоли в контейнере...${NC}"
	docker exec -it app_data_api bash

# Обновление зависимостей
composer-update:
	@echo "${BLUE}Обновление зависимостей...${NC}"
	docker compose run --rm app_data_api sudo composer update -W -o
	@echo "${GREEN}Зависимости обновлены${NC}"

# Установка зависимостей
composer-install:
	@echo "${BLUE}Установка зависимостей...${NC}"
	docker compose run --rm app_data_api sudo composer install -o
	@echo "${GREEN}Зависимости установлены${NC}"