import { z } from 'zod';
import { tool } from 'langchain';
import { createModuleLogger } from '../../../../utils/logger.js';

const logger = createModuleLogger('calculateHealthScoreTool');

// Константы для формулы (R-часть и показатели Москвы для сравнения)
// В реальном проекте их можно вынести в конфиг или БД
const CONSTANTS = {
  MOSCOW: {
    VACANCIES: 15000, // Примерное кол-во активных IT вакансий
    POPULATION: 13_000_000,
    AVG_SALARY: 220_000,
    LIVING_WAGE: 25_000,
    TECH_RATIO: 0.65, // Modern stack / Total
    GRADE_RATIO: 3.5, // (Mid+Sen)/Jun (Зрелость рынка)
  },
  TATARSTAN: {
    POPULATION: 4_000_000,
    LIVING_WAGE: 14_000,
    // R-показатели (Статические рейтинги)
    R1_RATIO: 0.75, // Росстат РТ / МСК
    R2_RATIO: 0.80, // РЦТ Рейтинг
    R3_RATIO: 0.70, // RRMAG
    R4_RATIO: 0.85, // ВШЭ
  }
};

/**
 * Тул для расчета индекса IT-здоровья региона.
 * Использует формулу:
 * ИЦЗР = 0.60 * R_PART + 0.40 * D_PART
 */
export const calculateHealthScoreTool = tool(
  async (input) => {
    logger.info('Calculating IT Health Score', input);
    
    try {
      // 1. R-часть (Ресурсная база / Фундаментальные показатели) - Вес 0.60
      // Базируется на статических рейтингах
      const R_part = 0.20 * CONSTANTS.TATARSTAN.R1_RATIO + 
                     0.30 * CONSTANTS.TATARSTAN.R2_RATIO + 
                     0.30 * CONSTANTS.TATARSTAN.R3_RATIO + 
                     0.20 * CONSTANTS.TATARSTAN.R4_RATIO;

      // 2. D-часть (Динамика рынка / Текущая активность) - Вес 0.40
      // Сравниваем входящие данные региона с эталонными показателями (Москва)
      
      // D1: Плотность вакансий (Вакансий на душу населения)
      // Чем выше плотность по сравнению с Москвой, тем лучше
      const densityRT = input.rt_vacancies / CONSTANTS.TATARSTAN.POPULATION;
      const densityMSK = CONSTANTS.MOSCOW.VACANCIES / CONSTANTS.MOSCOW.POPULATION;
      // Ограничиваем коэффициент (cap) на уровне 1.5 (чтобы аномалии не ломали формулу)
      const D1 = Math.min((densityRT / densityMSK), 1.5); 

      // D2: Покупательная способность (Зарплата / Прож.мин)
      const powerRT = input.rt_avg_salary / CONSTANTS.TATARSTAN.LIVING_WAGE;
      const powerMSK = CONSTANTS.MOSCOW.AVG_SALARY / CONSTANTS.MOSCOW.LIVING_WAGE;
      const D2 = Math.min((powerRT / powerMSK), 1.5);

      // D3: Технологичность (Доля современного стека)
      // Если доля modern stack выше чем в Москве (0.65) - отлично
      const D3 = Math.min((input.rt_modern_stack_share / CONSTANTS.MOSCOW.TECH_RATIO), 1.5);

      // D4: Зрелость рынка (Соотношение (Mid+Sen)/Jun)
      // Слишком много джунов = незрелый рынок. Слишком мало джунов = стагнация.
      // Мы сравниваем с "золотым стандартом" Москвы.
      const safeJuniors = Math.max(input.rt_junior_vacancies, 1); // Защита от деления на 0
      const maturityRT = (input.rt_middle_vacancies + input.rt_senior_vacancies) / safeJuniors;
      const D4 = Math.min((maturityRT / CONSTANTS.MOSCOW.GRADE_RATIO), 1.5);

      const D_part = 0.30 * D1 + 0.30 * D2 + 0.20 * D3 + 0.20 * D4;

      // 3. Итоговая формула
      // Нормируем к 100 баллам
      const totalScoreRaw = (0.60 * R_part + 0.40 * D_part) * 100;
      // Округляем и держим в границах 0-100
      const totalScore = Math.round(Math.min(Math.max(totalScoreRaw, 0), 100));

      const result = {
        total_score: totalScore,
        details: {
          R_score_weighted: Math.round(0.60 * R_part * 100),
          D_score_weighted: Math.round(0.40 * D_part * 100),
          components_d: {
            density_ratio: Number(D1.toFixed(2)),
            salary_power_ratio: Number(D2.toFixed(2)),
            tech_modernity_ratio: Number(D3.toFixed(2)),
            market_maturity_ratio: Number(D4.toFixed(2))
          }
        },
        verdict: totalScore >= 80 ? "Excellent IT Hub" : totalScore >= 60 ? "Developing Hub" : "Emerging Market"
      };

      return JSON.stringify(result);

    } catch (error) {
      logger.error({ err: error }, 'Failed to calculate score');
      return JSON.stringify({ error: "Calculation failed", details: String(error) });
    }
  },
  {
    name: "calculate_it_health_score",
    description: "Calculates integral IT Health Score (0-100) for the region based on market metrics (vacancies, salaries, grades).",
    schema: z.object({
      rt_vacancies: z.number().describe("Total active IT vacancies in region"),
      rt_avg_salary: z.number().describe("Average IT salary in region (RUB)"),
      rt_modern_stack_share: z.number().describe("Share of modern tech stack (0.0 to 1.0). Estimate based on keywords (Go/Node/Python vs 1C/Legacy). Default: 0.5"),
      rt_junior_vacancies: z.number().describe("Count of Junior vacancies"),
      rt_middle_vacancies: z.number().describe("Count of Middle vacancies"),
      rt_senior_vacancies: z.number().describe("Count of Senior vacancies"),
    }),
  }
);

