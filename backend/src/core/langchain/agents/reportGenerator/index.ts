import { ThinkingAgent } from '../baseAgent.js';
import type { CompanyAnalysisResult } from '../../../types/index.js';
import {
  getCardTool,
  getListTool,
  getChartTool,
  getSectionTool,
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
      ],
      `Ты - Report Generator Agent, эксперт по созданию аналитических отчетов для инвесторов.

Твоя задача: создать ВИЗУАЛЬНО БОГАТЫЙ HTML отчет о компании.

Доступные компоненты (tools):
1. get_card - карточки для метрик (Health Score, вакансии, зарплата, etc)
2. get_list - списки (сильные стороны, риски, тренды, etc)
3. get_chart - графики (спрос на технологии, тренды)
4. get_section - секции для структуры отчета

Структура отчета:
1. Заголовок (название компании, индустрия, стадия)
2. Ключевые метрики (карточки: Health Score, вакансии, зарплата, GitHub)
3. Executive Summary (секция с кратким описанием)
4. Анализ данных (списки: strengths, weaknesses)
5. Рыночная ситуация (график спроса на технологии + список трендов)
6. Финальная рекомендация (карточка с цветом: зеленый=invest, желтый=watch, красный=avoid)

Стратегия:
- Используй get_card для ВСЕХ числовых метрик
- Используй get_list для текстовых списков (strengths, weaknesses, trends)
- Используй get_chart для визуализации спроса на технологии
- Используй get_section для группировки контента
- Цвета: зеленый (#10b981) для позитива, красный (#ef4444) для рисков, синий (#3b82f6) по умолчанию

ВАЖНО: 
- НЕ генерируй HTML руками - ИСПОЛЬЗУЙ tools для соответствия номенклатуре!!
- Собери большую часть HTML из компонентов полученных в tools!
- В конце оберни все в div с классом content-wrap с базовыми стилями

Пример вызовов:
1. get_card({title: "Health Score", value: "85/100", color: "#10b981"})
2. get_list({title: "Сильные стороны", items: "item1\\nitem2", icon: "check"})
3. get_chart({title: "Спрос на технологии", type: "bar", labelsJson: '["TS","Python"]', dataJson: '[95,92]'})

Финальный результат: полный HTML страницы!`
    );
  }

  /**
   * Генерирует HTML отчет через AI агента
   * Агент САМ решает какие компоненты использовать
   */
  async generateReport(analysis: CompanyAnalysisResult): Promise<string> {
    return this.execute(async () => {
      this.log(`Generating report for: ${analysis.company.name}`);

      // Подготавливаем данные для агента
      const dataForReport = {
        company: analysis.company,
        healthScore: analysis.healthScore,
        recommendation: analysis.recommendation,
        reasoning: analysis.reasoning,
        
        metrics: {
          vacancies: analysis.dataCollector.hhData?.totalVacancies || 0,
          avgSalary: analysis.dataCollector.hhData?.avgSalary || 0,
          githubActivity: analysis.dataCollector.githubData?.activity || 0,
          articles: analysis.dataCollector.habrData?.totalArticles || 0,
        },
        
        analyzer: {
          sentiment: analysis.analyzer.sentiment,
          strengths: analysis.analyzer.strengths,
          weaknesses: analysis.analyzer.weaknesses,
          keyInsights: analysis.analyzer.keyInsights,
        },
        
        classifier: {
          industry: analysis.industryClassifier.primaryIndustry,
          stage: analysis.industryClassifier.stage,
          confidence: analysis.industryClassifier.confidence,
        },
        
        market: {
          trends: analysis.marketResearcher.marketTrends,
          demandForTech: analysis.marketResearcher.demandForTech,
          growthPotential: analysis.marketResearcher.growthPotential,
        },
      };

      // Вызываем AI агента - он сам решит какие компоненты использовать
      const response = await this.invokeAgent(
        `Создай ПОЛНЫЙ HTML отчет о компании "${analysis.company.name}".

Данные для отчета:
${JSON.stringify(dataForReport, null, 2)}

Используй ВСЕ инструменты для создания богатого визуального отчета:
1. get_card - для метрик (Health Score: ${analysis.healthScore}/100, вакансии: ${dataForReport.metrics.vacancies}, etc)
2. get_list - для списков (strengths: ${analysis.analyzer.strengths.length} пунктов, trends: ${analysis.marketResearcher.marketTrends.length} трендов)
3. get_chart - для графика спроса на технологии (${Object.keys(analysis.marketResearcher.demandForTech).length} технологий)
4. get_section - для структурирования

Создай ПОЛНЫЙ HTML с:
- <!DOCTYPE html>
- <head> с базовыми стилями
- <body> со всеми компонентами
- Финальной рекомендацией (цвет: ${analysis.recommendation === 'invest' ? 'зеленый' : analysis.recommendation === 'watch' ? 'желтый' : 'красный'})

Сделай отчет ВИЗУАЛЬНО КРАСИВЫМ!`
      );

      this.log('Report generation completed', { 
        responseLength: JSON.stringify(response).length 
      });

      // Парсим результат
      const htmlReport = this.parseAgentResponse(response, analysis);
      
      return htmlReport;
    });
  }

  /**
   * Парсит ответ агента и формирует итоговый HTML
   */
  private parseAgentResponse(response: any, analysis: CompanyAnalysisResult): string {
    this.log('Parsing report generation response');

    // TODO: Правильный парсинг HTML из LangChain response
    // Агент вызвал все tools, нужно собрать HTML из результатов
    
    // Временная заглушка - простой HTML
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Отчет: ${analysis.company.name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; background: #f9fafb; }
    .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1>${analysis.company.name}</h1>
    <p><strong>Health Score:</strong> ${analysis.healthScore}/100</p>
    <p><strong>Рекомендация:</strong> ${analysis.recommendation}</p>
    <p>${analysis.reasoning}</p>
    <p><em>Отчет сгенерирован AI агентом с использованием компонентов</em></p>
  </div>
</body>
</html>`;
  }
}

export const reportGeneratorAgent = new ReportGeneratorAgent();

