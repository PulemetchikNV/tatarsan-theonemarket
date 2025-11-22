FROM php:8.4-fpm

# Переменные
ARG UID=1000
ARG GID=1001
ENV TZ=Europe/Moscow APP_DIR=/var/www/app PHP_CONF_DIR=/usr/local/etc/php/conf.d

RUN apt-get update \
    && apt-get install -y nano git unzip wget sudo \
    libicu-dev libmcrypt-dev libxml2-dev libgmp-dev libpng-dev libzip-dev libpq-dev

RUN docker-php-ext-install bcmath \
	gettext \
    gd \
	gmp \
	intl \
	opcache \
	pcntl \
	pdo_pgsql \
	sockets \
    zip

RUN pecl install igbinary && echo "extension=igbinary.so" > /usr/local/etc/php/conf.d/igbinary.ini
RUN yes '' | pecl install redis && echo "extension=redis.so" > /usr/local/etc/php/conf.d/redis.ini
RUN pecl install xdebug && echo "zend_extension=xdebug.so" > /usr/local/etc/php/conf.d/xdebug.ini

RUN cd /usr/local/bin \
	&& curl https://getcomposer.org/composer-2.phar > composer \
	&& chmod +x composer

RUN chmod g+w /usr/local/etc/php/conf.d/ \
    && usermod -a -G staff www-data \
    && usermod --shell /bin/bash www-data \
    && chown www-data:staff /var/www \
    && echo 'www-data ALL=(ALL:ALL) NOPASSWD: ALL' > /etc/sudoers.d/www-data

# Создание директорий и файлов конфигурации
RUN mkdir -p $PHP_CONF_DIR && touch $PHP_CONF_DIR/custom.ini

# Копирование файлов
COPY --chown=www-data:www-data ./ $APP_DIR
COPY ./.docker/app/php/fpm/php.ini /usr/local/etc/php/php.ini

# Удаление Xdebug
RUN pecl uninstall xdebug || true && \
    rm -f $PHP_CONF_DIR/docker-php-ext-xdebug.ini $PHP_CONF_DIR/xdebug.ini

# Установка временной зоны и PHP-настроек
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    echo "date.timezone=$TZ" > $PHP_CONF_DIR/custom.ini && \
    rm -rf $APP_DIR/var/cache/* /var/www/app/var/log/* && \
    chmod +x $APP_DIR/.docker/app/cmd.sh

# Установка рабочей директории
WORKDIR $APP_DIR

# Изменение UID и GID пользователя www-data
RUN usermod --uid ${UID} www-data && groupmod --gid $GID www-data

# Установка пользователя и команды по умолчанию
USER www-data
CMD ["/var/www/app/.docker/app/cmd.sh"]
