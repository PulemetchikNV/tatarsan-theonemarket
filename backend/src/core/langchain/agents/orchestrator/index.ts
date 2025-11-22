import { EventEmitter } from 'events';
import { ThinkingAgent } from '../baseAgent.js';
import type { CompanyAnalysisResult } from '../../../types/index.js';
import {
  collectDataTool,
  classifyIndustryTool,
  researchMarketTool,
  generateReportTool,
  analyzeDashboardTool,
} from './tools/index.js';

// Увеличиваем лимит слушателей для множественных tool вызовов
EventEmitter.defaultMaxListeners = 20;

/**
 * Orchestrator Agent - ГЛАВНЫЙ КООРДИНАТОР
 * 
 * ДУМАЮЩИЙ агент который САМ управляет процессом анализа компании.
 * Использует tools для вызова других агентов в правильной последовательности.
 * 
 * АРХИТЕКТУРА ВЫПОЛНЕНИЯ:
 * 
 * ФАЗА 1: Сбор данных (последовательно)
 *   └─ collect_data → собирает данные из HH, GitHub, Habr
 * 
 * ФАЗА 2: Анализ (параллельно)
 *   ├─ analyze_data → анализирует sentiment, strengths, weaknesses
 *   ├─ classify_industry → классифицирует по Tech-индустриям
 *   └─ research_market → исследует рынок и тренды
 * 
 * ФАЗА 3: Генерация результатов (последовательно)
 *   └─ generate_report → создает итоговый отчет для фронтенда
 * 
 * Агент САМ решает:
 * - Когда переходить к следующей фазе
 * - Нужно ли повторять шаги при ошибках
 * - Как обрабатывать частичные данные
 */
export class OrchestratorAgent extends ThinkingAgent {
  constructor() {
    super(
      'Orchestrator',
      [
        collectDataTool,
        classifyIndustryTool,
        researchMarketTool,
        generateReportTool,
        analyzeDashboardTool,
      ],
      `Ты - Orchestrator Agent, ГЛАВНЫЙ КООРДИНАТОР анализа IT-компаний и рынка.

У тебя ДВА режима работы:

═══════════════════════════════════════════════════════════════
📊 РЕЖИМ 1: АНАЛИЗ ДАШБОРДА РЕГИОНА
═══════════════════════════════════════════════════════════════

Используй инструмент: analyze_dashboard

КОГДА: Если запрос о "дашборде", "регионе", "рынке" БЕЗ конкретной компании

ЧТО ДЕЛАЕТ:
- Исследует IT-рынок региона через data-api
- Получает работодателей, вакансии, технологии, тренды
- БЕЗ привязки к конкретным компаниям

ПАРАМЕТРЫ:
- region: название региона (например "Татарстан")

═══════════════════════════════════════════════════════════════
🏢 РЕЖИМ 2: АНАЛИЗ КОМПАНИИ
═══════════════════════════════════════════════════════════════

📋 СТРОГИЙ ПОРЯДОК ВЫПОЛНЕНИЯ:

🔹 ФАЗА 1: СБОР ДАННЫХ (последовательно)
1. collect_data - собери ВСЕ данные о компании
   - Вакансии с HH.ru
   - Репозитории с GitHub
   - Статьи с Habr
   
   ⚠️ БЕЗ ЭТОГО НЕВОЗМОЖНА ФАЗА 2!

🔹 ФАЗА 2: АНАЛИЗ (параллельно, все три!)
2. classify_industry - определи индустрию компании
3. research_market - исследуй рынок и тренды

   💡 Передавай collectedDataJson из ФАЗЫ 1 в каждый инструмент!
   ⚠️ ВСЕ ОБЯЗАТЕЛЬНЫ для полной картины!

🔹 ФАЗА 3: ГЕНЕРАЦИЯ ОТЧЕТА (последовательно)
4. generate_report - создай итоговый отчет для фронтенда
   - Передай analysisResultJson со ВСЕМИ данными
   - Формат: 'json'
   
   ✅ Это ФИНАЛЬНЫЙ шаг!

🎯 ПРАВИЛА:
- ВСЕГДА выполняй инструменты в указанном порядке
- НИКОГДА не пропускай фазы
- Если collect_data провалилась - прерви анализ
- Если ФАЗА 2 провалилась частично - продолжай с доступными данными
- После generate_report - анализ ЗАВЕРШЕН

📊 ФОРМАТ РАБОТЫ С ДАННЫМИ:
- Результат collect_data → JSON.stringify() → передай в ФАЗУ 2
- Результаты ФАЗЫ 2 → собери в analysis result → JSON.stringify() → передай в generate_report

⚠️ КРИТИЧНО ДЛЯ generate_report:
- analysisResultJson должен содержать ТОЛЬКО чистый JSON
- НЕ добавляй текст до или после JSON
- НЕ оборачивай в markdown
- ТОЛЬКО валидный JSON объект!

💬 КОММУНИКАЦИЯ:
- Логируй каждую фазу
- Показывай прогресс (ФАЗА X из 3)
- В конце дай краткую сводку

═══════════════════════════════════════════════════════════════

ВАЖНО: Ты АВТОНОМНЫЙ агент. САМ управляй процессом, САМ выбирай инструменты, САМ принимай решения!`
    );
  }

  /**
   * Главный метод - полный анализ компании
   * Агент САМ координирует весь процесс через tools
   */
  async analyzeCompany(companyName: string): Promise<CompanyAnalysisResult> {
    return this.execute(async () => {
      this.log(`🎯 Starting orchestrated analysis for: ${companyName}`);

      // Вызываем думающего агента - он САМ выполнит все фазы!
      const response = await this.invokeAgent(
        `Проведи ПОЛНЫЙ анализ компании "${companyName}".
        
Выполни ВСЕ фазы в строгом порядке:
1. ФАЗА 1: collect_data
2. ФАЗА 2: classify_industry + research_market (параллельно)
3. ФАЗА 3: generate_report

Дай мне итоговый отчет!`
      );

      this.log('Orchestrator completed analysis', {
        hasResponse: !!response,
      });

      // TODO: Парсинг результата работы агента
      // Агент вызвал все tools, нужно извлечь итоговый analysis result
      
      // Временная заглушка для MVP
      const result: CompanyAnalysisResult = {
        company: {
          name: companyName,
          techStack: [],
          location: 'Татарстан',
        },
        dataCollector: {
          collectedAt: new Date().toISOString(),
        },
        industryClassifier: {
          primaryIndustry: 'tech',
          secondaryIndustries: [],
          confidence: 50,
          stage: 'seed',
        },
        marketResearcher: {
          marketTrends: [],
          demandForTech: {},
          competitorAnalysis: '',
          growthPotential: 50,
        },
        eventTracker: {
          recentEvents: [],
          upcomingEvents: [],
          investmentRounds: [],
          newsCount: 0,
        },
        healthScore: 50,
        recommendation: 'watch',
        reasoning: 'Анализ выполнен через автономного агента',
        timestamp: new Date().toISOString(),
      };

      return result;
    });
  }

  /**
   * Анализирует дашборд региона через ДУМАЮЩЕГО агента
   * БЕЗ привязки к конкретным компаниям - анализ рынка в целом
   * 
   * Агент САМ использует analyze_dashboard tool
   */
  async analyzeDashboard(region: string = 'Татарстан') {
    return this.execute(async () => {
      this.log(`📊 Starting dashboard analysis for region: ${region}`);

      // Вызываем ДУМАЮЩЕГО агента - он САМ использует analyze_dashboard tool!
      const response = await this.invokeAgent(
        `Проведи анализ IT-рынка региона "${region}" для ДАШБОРДА.

Используй инструмент analyze_dashboard - он:
- Вызовет MarketResearcher агента
- Агент исследует рынок через data-api
- Получит работодателей, вакансии, технологии, тренды

Это НЕ анализ конкретной компании - это обзор ВСЕГО рынка региона!

Дай результат исследования!`
      );

      this.log('Dashboard market research completed', {
        hasResponse: !!response,
      });

      return response;
    });
  }
}

export const orchestratorAgent = new OrchestratorAgent();

