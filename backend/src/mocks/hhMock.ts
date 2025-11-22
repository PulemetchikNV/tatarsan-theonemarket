import type { HHData, Vacancy } from '../core/types/index.js';

/**
 * Mock API для HH.ru
 * Возвращает моковые данные о вакансиях компании
 */

// База вакансий для разных компаний
const vacanciesDB: Record<string, Vacancy[]> = {
  'Таттелеком': [
    {
      title: 'Senior Backend Developer',
      salary: '200,000 - 300,000 руб',
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Kubernetes'],
      experience: '3-6 лет',
      publishedAt: new Date('2024-11-15').toISOString(),
    },
    {
      title: 'DevOps Engineer',
      salary: '180,000 - 250,000 руб',
      skills: ['Docker', 'Kubernetes', 'GitLab CI', 'Ansible', 'Terraform'],
      experience: '2-5 лет',
      publishedAt: new Date('2024-11-18').toISOString(),
    },
    {
      title: 'Frontend Developer',
      salary: '150,000 - 220,000 руб',
      skills: ['React', 'TypeScript', 'Redux', 'Next.js'],
      experience: '2-4 года',
      publishedAt: new Date('2024-11-20').toISOString(),
    },
  ],
  'Иннополис': [
    {
      title: 'Python Developer',
      salary: '180,000 - 280,000 руб',
      skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
      experience: '3-5 лет',
      publishedAt: new Date('2024-11-10').toISOString(),
    },
    {
      title: 'Machine Learning Engineer',
      salary: '220,000 - 320,000 руб',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'MLflow'],
      experience: '3-6 лет',
      publishedAt: new Date('2024-11-12').toISOString(),
    },
    {
      title: 'React Developer',
      salary: '160,000 - 240,000 руб',
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
      experience: '2-4 года',
      publishedAt: new Date('2024-11-19').toISOString(),
    },
  ],
  'default': [
    {
      title: 'Full Stack Developer',
      salary: '150,000 - 250,000 руб',
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      experience: '2-5 лет',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Backend Developer',
      salary: '180,000 - 280,000 руб',
      skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis'],
      experience: '3-6 лет',
      publishedAt: new Date().toISOString(),
    },
  ],
};

/**
 * Получить вакансии компании с HH.ru (mock)
 */
export async function fetchHHVacancies(companyName: string): Promise<HHData> {
  // Имитируем задержку API
  await new Promise(resolve => setTimeout(resolve, 300));

  const vacancies = vacanciesDB[companyName] || vacanciesDB['default'];
  
  // Собираем все навыки
  const allSkills = vacancies.flatMap(v => v.skills);
  const uniqueSkills = Array.from(new Set(allSkills));
  
  // Вычисляем среднюю зарплату
  const salaries = vacancies
    .map(v => v.salary)
    .filter((s): s is string => !!s)
    .map(s => {
      const match = s.match(/(\d+)\s*(?:000|,000)/g);
      if (match) {
        const nums = match.map(m => parseInt(m.replace(/[,\s]/g, '')));
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      }
      return 0;
    });
  
  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
    : undefined;

  return {
    vacancies,
    totalVacancies: vacancies.length + Math.floor(Math.random() * 10), // +random для реалистичности
    avgSalary,
    requiredSkills: uniqueSkills,
  };
}

/**
 * Поиск вакансий по навыку (mock)
 */
export async function searchVacanciesBySkill(skill: string): Promise<Vacancy[]> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const allVacancies = Object.values(vacanciesDB).flat();
  const skillLower = skill.toLowerCase();
  
  return allVacancies.filter(v => 
    v.skills.some(s => s.toLowerCase().includes(skillLower)) ||
    v.title.toLowerCase().includes(skillLower)
  );
}

