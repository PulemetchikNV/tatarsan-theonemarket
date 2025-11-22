// ========== Company Types ==========

export interface Company {
  name: string;
  description?: string;
  industry?: string;
  location?: string;
  techStack?: string[];
  size?: string;
  foundedYear?: number;
  website?: string;
}

// ========== Analysis Results ==========

export interface CompanyAnalysisResult {
  company: Company;
  dataCollector: DataCollectorResult;
  industryClassifier: IndustryClassifierResult;
  marketResearcher: MarketResearcherResult;
  eventTracker: EventTrackerResult;
  healthScore: number; // 0-100
  recommendation: 'invest' | 'watch' | 'avoid';
  reasoning: string;
  timestamp: string;
}

export interface DataCollectorResult {
  hhData?: HHData;
  githubData?: GitHubData;
  habrData?: HabrData;
  linkedinData?: LinkedInData;
  collectedAt: string;
}

export interface HHData {
  vacancies: Vacancy[];
  totalVacancies: number;
  avgSalary?: number;
  requiredSkills: string[];
}

export interface Vacancy {
  title: string;
  salary?: string;
  skills: string[];
  experience?: string;
  publishedAt?: string;
}

export interface GitHubData {
  repositories: Repository[];
  totalRepos: number;
  totalCommits: number;
  languages: string[];
  activity: number; // commits last 30 days
}

export interface Repository {
  name: string;
  stars: number;
  forks: number;
  language?: string;
  lastCommit?: string;
}

export interface HabrData {
  articles: Article[];
  totalArticles: number;
  topics: string[];
}

export interface Article {
  title: string;
  url: string;
  publishedAt: string;
  tags: string[];
}

export interface LinkedInData {
  employeeCount?: number;
  followers?: number;
  recentPosts: number;
}

export interface IndustryClassifierResult {
  primaryIndustry: string; // fintech, AI, gaming, etc
  secondaryIndustries: string[];
  confidence: number; // 0-100
  stage: 'idea' | 'pre-seed' | 'seed' | 'growth' | 'mature';
}

export interface MarketResearcherResult {
  marketTrends: string[];
  demandForTech: Record<string, number>; // tech -> demand score
  competitorAnalysis: string;
  growthPotential: number; // 0-100
}

export interface EventTrackerResult {
  recentEvents: Event[];
  upcomingEvents: Event[];
  investmentRounds: InvestmentRound[];
  newsCount: number;
}

export interface Event {
  type: 'conference' | 'hackathon' | 'meetup' | 'launch' | 'investment';
  title: string;
  date: string;
  description?: string;
}

export interface InvestmentRound {
  type: 'pre-seed' | 'seed' | 'series-a' | 'series-b';
  amount?: string;
  date: string;
  investors?: string[];
}

// ========== Dashboard Types ==========

export interface DashboardData {
  overview: Overview;
  topCompanies: CompanySummary[];
  techTrends: TechTrend[];
  salaryStats: SalaryStats;
  activityIndex: number; // 0-100
}

export interface Overview {
  totalCompanies: number;
  totalVacancies: number;
  avgSalary: number;
  topTechnologies: string[];
  growthRate: number; // percentage
}

export interface CompanySummary {
  name: string;
  industry: string;
  healthScore: number;
  techStack: string[];
  vacancyCount: number;
}

export interface TechTrend {
  technology: string;
  demand: number;
  growth: number; // percentage change
  avgSalary: number;
}

export interface SalaryStats {
  byTech: Record<string, number>;
  byExperience: {
    junior: number;
    middle: number;
    senior: number;
  };
  trend: 'rising' | 'stable' | 'falling';
}

// ========== API Request/Response Types ==========

export interface AnalyzeCompanyRequest {
  companyName: string;
  deepAnalysis?: boolean; // full analysis with all agents
}

export interface AnalyzeCompanyResponse {
  success: boolean;
  data?: CompanyAnalysisResult;
  error?: string;
}

export interface GetDashboardResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
}

// ========== Agent Communication Types ==========

export interface AgentTask {
  type: 'collect' | 'analyze' | 'classify' | 'research' | 'track' | 'alert' | 'report';
  payload: any;
}

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
}


