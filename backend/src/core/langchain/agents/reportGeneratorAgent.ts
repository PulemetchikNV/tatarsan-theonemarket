import { BaseAgent } from './baseAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { CompanyAnalysisResult } from '../../types/index.js';

/**
 * Report Generator Agent
 * Генерирует аналитические отчеты:
 * - Краткое резюме анализа
 * - Детальный отчет с визуализацией
 * - Рекомендации для инвесторов
 */
export class ReportGeneratorAgent extends SimpleAgent {
  private promptTemplate: ChatPromptTemplate;

  constructor() {
    super('ReportGenerator');
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Ты аналитик, генерирующий краткие и понятные отчеты об IT-компаниях для инвесторов.

Создай структурированный отчет на русском языке:
1. Executive Summary (2-3 предложения)
2. Ключевые метрики
3. Сильные стороны (bullet points)
4. Риски и слабости (bullet points)
5. Рекомендация с обоснованием

Стиль: деловой, конкретный, с цифрами.`,
      ],
      [
        'user',
        `Создай отчет о компании на основе анализа:

{analysisData}`,
      ],
    ]);
  }

  async generateReport(analysis: CompanyAnalysisResult): Promise<string> {
    return this.execute(async () => {
      this.log(`Generating report for: ${analysis.company.name}`);

      const chain = this.promptTemplate.pipe(this.model);

      const response = await chain.invoke({
        analysisData: JSON.stringify(
          {
            company: analysis.company,
            healthScore: analysis.healthScore,
            recommendation: analysis.recommendation,
            reasoning: analysis.reasoning,
            analyzer: analysis.analyzer,
            industryClassifier: analysis.industryClassifier,
            marketResearcher: analysis.marketResearcher,
            dataCollector: {
              vacancies: analysis.dataCollector.hhData?.totalVacancies,
              avgSalary: analysis.dataCollector.hhData?.avgSalary,
              githubActivity: analysis.dataCollector.githubData?.activity,
              articles: analysis.dataCollector.habrData?.totalArticles,
            },
          },
          null,
          2
        ),
      });

      return response.content as string;
    });
  }

  /**
   * Генерирует краткое резюме для дашборда
   */
  generateSummary(analysis: CompanyAnalysisResult): string {
    const { company, healthScore, recommendation, industryClassifier, dataCollector } = analysis;

    return `
📊 **${company.name}** | Health Score: ${healthScore}/100

🏢 Индустрия: ${industryClassifier.primaryIndustry} | Стадия: ${industryClassifier.stage}
💼 Вакансий: ${dataCollector.hhData?.totalVacancies || 0} | Средняя зарплата: ${dataCollector.hhData?.avgSalary?.toLocaleString() || 'н/д'} руб
💻 GitHub: ${dataCollector.githubData?.totalCommits || 0} коммитов | Активность: ${dataCollector.githubData?.activity || 0}/месяц
📝 Статей на Habr: ${dataCollector.habrData?.totalArticles || 0}

⭐ **Рекомендация**: ${recommendation === 'invest' ? '💰 ИНВЕСТИРОВАТЬ' : recommendation === 'watch' ? '👀 НАБЛЮДАТЬ' : '⚠️ ИЗБЕГАТЬ'}

${analysis.reasoning}
`.trim();
  }
}

export const reportGeneratorAgent = new ReportGeneratorAgent();

