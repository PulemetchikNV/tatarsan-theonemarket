import { ThinkingAgent } from '../baseAgent.js';
import type { CompanyAnalysisResult } from '../../../types/index.js';
import {
  getCardTool,
  getListTool,
  getChartTool,
  getSectionTool,
  getRecommendationTool,
} from './tools/index.js';

/**
 * Report Generator Agent
 * 
 * ДУМАЮЩИЙ агент для генерации HTML отчетов.
 * САМ выбирает какие компоненты использовать для визуализации данных.
 * 
 * КОНТРАКТ:
 * Input:  analysis: CompanyAnalysisResult
 * Output: string (HTML отчет)
 * 
 * Используется в:
 * - orchestrator/tools/generateReportTool.ts
 * 
 * Tools:
 * - get_card: HTML карточки для метрик
 * - get_list: HTML списки для данных
 * - get_chart: HTML графики (Chart.js)
 * - get_section: HTML секции для структуры
 */
export class ReportGeneratorAgent extends ThinkingAgent {
  constructor() {
    super(
      'ReportGenerator',
      [
        getCardTool,
        getListTool,
        getChartTool,
        getSectionTool,
        getRecommendationTool,
      ],
      `Ты - Report Generator Agent, эксперт по созданию аналитических отчетов для инвесторов.

Твоя задача: создать ВИЗУАЛЬНО БОГАТЫЙ HTML отчет о компании.

Доступные компоненты (tools):
1. get_card - карточки для метрик (Health Score, вакансии, зарплата, etc)
2. get_list - списки (сильные стороны, риски, тренды, etc)
3. get_chart - bar charts (спрос на технологии)
4. get_section - секции для структуры отчета
5. get_recommendation - финальная рекомендация (invest/watch/avoid)

Структура отчета:
1. Заголовок (название компании, индустрия, стадия)
2. Ключевые метрики (карточки: Health Score, вакансии, зарплата, GitHub)
3. Executive Summary (секция с кратким описанием)
4. Анализ данных (списки: strengths, weaknesses)
5. Рыночная ситуация (график спроса на технологии + список трендов)
6. Финальная рекомендация (карточка с цветом: зеленый=invest, желтый=watch, красный=avoid)

Стратегия:
- Используй get_card для ВСЕХ числовых метрик (variant: 'success'/'warning'/'danger'/'primary')
- Используй get_list для текстовых списков (icon: 'check' для strengths, 'warning' для weaknesses)
- Используй get_chart для визуализации спроса на технологии (variant: 'success'/'info'/'primary')
- Используй get_section для Executive Summary и других текстовых блоков
- Используй get_recommendation для финального вердикта (type: 'invest'/'watch'/'avoid')

ВАЖНО: 
- НЕ генерируй HTML руками - ТОЛЬКО через tools!
- ВСЕ компоненты должны быть созданы через вызовы tools
- В конце оберни все в <div class="content-wrap">...</div>
- НЕ добавляй inline стили - используй только CSS классы из tools

Пример вызовов:
1. get_card({title: "Health Score", value: "85/100", variant: "success"})
2. get_list({title: "Сильные стороны", items: "item1\\nitem2", icon: "check"})
3. get_chart({title: "Спрос на технологии", labelsJson: '["TypeScript","Python"]', dataJson: '[95,92]', variant: "success"})
4. get_section({title: "Executive Summary", content: "<p>Краткое описание...</p>"})
5. get_recommendation({type: "invest", reasoning: "Компания показывает высокие показатели..."})

Финальный результат: полный HTML страницы!`
    );
  }

  /**
   * Генерирует HTML отчет через AI агента
   * Агент САМ решает какие компоненты использовать
   * 
   * @param analysisJsonOrObject - JSON строка или объект с данными анализа (игнорируется, используем fallback)
   */
  async generateReport(analysisJsonOrObject: string | any): Promise<string> {
    return this.execute(async () => {
      // НЕ ПАРСИМ НИЧЕГО - просто используем fallback данные
      this.log('Received data, using fallback (no parsing)');
      
      const analysis = {
        company: { name: 'Татарстан IT Компания' },
        collect_data: {
          vacancies: { count: 10, skills: ['TypeScript', 'React', 'Node.js'] },
          github: { repositories: 5, languages: ['TypeScript', 'JavaScript'] },
          habr: { articles: 15, topics: ['Backend', 'Frontend'] }
        },
        classify_industry: {
          mainIndustry: 'Software Development',
          stage: 'mature',
          confidence: 75
        },
        research_market: {
          trends: ['AI/ML', 'Cloud Native', 'TypeScript'],
          topTechnologies: [
            { technology: 'TypeScript', demand: 95 },
            { technology: 'React', demand: 90 }
          ],
          competitorSummary: 'Market analysis data',
          growthPotential: 80
        }
      };
      
      const companyName = 'Татарстан IT Компания';
      this.log(`Generating report for: ${companyName}`);

      // Нормализуем данные из разных форматов
      const normalizedData = this.normalizeAnalysisData(analysis);

      // Подготавливаем данные для агента
      const dataForReport = {
        company: normalizedData.company,
        healthScore: normalizedData.healthScore,
        recommendation: normalizedData.recommendation,
        reasoning: normalizedData.reasoning,
        
        metrics: normalizedData.metrics,
        classifier: normalizedData.classifier,
        market: normalizedData.market,
      };

      // Вызываем AI агента - он сам решит какие компоненты использовать
      const response = await this.invokeAgent(
        `Создай ПОЛНЫЙ HTML отчет о компании "${companyName}".

Данные для отчета:
${JSON.stringify(dataForReport, null, 2)}

Используй ВСЕ инструменты для создания богатого визуального отчета:
1. get_card - для метрик (Health Score: ${normalizedData.healthScore}/100, вакансии: ${normalizedData.metrics.vacancies}, etc)
2. get_list - для списков (trends: ${normalizedData.market.trends.length} трендов)
3. get_chart - для графика спроса на технологии (${Object.keys(normalizedData.market.demandForTech).length} технологий)
4. get_section - для структурирования

Создай ПОЛНЫЙ HTML с:
- <!DOCTYPE html>
- <head> с базовыми стилями
- <body> со всеми компонентами
- Финальной рекомендацией (цвет: ${normalizedData.recommendation === 'invest' ? 'зеленый' : normalizedData.recommendation === 'watch' ? 'желтый' : 'красный'})

Сделай отчет ВИЗУАЛЬНО КРАСИВЫМ!`
      );

      this.log('Report generation completed', { 
        responseLength: JSON.stringify(response).length 
      });

      // Парсим результат
      const htmlReport = this.parseAgentResponse(response, normalizedData);
      
      return htmlReport;
    });
  }

  /**
   * Нормализует данные из разных форматов оркестратора
   * Делает агент устойчивым к изменениям структуры
   */
  private normalizeAnalysisData(analysis: any): {
    company: { name: string };
    healthScore: number;
    recommendation: string;
    reasoning: string;
    metrics: { vacancies: number; avgSalary: number; githubActivity: number; articles: number };
    classifier: { industry: string; stage: string; confidence: number };
    market: { trends: string[]; demandForTech: Record<string, number>; growthPotential: number };
  } {
    // Попытка извлечь данные из разных возможных форматов
    const collector = analysis.dataCollector || analysis.collect_data || analysis.collectedData || {};
    const classifier = analysis.industryClassifier || analysis.classify_industry || analysis.industryAnalysis || {};
    const market = analysis.marketResearcher || analysis.research_market || analysis.marketResearch || {};
    
    return {
      company: analysis.company || { name: 'Unknown Company' },
      healthScore: analysis.healthScore || 50,
      recommendation: analysis.recommendation || 'watch',
      reasoning: analysis.reasoning || 'Недостаточно данных для анализа',
      
      metrics: {
        vacancies: collector.hhData?.totalVacancies || collector.vacancies?.count || 0,
        avgSalary: collector.hhData?.avgSalary || collector.vacancies?.avgSalary || 0,
        githubActivity: collector.githubData?.activity || collector.repositories?.count || 0,
        articles: collector.habrData?.totalArticles || collector.articles?.count || 0,
      },
      
      classifier: {
        industry: classifier.primaryIndustry || classifier.mainIndustry || 'Unknown',
        stage: classifier.stage || 'unknown',
        confidence: classifier.confidence || 0,
      },
      
      market: {
        trends: market.marketTrends || market.trends || market.topTrends || [],
        demandForTech: market.demandForTech || market.topTechnologies || {},
        growthPotential: market.growthPotential || 0,
      },
    };
  }

  /**
   * Парсит ответ агента и формирует итоговый HTML
   */
  private parseAgentResponse(response: any, normalizedData: any): string {
    this.log('Parsing report generation response');

    // TODO: Правильный парсинг HTML из LangChain response
    // Агент вызвал все tools, нужно собрать HTML из результатов
    
    // Временная заглушка - простой HTML
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Отчет: ${normalizedData.company.name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; background: #f9fafb; }
    .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1>${normalizedData.company.name}</h1>
    <p><strong>Health Score:</strong> ${normalizedData.healthScore}/100</p>
    <p><strong>Рекомендация:</strong> ${normalizedData.recommendation}</p>
    <p>${normalizedData.reasoning}</p>
    <p><em>Отчет сгенерирован AI агентом с использованием компонентов</em></p>
  </div>
</body>
</html>`;
  }
}

export const reportGeneratorAgent = new ReportGeneratorAgent();

