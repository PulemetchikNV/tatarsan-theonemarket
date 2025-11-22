import { z } from 'zod';
import { SimpleAgent } from '../simpleAgent.js';
import { MODELS } from '../../shared/models.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { Company, DataCollectorResult, IndustryClassifierResult } from '../../../types/index.js';

/**
 * Industry Classifier Agent
 * 
 * Простой агент для классификации компаний по Tech-индустриям.
 * НЕ использует AI tools - использует withStructuredOutput для строгой валидации.
 * 
 * Особенности:
 * - Zod-схема для структурированного вывода
 * - GPT модели из централизованной конфигурации
 * - Детальная классификация по 40+ категориям Tech-индустрий
 * - Определение стадии развития (idea/pre-seed/seed/growth/mature)
 * 
 * КОНТРАКТ:
 * Input:  company: Company, collectedData: DataCollectorResult
 * Output: IndustryClassifierResult
 * 
 * Используется в:
 * - orchestrator/tools/classifyIndustryTool.ts
 */

// Zod-схема для строгой валидации ответа LLM
const AnalysisSchema = z.object({
  companyName: z.string().describe('The main company being analyzed'),
  industry: z
    .enum([
      // Финансы и бизнес
      'FinTech', 'InsurTech', 'RegTech', 'WealthTech', 'PayTech', 'LegalTech', 'TaxTech',
      // Здоровье и биология
      'MedTech', 'HealthTech', 'BioTech', 'FemTech', 'PsyTech', 'SexTech', 'AgeTech',
      // Образование и кадры
      'EdTech', 'HRTech', 'JobTech', 'WorkTech',
      // Торговля и маркетинг
      'E-com', 'RetailTech', 'MarTech', 'AdTech', 'SalesTech',
      // Недвижимость и строительство
      'PropTech', 'ConTech', 'CRETech',
      // Экология, еда и ресурсы
      'AgriTech', 'FoodTech', 'CleanTech', 'GreenTech', 'ClimateTech', 'EnergyTech',
      // Государство и безопасность
      'GovTech', 'CivicTech', 'MilTech', 'PoliceTech', 'SpaceTech',
      // Транспорт и логистика
      'AutoTech', 'MobilityTech', 'LogisTech', 'TravelTech', 'AeroTech',
      // Стиль жизни и культура
      'FashionTech', 'BeautyTech', 'SportTech', 'ArtTech', 'GameTech',
      // Общие понятия
      'DeepTech', 'HighTech', 'HardTech', 'LowTech',
      // Дополнительные категории
      'CloudTech', 'DataTech', 'AI', 'CyberSecurity', 'Other',
    ])
    .describe('The specific Tech industry category that best fits the company'),
  subIndustry: z.string().optional().describe('More specific detail about the industry'),
  techStack: z.array(z.string()).describe('List of technologies, frameworks, databases, cloud platforms used'),
  isStartup: z.boolean().describe('Whether the company is a startup (true) or established company (false)'),
  summary: z.string().describe("A brief summary of the company's technical focus"),
  confidence: z.number().min(0).max(1).describe('Confidence score of the analysis (0-1)'),
});

type AnalysisResult = z.infer<typeof AnalysisSchema>;

const CLASSIFIER_PROMPT = ChatPromptTemplate.fromTemplate(`
You are an expert NLP analyzer for technical content and company classification.
Your goal is to analyze the provided text and extract structured information.

Specific Focus:
1. **Industry Classification**: Select ONE most relevant Tech category from this comprehensive list:
   - Finance/Business: FinTech, InsurTech, RegTech, WealthTech, PayTech, LegalTech, TaxTech
   - Health/Bio: MedTech, HealthTech, BioTech, FemTech, PsyTech, SexTech, AgeTech
   - Education/HR: EdTech, HRTech, JobTech, WorkTech
   - Commerce/Marketing: E-com, RetailTech, MarTech, AdTech, SalesTech
   - Real Estate/Construction: PropTech, ConTech, CRETech
   - Ecology/Food/Resources: AgriTech, FoodTech, CleanTech, GreenTech, ClimateTech, EnergyTech
   - Government/Security: GovTech, CivicTech, MilTech, PoliceTech, SpaceTech
   - Transport/Logistics: AutoTech, MobilityTech, LogisTech, TravelTech, AeroTech
   - Lifestyle/Culture: FashionTech, BeautyTech, SportTech, ArtTech, GameTech
   - General: DeepTech, HighTech, HardTech, LowTech, CloudTech, DataTech, AI, CyberSecurity, Other
   
   Choose the SINGLE category that best describes the company's core business.

2. **Company Name**: Identify the main company name.
3. **Tech Stack**: Extract programming languages, frameworks, databases, cloud services, and infrastructure tools.
4. **Startup Detection**: Determine if the company is a startup (true) or established company (false). 
   - Startups: typically young, growing, focused on innovation, may mention funding rounds, venture capital, or rapid scaling.
   - Established: mature, well-known brands, large infrastructure, wide market presence, long operating history.

Text to analyze:
"{text}"
`);

export class IndustryClassifierAgent extends SimpleAgent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private runnable: any;

  constructor() {
    super('IndustryClassifier');
    
    // Используем модель из централизованной конфигурации
    // withStructuredOutput гарантирует валидный JSON по Zod-схеме
    this.runnable = CLASSIFIER_PROMPT.pipe(
      MODELS.main.withStructuredOutput(AnalysisSchema as any)
    );
  }

  /**
   * Классифицирует компанию по индустрии на основе собранных данных
   * 
   * @param company - информация о компании
   * @param collectedData - собранные данные из DataCollector
   * @returns IndustryClassifierResult - результат классификации
   */
  async classify(company: Company, collectedData: DataCollectorResult): Promise<IndustryClassifierResult> {
    return this.execute(async () => {
      this.log(`Classifying company: ${company.name}`);

      // Формируем текст для анализа из всех доступных данных
      const analysisText = this.buildAnalysisText(company, collectedData);
      
      // Вызываем NLP-классификацию с Zod-валидацией
      const nlpResult = await this.runnable.invoke({ text: analysisText });
      
      this.log(`NLP classification complete`, {
        industry: nlpResult.industry,
        isStartup: nlpResult.isStartup,
        confidence: nlpResult.confidence,
      });

      // Маппим детальный NLP-результат в упрощенный формат IndustryClassifierResult
      const result = this.mapToClassifierResult(nlpResult);
      
      return result;
    });
  }

  /**
   * Формирует текст для NLP-анализа из всех доступных источников данных
   */
  private buildAnalysisText(company: Company, data: DataCollectorResult): string {
    const parts: string[] = [];

    // Описание компании
    if (company.description) {
      parts.push(`Company Description: ${company.description}`);
    }

    // Tech stack
    if (company.techStack && company.techStack.length > 0) {
      parts.push(`Tech Stack: ${company.techStack.join(', ')}`);
    }

    // HH вакансии
    if (data.hhData) {
      parts.push(`\nJob Vacancies (${data.hhData.totalVacancies} total):`);
      data.hhData.vacancies.slice(0, 5).forEach((v) => {
        parts.push(`- ${v.title}: ${v.skills.join(', ')}`);
      });
      if (data.hhData.requiredSkills.length > 0) {
        parts.push(`Required Skills: ${data.hhData.requiredSkills.join(', ')}`);
      }
    }

    // GitHub активность
    if (data.githubData) {
      parts.push(`\nGitHub Activity:`);
      parts.push(`- Repositories: ${data.githubData.totalRepos}`);
      parts.push(`- Languages: ${data.githubData.languages.join(', ')}`);
      parts.push(`- Recent commits: ${data.githubData.activity}`);
    }

    // Habr статьи
    if (data.habrData && data.habrData.articles.length > 0) {
      parts.push(`\nHabr Articles:`);
      data.habrData.articles.slice(0, 3).forEach((a) => {
        parts.push(`- ${a.title}`);
      });
      if (data.habrData.topics.length > 0) {
        parts.push(`Topics: ${data.habrData.topics.join(', ')}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Маппит детальный NLP-результат в упрощенный формат IndustryClassifierResult
   */
  private mapToClassifierResult(nlpResult: AnalysisResult): IndustryClassifierResult {
    // Определяем stage на основе isStartup и других факторов
    const stage = this.determineStage(nlpResult);

    // Вторичные индустрии из subIndustry
    const secondaryIndustries = nlpResult.subIndustry 
      ? [nlpResult.subIndustry] 
      : [];

    return {
      primaryIndustry: nlpResult.industry,
      secondaryIndustries,
      confidence: Math.round(nlpResult.confidence * 100), // 0-1 -> 0-100
      stage,
    };
  }

  /**
   * Определяет стадию развития компании
   */
  private determineStage(nlpResult: AnalysisResult): 'idea' | 'pre-seed' | 'seed' | 'growth' | 'mature' {
    if (!nlpResult.isStartup) {
      return 'mature';
    }

    // Эвристика на основе summary и confidence
    const summary = nlpResult.summary.toLowerCase();
    
    if (summary.includes('mvp') || summary.includes('prototype')) {
      return 'pre-seed';
    }
    
    if (summary.includes('scaling') || summary.includes('growth') || summary.includes('expanding')) {
      return 'growth';
    }
    
    // По умолчанию для стартапов
    return 'seed';
  }
}

export const industryClassifierAgent = new IndustryClassifierAgent();

