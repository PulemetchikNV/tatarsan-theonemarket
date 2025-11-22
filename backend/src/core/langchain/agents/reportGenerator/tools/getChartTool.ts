import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует HTML график (CSS bar chart)
 * Использует единую систему CSS из frontend/src/style.css
 */
export const getChartTool = tool(
  async ({ title, labelsJson, dataJson, variant }) => {
    const labels = JSON.parse(labelsJson);
    const data = JSON.parse(dataJson);
    const variantClass = variant || 'primary';
    
    // Нормализуем данные к 0-100 если нужно
    const maxValue = Math.max(...data);
    const normalizedData = data.map((v: number) => 
      maxValue > 100 ? Math.round((v / maxValue) * 100) : v
    );

    return `
<div class="chart-container">
  <h3 class="chart-title">${title}</h3>
  <div class="bar-chart">
    ${labels.map((label: string, i: number) => `
    <div class="bar-item">
      <span class="bar-label">${label}</span>
      <div class="bar-track">
        <div class="bar-fill ${variantClass}" style="width: ${normalizedData[i]}%;">
          ${data[i]}${maxValue > 100 ? '' : '/100'}
        </div>
      </div>
    </div>`).join('')}
  </div>
</div>`.trim();
  },
  {
    name: 'get_chart',
    description: `Генерирует HTML bar chart для визуализации данных.

Используй для:
- Спроса на технологии (bar chart)
- Тренда метрик (line можно показать через bar)
- Распределения навыков

Параметры:
- title: заголовок графика
- labelsJson: метки (JSON массив строк)
- dataJson: данные (JSON массив чисел)
- variant: цвет баров ('primary', 'success', 'warning', 'info', 'purple')

Пример:
- labelsJson: '["TypeScript", "Python", "React"]'
- dataJson: '[95, 92, 90]'

Возвращает: HTML код графика с CSS классами`,
    schema: z.object({
      title: z.string().describe('Заголовок графика'),
      labelsJson: z.string().describe('JSON массив меток (строки)'),
      dataJson: z.string().describe('JSON массив данных (числа)'),
      variant: z.enum(['primary', 'success', 'warning', 'info', 'purple']).optional().describe('Цвет баров'),
    }),
  }
);
