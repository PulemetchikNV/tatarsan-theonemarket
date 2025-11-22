import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { industryClassifierAgent } from '../../industryClassifierAgent.js';
import { createModuleLogger } from '../../../../utils/logger.js';
import type { ClassificationOutput } from '../types.js';
import type { Company, DataCollectorResult } from '../../../../types/index.js';

const logger = createModuleLogger('classifyIndustryTool');

/**
 * ФАЗА 2: Классификация индустрии
 * 
 * Tool для вызова IndustryClassifierAgent
 * Классифицирует компанию по Tech-индустриям
 */
export const classifyIndustryTool = tool(
  async ({ companyName, techStack, collectedDataJson }) => {
    const startTime = Date.now();
    
    try {
      logger.info({ companyName }, '🔍 [PHASE 2.2] Starting industry classification');

      const company: Company = {
        name: companyName,
        techStack: techStack ? techStack.split(',').map(t => t.trim()) : [],
        location: 'Татарстан',
      };

      const collectedData: DataCollectorResult = JSON.parse(collectedDataJson);
      const data = await industryClassifierAgent.classify(company, collectedData);
      const executionTime = Date.now() - startTime;

      logger.info({ 
        executionTime, 
        industry: data.primaryIndustry, 
        confidence: data.confidence 
      }, '✅ [PHASE 2.2] Classification completed');

      const output: ClassificationOutput = {
        success: true,
        data,
        executionTime,
      };

      return `✅ **ФАЗА 2.2 ЗАВЕРШЕНА: Классификация индустрии**

🏢 Классификация за ${executionTime}ms:
- Основная индустрия: **${data.primaryIndustry}**
- Дополнительные: ${data.secondaryIndustries.join(', ') || 'нет'}
- Стадия развития: ${data.stage}
- Уверенность: ${data.confidence}%

${data.confidence >= 80 ? '✅ Высокая уверенность классификации' : data.confidence >= 60 ? '⚠️ Средняя уверенность' : '❌ Низкая уверенность'}`;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ err: error, executionTime }, '❌ [PHASE 2.2] Classification failed');

      const output: ClassificationOutput = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };

      return `❌ **ФАЗА 2.2 ПРОВАЛЕНА: Ошибка классификации**

Ошибка: ${output.error}`;
    }
  },
  {
    name: 'classify_industry',
    description: `[ФАЗА 2.2] Классифицирует компанию по Tech-индустриям.

КОГДА ИСПОЛЬЗОВАТЬ:
- После collect_data (ФАЗА 1)
- Параллельно с analyze_data и research_market
- Определяет основную индустрию компании

ПАРАМЕТРЫ:
- companyName: название компании
- techStack: строка с технологиями через запятую (из collect_data)
- collectedDataJson: JSON с данными из collect_data

ВОЗВРАЩАЕТ:
- Основную индустрию (FinTech, EdTech, AI, etc)
- Дополнительные индустрии
- Стадию развития (idea/pre-seed/seed/growth/mature)
- Уверенность классификации (0-100)`,
    schema: z.object({
      companyName: z.string().describe('Название компании'),
      techStack: z.string().describe('Технологии компании через запятую'),
      collectedDataJson: z.string().describe('JSON с собранными данными'),
    }),
  }
);

