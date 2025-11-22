import { BaseAgent } from './baseAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { dataCollectorAgent } from './dataCollectorAgent.js';
import { analyzerAgent } from './analyzerAgent.js';
import { industryClassifierAgent } from './industryClassifierAgent.js';
import { marketResearcherAgent } from './marketResearcherAgent.js';
import { eventTrackerAgent } from './eventTrackerAgent.js';
import { alerterAgent } from './alerterAgent.js';
import { reportGeneratorAgent } from './reportGeneratorAgent.js';
import type {
  Company,
  CompanyAnalysisResult,
  DashboardData,
} from '../../types/index.js';

/**
 * Orchestrator Agent - ГЛАВНЫЙ КООРДИНАТОР
 * Координирует работу всех 7 агентов:
 * 1. Data Collector
 * 2. Analyzer
 * 3. Industry Classifier
 * 4. Market Researcher
 * 5. Event Tracker
 * 6. Alerter
 * 7. Report Generator
 * 
 * Управляет последовательностью вызовов и агрегирует результаты
 */
export class OrchestratorAgent extends BaseAgent {
  private recommendationPrompt: ChatPromptTemplate;

  constructor() {
    super('Orchestrator');
    this.recommendationPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Ты главный аналитик-инвестор. На основе всех данных принимаешь финальное решение.

Оцени:
1. Health Score (0-100) - общая оценка здоровья компании
2. Recommendation: "invest", "watch" или "avoid"
3. Reasoning - краткое обоснование решения (2-3 предложения)

Факторы для оценки:
- Качество tech stack и активность разработки
- Рыночный потенциал и тренды
- Стадия развития компании
- Sentiment и репутация
- Наличие инвестиций и новостей

Отвечай ТОЛЬКО в формате JSON:
{{
  "healthScore": 78,
  "recommendation": "invest",
  "reasoning": "Компания показывает высокую активность разработки..."
}}`,
      ],
      [
        'user',
        `Проанализируй все данные о компании "{companyName}" и дай финальную оценку:

{aggregatedData}`,
      ],
    ]);
  }

  /**
   * Главный метод - полный анализ компании
   */
  async analyzeCompany(companyName: string, deepAnalysis = true): Promise<CompanyAnalysisResult> {
    return this.execute(async () => {
      this.log(`🎯 Starting full analysis for: ${companyName}`);
      const startTime = Date.now();

      // STEP 1: Data Collection
      this.log('Step 1/7: Collecting data from all sources...');
      const collectedData = await dataCollectorAgent.collect(companyName);

      // Создаем объект Company из собранных данных
      const company: Company = {
        name: companyName,
        techStack: collectedData.hhData?.requiredSkills || [],
        location: 'Татарстан',
      };

      // STEP 2-5: Параллельный анализ (ускоряем обработку)
      this.log('Steps 2-5: Running parallel analysis...');
      const [analyzerResult, classifierResult, researcherResult, trackerResult] = await Promise.all([
        analyzerAgent.analyze(companyName, collectedData),
        industryClassifierAgent.classify(company, collectedData),
        marketResearcherAgent.research(companyName, collectedData),
        eventTrackerAgent.track(companyName, collectedData),
      ]);

      // STEP 6: Финальная оценка через LLM
      this.log('Step 6/7: Generating final recommendation...');
      const finalDecision = await this.generateFinalDecision(companyName, {
        analyzer: analyzerResult,
        classifier: classifierResult,
        researcher: researcherResult,
        tracker: trackerResult,
      });

      // Собираем полный результат
      const analysis: CompanyAnalysisResult = {
        company,
        dataCollector: collectedData,
        analyzer: analyzerResult,
        industryClassifier: classifierResult,
        marketResearcher: researcherResult,
        eventTracker: trackerResult,
        healthScore: finalDecision.healthScore,
        recommendation: finalDecision.recommendation,
        reasoning: finalDecision.reasoning,
        timestamp: new Date().toISOString(),
      };

      // STEP 7: Генерация отчета и алертов (в фоне, не блокируем)
      this.log('Step 7/7: Generating alerts and reports...');
      Promise.all([
        alerterAgent.generateAlerts(analysis),
        reportGeneratorAgent.generateReport(analysis),
      ]).catch((err) => this.logError('Failed to generate alerts/reports', err));

      const totalTime = Date.now() - startTime;
      this.log(`✅ Analysis completed in ${totalTime}ms`);

      return analysis;
    });
  }

  /**
   * Финальное решение на основе всех агентов
   */
  private async generateFinalDecision(
    companyName: string,
    aggregatedData: any
  ): Promise<{ healthScore: number; recommendation: 'invest' | 'watch' | 'avoid'; reasoning: string }> {
    try {
      const chain = this.recommendationPrompt.pipe(this.model);

      const response = await chain.invoke({
        companyName,
        aggregatedData: JSON.stringify(aggregatedData, null, 2),
      });

      const content = response.content as string;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonStr);

      return {
        healthScore: parsed.healthScore || 50,
        recommendation: parsed.recommendation || 'watch',
        reasoning: parsed.reasoning || 'Недостаточно данных для точной оценки',
      };
    } catch (error) {
      this.logError('Failed to generate final decision', error);
      return {
        healthScore: 50,
        recommendation: 'watch',
        reasoning: 'Ошибка при генерации финального решения',
      };
    }
  }

  /**
   * Получение данных для дашборда
   */
  async getDashboard(): Promise<DashboardData> {
    return this.execute(async () => {
      this.log('Generating dashboard data...');

      // TODO: Для MVP возвращаем mock данные
      // В будущем: агрегация из БД/кэша по всем компаниям
      return {
        overview: {
          totalCompanies: 127,
          totalVacancies: 485,
          avgSalary: 165000,
          topTechnologies: ['TypeScript', 'React', 'Python', 'Go', 'PostgreSQL'],
          growthRate: 12.5,
        },
        topCompanies: [
          {
            name: 'Таттелеком',
            industry: 'telecom',
            healthScore: 85,
            techStack: ['Java', 'PostgreSQL', 'Kubernetes'],
            vacancyCount: 15,
          },
          {
            name: 'Иннополис',
            industry: 'edtech',
            healthScore: 92,
            techStack: ['Python', 'React', 'PostgreSQL'],
            vacancyCount: 23,
          },
        ],
        techTrends: [
          {
            technology: 'TypeScript',
            demand: 95,
            growth: 18.5,
            avgSalary: 180000,
          },
          {
            technology: 'Python',
            demand: 88,
            growth: 15.2,
            avgSalary: 175000,
          },
          {
            technology: 'Go',
            demand: 72,
            growth: 25.8,
            avgSalary: 200000,
          },
        ],
        salaryStats: {
          byTech: {
            TypeScript: 180000,
            Python: 175000,
            Go: 200000,
            Java: 170000,
            React: 165000,
          },
          byExperience: {
            junior: 80000,
            middle: 150000,
            senior: 250000,
          },
          trend: 'rising',
        },
        activityIndex: 78,
      };
    });
  }
}

export const orchestratorAgent = new OrchestratorAgent();

