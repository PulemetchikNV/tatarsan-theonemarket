/**
 * DTO (Data Transfer Objects) для API
 * Здесь живут только типы данных, которые возвращает API
 */

// --- Roles ---
export interface Role {
  id: string;
  name: string;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  total: number;
}

// --- Vacancy Stats ---
export interface VacancyStats {
  date: string;
  count: number;
}

export interface VacancyStatsResponse {
  success: boolean;
  data: VacancyStats[];
  filters: {
    role: { id: string; name: string } | null;
    days: number;
    start_date: string;
    end_date: string;
  };
  total: number;
}

// --- Employers ---
export interface Vacancy {
    id: number;
    name: string;
    description: string;
    requirements: string;
    role: string;
    role_name: string;
    salary_from: number | null;
    salary_to: number | null;
    salary_currency: string;
    published_at: string;
    parsed_at: string;
}

export interface Employer {
  id: number;
  name: string;
  description: string;
  source: string;
  source_id: string;
  vacancies_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmployerDetail extends Employer {
    vacancies: Vacancy[];
}

export interface EmployersResponse {
  success: boolean;
  data: Employer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EmployerDetailResponse {
    success: boolean;
    data: EmployerDetail;
}

// --- Aggregated Stats (DataCollector Specific) ---
export interface RegionStats {
    region: string;
    totalEmployers: number;
    totalVacancies: number;
    avgVacanciesPerEmployer: number;
    avgSalary: number;
    topEmployers: Employer[];
    vacancyTrends: VacancyStats[];
    topRoles: Role[];
}

