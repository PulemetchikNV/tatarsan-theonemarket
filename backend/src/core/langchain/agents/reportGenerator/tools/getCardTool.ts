import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует HTML карточку
 */
export const getCardTool = tool(
  async ({ title, value, subtitle, color }) => {
    return `
<div class="card" style="border-left: 4px solid ${color || '#3b82f6'}; padding: 1.5rem; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
  <div style="font-size: 0.875rem; color: #6b7280; font-weight: 500; margin-bottom: 0.5rem;">${title}</div>
  <div style="font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 0.25rem;">${value}</div>
  ${subtitle ? `<div style="font-size: 0.875rem; color: #9ca3af;">${subtitle}</div>` : ''}
</div>`.trim();
  },
  {
    name: 'get_card',
    description: `Генерирует HTML карточку для отображения метрики.

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
- color: цвет левой границы (hex, по умолчанию синий)

Возвращает: HTML код карточки`,
    schema: z.object({
      title: z.string().describe('Заголовок карточки'),
      value: z.string().describe('Значение для отображения'),
      subtitle: z.string().optional().describe('Подзаголовок (опционально)'),
      color: z.string().optional().describe('Цвет границы (hex)'),
    }),
  }
);

