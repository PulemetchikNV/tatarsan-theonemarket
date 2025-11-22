import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { dataCollectorAgent } from '../../dataCollectorAgent.js';
import { createModuleLogger } from '../../../../utils/logger.js';
import type { DataCollectionOutput } from '../types.js';

const logger = createModuleLogger('collectDataTool');

/**
 * ФАЗА 1: Сбор данных
 * 
 * Tool для вызова DataCollectorAgent
 * Собирает данные из HH.ru, GitHub, Habr
 */
export const collectDataTool = tool(
  async ({ companyName }) => {
    const startTime = Date.now();
    
    try {
      logger.info({ companyName }, '🔍 [PHASE 1] Starting data collection');

      const data = await dataCollectorAgent.collect(companyName);
      const executionTime = Date.now() - startTime;

      logger.info({ executionTime }, '✅ [PHASE 1] Data collection completed');

      const output: DataCollectionOutput = {
        success: true,
        data,
        executionTime,
      };

      // Форматируем для LLM
      return `✅ **ФАЗА 1 ЗАВЕРШЕНА: Сбор данных**

📊 Собрано за ${executionTime}ms:
- HH.ru: ${data.hhData ? `${data.hhData.totalVacancies} вакансий, ${data.hhData.requiredSkills.length} навыков` : 'нет данных'}
- GitHub: ${data.githubData ? `${data.githubData.totalRepos} репозиториев, ${data.githubData.languages.length} языков` : 'нет данных'}
- Habr: ${data.habrData ? `${data.habrData.totalArticles} статей, ${data.habrData.topics.length} тем` : 'нет данных'}

🎯 Tech Stack: ${data.hhData?.requiredSkills.join(', ') || 'не определен'}

⏭️ ПЕРЕХОДИ К ФАЗЕ 2: Используй analyze_data, classify_industry и research_market`;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ err: error, executionTime }, '❌ [PHASE 1] Data collection failed');

      const output: DataCollectionOutput = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };

      return `❌ **ФАЗА 1 ПРОВАЛЕНА: Ошибка сбора данных**

Ошибка: ${output.error}

⚠️ Можешь попробовать продолжить без полных данных или прервать анализ.`;
    }
  },
  {
    name: 'collect_data',
    description: `[ФАЗА 1] Собирает данные о компании из всех источников.

КОГДА ИСПОЛЬЗОВАТЬ:
- ЭТО ПЕРВЫЙ ШАГ! Всегда начинай с этого инструмента
- Собирает вакансии (HH.ru), репозитории (GitHub), статьи (Habr)
- Без этих данных невозможна ФАЗА 2

ПАРАМЕТРЫ:
- companyName: название компании для анализа

ВОЗВРАЩАЕТ:
- Статистику по вакансиям (зарплаты, навыки)
- Статистику по репозиториям (языки, активность)
- Статистику по статьям (темы, экспертиза)

ВАЖНО: После этого переходи к ФАЗЕ 2!`,
    schema: z.object({
      companyName: z.string().describe('Название компании для анализа'),
    }),
  }
);

