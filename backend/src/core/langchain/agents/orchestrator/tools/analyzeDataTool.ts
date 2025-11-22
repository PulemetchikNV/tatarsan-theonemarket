import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { analyzerAgent } from '../../analyzerAgent.js';
import { createModuleLogger } from '../../../../utils/logger.js';
import type { AnalysisOutput } from '../types.js';
import type { DataCollectorResult } from '../../../../types/index.js';

const logger = createModuleLogger('analyzeDataTool');

/**
 * ФАЗА 2: Анализ данных
 * 
 * Tool для вызова AnalyzerAgent
 * Анализирует собранные данные: sentiment, сильные/слабые стороны
 */
export const analyzeDataTool = tool(
  async ({ companyName, collectedDataJson }) => {
    const startTime = Date.now();
    
    try {
      logger.info({ companyName }, '🔍 [PHASE 2.1] Starting data analysis');

      const collectedData: DataCollectorResult = JSON.parse(collectedDataJson);
      const data = await analyzerAgent.analyze(companyName, collectedData);
      const executionTime = Date.now() - startTime;

      logger.info({ executionTime, sentiment: data.sentiment }, '✅ [PHASE 2.1] Analysis completed');

      const output: AnalysisOutput = {
        success: true,
        data,
        executionTime,
      };

      return `✅ **ФАЗА 2.1 ЗАВЕРШЕНА: Анализ данных**

📊 Анализ за ${executionTime}ms:
- Sentiment: ${data.sentiment === 'positive' ? '😊 Позитивный' : data.sentiment === 'negative' ? '😞 Негативный' : '😐 Нейтральный'}
- Tech Stack Quality: ${data.techStackQuality}/100

💪 Сильные стороны:
${data.strengths.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

⚠️ Слабые стороны:
${data.weaknesses.map((w, i) => `  ${i + 1}. ${w}`).join('\n')}

💡 Ключевые инсайты:
${data.keyInsights.map((k, i) => `  ${i + 1}. ${k}`).join('\n')}`;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ err: error, executionTime }, '❌ [PHASE 2.1] Analysis failed');

      const output: AnalysisOutput = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };

      return `❌ **ФАЗА 2.1 ПРОВАЛЕНА: Ошибка анализа**

Ошибка: ${output.error}`;
    }
  },
  {
    name: 'analyze_data',
    description: `[ФАЗА 2.1] Анализирует собранные данные о компании.

КОГДА ИСПОЛЬЗОВАТЬ:
- После collect_data (ФАЗА 1)
- Параллельно с classify_industry и research_market
- Определяет сильные/слабые стороны компании

ПАРАМЕТРЫ:
- companyName: название компании
- collectedDataJson: JSON с данными из collect_data (stringify результата)

ВОЗВРАЩАЕТ:
- Sentiment анализ (positive/neutral/negative)
- Сильные стороны компании
- Слабые стороны компании
- Ключевые инсайты
- Качество tech stack (0-100)`,
    schema: z.object({
      companyName: z.string().describe('Название компании'),
      collectedDataJson: z.string().describe('JSON с собранными данными (из collect_data)'),
    }),
  }
);

