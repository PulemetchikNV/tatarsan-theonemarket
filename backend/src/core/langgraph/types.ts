/**
 * Типы для LangGraph state
 */

// Sub-scores
export interface TalentAvailability {
    score: number;
    label: 'High' | 'Medium' | 'Low';
    insight: string;
}

export interface SalaryCompetitiveness {
    score: number;
    vs_moscow_percent: number;
    insight: string;
}

export interface MarketGrowth {
    score: number;
    yoy_change_percent: number;
    trend: 'growing' | 'stable' | 'declining';
}

export interface TechModernity {
    score: number;
    modern_stack_percent: number;
    dominant_technologies: string[];
}

export interface CompetitionIndex {
    junior: number;
    middle: number;
    senior: number;
    interpretation: string;
}

export interface SubScores {
    talent_availability: TalentAvailability;
    salary_competitiveness: SalaryCompetitiveness;
    market_growth: MarketGrowth;
    tech_modernity: TechModernity;
    competition_index: CompetitionIndex;
}

// Grade distribution
export interface GradeInfo {
    count: number;
    percent: number;
    avg_salary: number;
}

export interface GradeDistribution {
    junior: GradeInfo;
    middle: GradeInfo;
    senior: GradeInfo;
}

// Top demand roles
export interface TopDemandRole {
    role: string;
    vacancies: number;
    avg_salary: number;
    growth: 'high' | 'medium' | 'low';
}

// Market signals (SWOT)
export interface MarketSignals {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

// Benchmarks
export interface VsMoscowBenchmark {
    salary_ratio: number;
    vacancy_density_ratio: number;
    verdict: string;
}

export interface Benchmarks {
    vs_moscow: VsMoscowBenchmark;
}

// Recommendations
export interface Recommendation {
    for_role: 'hr' | 'investor' | 'tech_lead' | 'entrepreneur' | 'government' | 'researcher' | 'general';
    action: string;
    priority: 'high' | 'medium' | 'low';
}

// Metrics used for calculation
export interface MetricsUsed {
    total_vacancies: number;
    avg_salary: number;
    modern_tech_share: number;
    junior_vacancies: number;
    middle_vacancies: number;
    senior_vacancies: number;
}

/**
 * Полный результат анализа от IndustryClassifier
 */
export interface IndustryAnalysis {
    health_score: number;
    verdict: 'Excellent IT Hub' | 'Developing Hub' | 'Emerging Market';
    
    sub_scores: SubScores;
    grade_distribution: GradeDistribution;
    top_demand_roles: TopDemandRole[];
    market_signals: MarketSignals;
    benchmarks: Benchmarks;
    recommendations: Recommendation[];
    
    summary: string;
    metrics_used: MetricsUsed;
}

