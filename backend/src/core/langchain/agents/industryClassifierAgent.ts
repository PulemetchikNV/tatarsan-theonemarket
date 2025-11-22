import { BaseAgent } from './baseAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { Company, DataCollectorResult, IndustryClassifierResult } from '../../types/index.js';

/**
 * Industry Classifier Agent
 * Классифицирует компанию по индустриям и определяет стадию развития:
 * - Primary/secondary industries (fintech, AI, gaming, e-commerce, etc)
 * - Стадия развития (idea, pre-seed, seed, growth, mature)
 * - Confidence score классификации
 */
export class IndustryClassifierAgent extends BaseAgent {
  private promptTemplate: ChatPromptTemplate;

  constructor() {
    super('IndustryClassifier');
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Ты эксперт по классификации IT-компаний. Определи индустрию и стадию развития компании.

Индустрии: fintech, AI/ML, gaming, e-commerce, edtech, healthtech, b2b-saas, cybersecurity, blockchain, social, marketplace, other

Стадии развития:
- idea: только идея, нет продукта
- pre-seed: MVP, первые пользователи
- seed: продукт запущен, растет команда
- growth: активный рост, масштабирование
- mature: устоявшаяся компания, большая команда

Отвечай ТОЛЬКО в формате JSON:
{{
  "primaryIndustry": "fintech",
  "secondaryIndustries": ["blockchain", "b2b-saas"],
  "confidence": 85,
  "stage": "growth"
}}`,
      ],
      [
        'user',
        `Классифицируй компанию "{companyName}" на основе данных:

Описание компании: {companyDescription}
Вакансии: {vacancies}
Tech Stack: {techStack}
GitHub активность: {githubActivity}
Статьи на Habr: {habrArticles}`,
      ],
    ]);
  }

  async classify(company: Company, collectedData: DataCollectorResult): Promise<IndustryClassifierResult> {
    return this.execute(async () => {
      this.log(`Classifying company: ${company.name}`);

      const chain = this.promptTemplate.pipe(this.model);

      const response = await chain.invoke({
        companyName: company.name,
        companyDescription: company.description || 'Нет описания',
        vacancies: JSON.stringify(collectedData.hhData?.vacancies || []),
        techStack: company.techStack?.join(', ') || 'Не определен',
        githubActivity: JSON.stringify(collectedData.githubData || {}),
        habrArticles: JSON.stringify(collectedData.habrData?.articles || []),
      });

      const result = this.parseResponse(response.content as string);
      return result;
    });
  }

  private parseResponse(content: string): IndustryClassifierResult {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonStr);

      return {
        primaryIndustry: parsed.primaryIndustry || 'other',
        secondaryIndustries: parsed.secondaryIndustries || [],
        confidence: parsed.confidence || 50,
        stage: parsed.stage || 'seed',
      };
    } catch (error) {
      this.logError('Failed to parse classifier response', error);
      return {
        primaryIndustry: 'other',
        secondaryIndustries: [],
        confidence: 30,
        stage: 'seed',
      };
    }
  }
}

export const industryClassifierAgent = new IndustryClassifierAgent();

