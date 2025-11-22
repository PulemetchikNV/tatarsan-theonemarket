/**
 * Mock для data-api (PHP сервис)
 * Соответствует контрактам из data-api/api.http
 * 
 * Base URL: http://localhost:8100/api
 */

// GET /api/roles
export interface Role {
  id: string;
  name: string;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  total: number;
}

// GET /api/vacancies/stats/daily
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

// GET /api/employers
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

// GET /api/employers/{id}
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

export interface EmployerDetail {
  id: number;
  name: string;
  description: string;
  source: string;
  source_id: string;
  vacancies_count: number;
  vacancies: Vacancy[];
  created_at: string;
  updated_at: string;
}

export interface EmployerDetailResponse {
  success: boolean;
  data: EmployerDetail;
}

/**
 * Mock: GET /api/roles
 */
export function getRoles(): RolesResponse {
  return {
    success: true,
    data: [
      { id: '96', name: 'Developer' },
      { id: '124', name: 'QA Engineer' },
      { id: '160', name: 'DevOps' },
      { id: '165', name: 'Data Scientist' },
      { id: '10', name: 'Analyst' },
      { id: '73', name: 'Product Manager' },
      { id: '104', name: 'Designer' },
    ],
    total: 7,
  };
}

/**
 * Mock: GET /api/vacancies/stats/daily
 */
export function getVacancyStats(params?: { role?: string; days?: number }): VacancyStatsResponse {
  const days = params?.days || 30;
  const roleId = params?.role;
  
  // Генерируем статистику за N дней
  const data: VacancyStats[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Случайное количество вакансий (10-50)
    const count = Math.floor(Math.random() * 40) + 10;
    data.push({ date: dateStr, count });
  }
  
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days + 1);
  
  const roles = getRoles().data;
  const selectedRole = roleId ? roles.find(r => r.id === roleId) : null;
  
  return {
    success: true,
    data,
    filters: {
      role: selectedRole || null,
      days,
      start_date: startDate.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
    },
    total: data.length,
  };
}

/**
 * Mock: GET /api/employers
 */
export function getEmployers(params?: { page?: number; limit?: number; search?: string }): EmployersResponse {
  const page = params?.page || 1;
  const limit = Math.min(params?.limit || 20, 100);
  const search = params?.search?.toLowerCase();
  
  const allEmployers: Employer[] = [
    {
      id: 1,
      name: 'Иннополис',
      description: 'Университет Иннополис - центр инноваций и технологий',
      source: 'hh',
      source_id: 'innopolis',
      vacancies_count: 25,
      created_at: '2024-11-01 10:00:00',
      updated_at: '2024-11-22 12:00:00',
    },
    {
      id: 2,
      name: 'Таттелеком',
      description: 'Ведущий оператор связи Республики Татарстан',
      source: 'hh',
      source_id: 'tattelecom',
      vacancies_count: 18,
      created_at: '2024-11-01 10:00:00',
      updated_at: '2024-11-22 11:30:00',
    },
    {
      id: 3,
      name: 'Bars Group',
      description: 'Крупная IT-компания, разработка ПО для бизнеса',
      source: 'hh',
      source_id: 'bars-group',
      vacancies_count: 42,
      created_at: '2024-11-01 10:00:00',
      updated_at: '2024-11-22 14:15:00',
    },
    {
      id: 4,
      name: 'Сбербанк Технологии',
      description: 'Технологический центр Сбербанка',
      source: 'hh',
      source_id: 'sbertech',
      vacancies_count: 65,
      created_at: '2024-11-01 10:00:00',
      updated_at: '2024-11-22 13:45:00',
    },
    {
      id: 5,
      name: 'Kaspersky',
      description: 'Лаборатория Касперского - информационная безопасность',
      source: 'hh',
      source_id: 'kaspersky',
      vacancies_count: 31,
      created_at: '2024-11-01 10:00:00',
      updated_at: '2024-11-22 10:20:00',
    },
  ];
  
  // Фильтруем по поиску
  const filtered = search
    ? allEmployers.filter(e => e.name.toLowerCase().includes(search))
    : allEmployers;
  
  const total = filtered.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = filtered.slice(start, end);
  
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  };
}

/**
 * Mock: GET /api/employers/{id}
 */
export function getEmployerDetail(id: number): EmployerDetailResponse | null {
  const employers = getEmployers({ limit: 100 }).data;
  const employer = employers.find(e => e.id === id);
  
  if (!employer) {
    return null;
  }
  
  // Генерируем вакансии для работодателя
  const vacancies: Vacancy[] = [
    {
      id: id * 10 + 1,
      name: 'Senior Backend Developer',
      description: 'Разработка высоконагруженных систем',
      requirements: 'Java, Spring Boot, PostgreSQL, 5+ лет опыта',
      role: '96',
      role_name: 'Developer',
      salary_from: 200000,
      salary_to: 350000,
      salary_currency: 'RUR',
      published_at: '2024-11-20 10:00:00',
      parsed_at: '2024-11-20 10:05:00',
    },
    {
      id: id * 10 + 2,
      name: 'DevOps Engineer',
      description: 'Поддержка и развитие инфраструктуры',
      requirements: 'Kubernetes, Docker, CI/CD, 3+ года опыта',
      role: '160',
      role_name: 'DevOps',
      salary_from: 180000,
      salary_to: 280000,
      salary_currency: 'RUR',
      published_at: '2024-11-21 14:00:00',
      parsed_at: '2024-11-21 14:05:00',
    },
    {
      id: id * 10 + 3,
      name: 'Frontend Developer',
      description: 'Разработка современных веб-интерфейсов',
      requirements: 'React, TypeScript, 2+ года опыта',
      role: '96',
      role_name: 'Developer',
      salary_from: 150000,
      salary_to: 250000,
      salary_currency: 'RUR',
      published_at: '2024-11-22 09:00:00',
      parsed_at: '2024-11-22 09:05:00',
    },
  ];
  
  return {
    success: true,
    data: {
      ...employer,
      vacancies,
    },
  };
}

/**
 * Утилита: Агрегация данных для региона
 */
export function getRegionStats(region: string = 'Татарстан') {
  const employers = getEmployers({ limit: 100 }).data;
  const stats = getVacancyStats({ days: 30 });
  const roles = getRoles();
  
  const totalEmployers = employers.length;
  const totalVacancies = employers.reduce((sum, e) => sum + e.vacancies_count, 0);
  const avgVacanciesPerEmployer = Math.round(totalVacancies / totalEmployers);
  
  // Средняя зарплата (грубая оценка по топ компаниям)
  const avgSalary = 185000;
  
  return {
    region,
    totalEmployers,
    totalVacancies,
    avgVacanciesPerEmployer,
    avgSalary,
    topEmployers: employers.slice(0, 5),
    vacancyTrends: stats.data.slice(-7), // Последние 7 дней
    topRoles: roles.data.slice(0, 5),
  };
}

