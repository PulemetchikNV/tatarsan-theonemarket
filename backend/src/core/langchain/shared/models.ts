/**
 * Централизованная конфигурация LLM моделей
 * 
 * Этот модуль предоставляет:
 * 1. Фабрику getModel() для создания моделей с единой конфигурацией
 * 2. Feature-флаги MODELS для управления какие модели используются где
 * 3. Готовые экспорты моделей для обратной совместимости
 * 
 * @example
 * // Использование через feature-флаги (рекомендуется)
 * import { MODELS } from './shared/models'
 * const response = await MODELS.main.invoke("Hello")
 * 
 * @example
 * // Создание кастомной модели
 * import { getModel } from './shared/models'
 * const customModel = getModel({ model: 'gpt-4o', temperature: 0.7, verbose: true })
 * 
 * @example
 * // Использование готовых экспортов
 * import { gpt4oMiniModel } from './shared/models'
 * const response = await gpt4oMiniModel.invoke("Hello")
 */

import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config'

/**
 * Типы доступных моделей
 */
export type ModelName = 
    | 'gpt-5-mini'
    | 'gpt-5-nano'
    | 'gpt-4.1-mini'
    | 'gpt-4o-mini'
    | 'gpt-4.1'
    | 'o3'

/**
 * Параметры для создания модели
 */
interface ModelConfig {
    model: ModelName
    temperature?: number
    verbose?: boolean
}


/**
 * Фабрика для создания моделей с единой конфигурацией
 */
export function getModel(config: ModelConfig | ModelName): ChatOpenAI {
    const modelConfig: ModelConfig = typeof config === 'string' 
        ? { model: config } 
        : config;

    const { model, verbose = false } = modelConfig;
    const baseURL = 'https://api.proxyapi.ru/openai/v1';

    return new ChatOpenAI({
        model,
        // temperature,
        verbose,
        apiKey: process.env.PROXY_API_KEY,
        configuration: {
            baseURL,
        },
    });
}

/**
 * Feature-флаги: конфигурация моделей для разных задач
 * Централизованное место для управления какие модели используются где
 */
export const MODELS = {
    main: getModel('gpt-4.1-mini'),
    reportGenerator: getModel('gpt-4.1-mini'),
} as const;