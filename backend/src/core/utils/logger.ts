import pino from 'pino'

/**
 * Настроенный логгер Pino для приложения
 * 
 * Окружения:
 * - production: JSON формат (для централизованного сбора логов в ELK/CloudWatch/etc)
 * - development: pino-pretty (человекочитаемый формат)
 * 
 * Уровни логирования:
 * - trace: детальная отладочная информация
 * - debug: отладочная информация
 * - info: информационные сообщения
 * - warn: предупреждения
 * - error: ошибки
 * - fatal: критические ошибки
 * 
 * @example
 * logger.info('Сообщение загружено')
 * logger.error({ err: error }, 'Ошибка при обработке')
 */
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    
    // Production: JSON формат для machine-readable логов
    // Development: pino-pretty для human-readable логов
    ...(process.env.NODE_ENV === 'production' ? {
        // Production конфигурация - структурированный JSON
        timestamp: pino.stdTimeFunctions.isoTime, // ISO 8601 timestamp
        formatters: {
            level: (label: string) => {
                return { level: label }
            },
            // Добавляем полезные поля для production
            bindings: (bindings: pino.Bindings) => {
                return {
                    pid: bindings.pid,
                    hostname: bindings.hostname,
                    node_env: process.env.NODE_ENV,
                }
            }
        }
    } : {
        // Development конфигурация - красивый вывод
        transport: {
            target: 'pino-pretty',
            options: {
                // Цвета
                colorize: true,
                
                // Формат времени: 12:34:56.789
                translateTime: 'SYS:HH:MM:ss.l',
                
                // Скрываем ненужные поля (module будет в messageFormat)
                ignore: 'pid,hostname',
                
                // Многострочный формат для лучшей читаемости объектов
                singleLine: false,
                
                // Формат сообщения: показываем модуль если есть
                messageFormat: '{module} {msg}',
                
                // Кастомные цвета для уровней
                customColors: 'info:cyan,warn:yellow,error:red,debug:gray',
                
                // Показываем stacktrace для ошибок
                errorLikeObjectKeys: ['err', 'error'],
            }
        }
    })
})

/**
 * Создает дочерний логгер для конкретного модуля
 * 
 * @param name - имя модуля
 * @example
 * const parserLogger = createModuleLogger('habrParser')
 * parserLogger.info('Загрузка RSS-ленты...')
 */
export function createModuleLogger(name: string) {
    return logger.child({ module: name })
}
