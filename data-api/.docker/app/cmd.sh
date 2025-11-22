#!/usr/bin/env bash

/usr/local/bin/php bin/console cache:clear
/usr/local/bin/php bin/console doctrine:migrations:migrate --no-interaction
/usr/local/bin/php bin/console doctrine:fixtures:load -n --append

php-fpm --nodaemonize

