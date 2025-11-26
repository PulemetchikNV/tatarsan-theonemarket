/**
 * ЖЕЛЕЗНЫЕ КОНТРАКТЫ для Orchestrator Tools
 * 
 * Эти типы определяют четкие интерфейсы взаимодействия между агентами.
 * Все агенты должны следовать этим контрактам.
 */

import type {
  DataCollectorResult,
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
  message: string;
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
 * ФАЗА 2: Отслеживание событий
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
  reportData?: string;
  data?: CompanyAnalysisResult;
  format?: string;
  error?: string;
  executionTime: number;
}

/**
 * Контекст выполнения для всего процесса
 * Накапливает результаты всех фаз
 */
export interface ExecutionContext {
  companyName: string;
  dataCollection?: DataCollectorResult;
  classification?: IndustryClassifierResult;
  marketResearch?: MarketResearcherResult;
  eventTracking?: EventTrackerResult;
  startTime: number;
}
