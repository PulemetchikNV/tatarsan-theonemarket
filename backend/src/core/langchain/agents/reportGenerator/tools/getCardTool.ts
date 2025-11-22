import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует HTML карточку
 * Использует единую систему CSS из frontend/src/style.css
 */
export const getCardTool = tool(
  async ({ title, value, subtitle, variant }) => {
    const variantClass = variant || 'primary';
    
    return `
<div class="card card-metric ${variantClass}">
  <div class="card-title">${title}</div>
  <div class="card-value">${value}</div>
  ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ''}
</div>`.trim();
  },
  {
    name: 'get_card',
    description: `Генерирует HTML карточку для метрики.

Используй для:
- Health Score
- Количества вакансий
- Средней зарплаты
- GitHub активности
- Любых числовых показателей

Параметры:
- title: заголовок карточки (например: "Health Score")
- value: значение (например: "85/100")
- subtitle: подзаголовок (опционально)
- variant: цветовая схема ('primary', 'success', 'warning', 'danger', 'info', 'purple')

Варианты:
- 'success' (зеленый) - для позитивных метрик
- 'warning' (желтый) - для нейтральных метрик
- 'danger' (красный) - для негативных метрик
- 'primary' (синий) - по умолчанию
- 'info' (голубой) - для информации
- 'purple' (фиолетовый) - для специальных метрик

Возвращает: HTML код карточки с CSS классами`,
    schema: z.object({
      title: z.string().describe('Заголовок карточки'),
      value: z.string().describe('Значение для отображения'),
      subtitle: z.string().optional().describe('Подзаголовок (опционально)'),
      variant: z.enum(['primary', 'success', 'warning', 'danger', 'info', 'purple']).optional().describe('Цветовая схема'),
    }),
  }
);
