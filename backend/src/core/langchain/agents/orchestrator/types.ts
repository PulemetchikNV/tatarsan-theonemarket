/**
 * ЖЕЛЕЗНЫЕ КОНТРАКТЫ для Orchestrator Tools
 * 
 * Эти типы определяют четкие интерфейсы взаимодействия между агентами.
 * Все агенты должны следовать этим контрактам.
 */

import type {
  DataCollectorResult,
  AnalyzerResult,
  IndustryClassifierResult,
  MarketResearcherResult,
  EventTrackerResult,
  CompanyAnalysisResult,
} from '../../../types/index.js';

/**
 * ФАЗА 1: Сбор данных
 */
export interface DataCollectionOutput {
  success: boolean;
  data?: DataCollectorResult;
  error?: string;
  executionTime: number;
}

/**
 * ФАЗА 2: Анализ данных
 */
export interface AnalysisOutput {
  success: boolean;
  data?: AnalyzerResult;
  error?: string;
  executionTime: number;
}

/**
 * ФАЗА 2: Классификация индустрии
 */
export interface ClassificationOutput {
  success: boolean;
  data?: IndustryClassifierResult;
  error?: string;
  executionTime: number;
}

/**
 * ФАЗА 2: Рыночное исследование
 */
export interface MarketResearchOutput {
  success: boolean;
  data?: MarketResearcherResult;
  error?: string;
  executionTime: number;
}

/**
 * ФАЗА 2: Трекинг событий
 */
export interface EventTrackingOutput {
  success: boolean;
  data?: EventTrackerResult;
  error?: string;
  executionTime: number;
}

/**
 * ФАЗА 3: Генерация отчета
 */
export interface ReportGenerationOutput {
  success: boolean;
  reportData?: string; // JSON или HTML
  format: 'json' | 'html';
  error?: string;
  executionTime: number;
}

/**
 * ФАЗА 3: Генерация алертов
 */
export interface AlertGenerationOutput {
  success: boolean;
  alerts?: Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
    category: string;
  }>;
  error?: string;
  executionTime: number;
}

/**
 * ФИНАЛЬНАЯ ОЦЕНКА
 */
export interface FinalDecisionOutput {
  success: boolean;
  healthScore?: number;
  recommendation?: 'invest' | 'watch' | 'avoid';
  reasoning?: string;
  error?: string;
  executionTime: number;
}

/**
 * Контекст выполнения для передачи между фазами
 */
export interface ExecutionContext {
  companyName: string;
  dataCollection?: DataCollectorResult;
  analysis?: AnalyzerResult;
  classification?: IndustryClassifierResult;
  marketResearch?: MarketResearcherResult;
  eventTracking?: EventTrackerResult;
  startTime: number;
}

