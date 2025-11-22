import { BaseAgent } from './baseAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { DataCollectorResult, AnalyzerResult } from '../../types/index.js';

/**
 * Analyzer Agent
 * Анализирует собранные данные:
 * - NLP-анализ текстов (описания вакансий, статьи)
 * - Sentiment analysis (тональность упоминаний)
 * - Определение сильных/слабых сторон компании
 * - Оценка качества tech stack
 */
export class AnalyzerAgent extends BaseAgent {
  private promptTemplate: ChatPromptTemplate;

  constructor() {
    super('Analyzer');
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Ты аналитик IT-компаний. Анализируй данные о компании и давай объективную оценку.
Определи:
1. Sentiment (positive/neutral/negative) - общее впечатление о компании
2. Key insights - ключевые инсайты (3-5 пунктов)
3. Strengths - сильные стороны (технологии, активность, репутация)
4. Weaknesses - слабые стороны (проблемы, риски)
5. Tech Stack Quality - оценка качества технологического стека (0-100)

Отвечай ТОЛЬКО в формате JSON:
{{
  "sentiment": "positive/neutral/negative",
  "keyInsights": ["insight1", "insight2", ...],
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "techStackQuality": 85
}}`,
      ],
      ['user', 'Проанализируй данные о компании "{companyName}":\n\n{data}'],
    ]);
  }

  async analyze(companyName: string, collectedData: DataCollectorResult): Promise<AnalyzerResult> {
    return this.execute(async () => {
      this.log(`Analyzing data for: ${companyName}`);

      const chain = this.promptTemplate.pipe(this.model);

      const response = await chain.invoke({
        companyName,
        data: JSON.stringify(collectedData, null, 2),
      });

      const result = this.parseResponse(response.content as string);
      return result;
    });
  }

  private parseResponse(content: string): AnalyzerResult {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonStr);

      return {
        sentiment: parsed.sentiment || 'neutral',
        keyInsights: parsed.keyInsights || [],
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        techStackQuality: parsed.techStackQuality || 50,
      };
    } catch (error) {
      this.logError('Failed to parse analyzer response', error);
      // Return default values
      return {
        sentiment: 'neutral',
        keyInsights: ['Недостаточно данных для анализа'],
        strengths: [],
        weaknesses: [],
        techStackQuality: 50,
      };
    }
  }
}

export const analyzerAgent = new AnalyzerAgent();

