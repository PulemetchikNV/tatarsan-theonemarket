/**
 * Типы данных для Market Researcher API
 * Соответствуют структуре ответа MetricsController::getMetrics
 */

// --- Quantitative Metrics ---
export interface CompetitionRatio {
  vacancies: number;
  resumes: number;
  ratio: number | null;
}

export interface QuantitativeMetrics {
  active_vacancies: number;
  resumes_count: number;
  competition_ratios: {
    junior: CompetitionRatio;
    middle: CompetitionRatio;
    senior: CompetitionRatio;
  };
}

// --- Salary Metrics ---
export interface SalaryRange {
  min: number | null;
  max: number | null;
  avg: number | null;
}

export interface SalaryMetrics {
  median_by_level: {
    junior: number | null;
    middle: number | null;
    senior: number | null;
  };
  gap_with_moscow: number | null; // Пока null в PHP
  ranges_by_specialization: Record<string, SalaryRange>; // key: specialization name (backend, frontend...)
  salary_specified_ratio: number; // Процент вакансий с зарплатой
}

// --- Structural Metrics ---
export interface SpecializationStats {
  count: number;
  percentage: number;
}

export interface StructuralMetrics {
  remote_ratio: number; // Доля удаленки (%)
  specialization_distribution: Record<string, SpecializationStats>;
  tech_companies_ratio: number; // Доля IT компаний (%)
  average_closing_time_days: number | null;
}

// --- Dynamics Metrics ---
export interface DynamicsMetrics {
  current_year: number;
  previous_year: number;
  current_count: number;
  previous_count: number;
  change_percent: number;
}

// --- Main Response ---
export interface MarketMetrics {
  quantitative: QuantitativeMetrics;
  salary: SalaryMetrics;
  structural: StructuralMetrics;
  dynamics: DynamicsMetrics;
}

export interface MetricsResponse {
  success: boolean;
  data: MarketMetrics;
  period: {
    start_date: string;
    end_date: string;
    region: string | null;
  };
  error?: string;
}

