import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует HTML график (Chart.js)
 */
export const getChartTool = tool(
  async ({ title, type, labelsJson, dataJson, color }) => {
    const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const labels = JSON.parse(labelsJson);
    const data = JSON.parse(dataJson);

    return `
<div style="margin-bottom: 2rem;">
  <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 1rem;">${title}</h3>
  <div style="position: relative; height: 300px; background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <canvas id="${chartId}"></canvas>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
  const ctx_${chartId} = document.getElementById('${chartId}').getContext('2d');
  new Chart(ctx_${chartId}, {
    type: '${type}',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: '${title}',
        data: ${JSON.stringify(data)},
        backgroundColor: '${color || 'rgba(59, 130, 246, 0.5)'}',
        borderColor: '${color || 'rgb(59, 130, 246)'}',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
</script>`.trim();
  },
  {
    name: 'get_chart',
    description: `Генерирует HTML график с Chart.js.

Используй для:
- Спроса на технологии (bar chart)
- Тренда зарплат (line chart)
- Распределения навыков (pie chart)

Параметры:
- title: заголовок графика
- type: тип ('bar', 'line', 'pie', 'doughnut')
- labelsJson: метки по оси X (JSON массив строк)
- dataJson: данные (JSON массив чисел)
- color: цвет графика (rgba/rgb/hex)

Пример:
- labelsJson: '["TypeScript", "Python", "React"]'
- dataJson: '[95, 92, 90]'

Возвращает: HTML + JS код графика`,
    schema: z.object({
      title: z.string().describe('Заголовок графика'),
      type: z.enum(['bar', 'line', 'pie', 'doughnut']).describe('Тип графика'),
      labelsJson: z.string().describe('JSON массив меток (строки)'),
      dataJson: z.string().describe('JSON массив данных (числа)'),
      color: z.string().optional().describe('Цвет графика (rgba/rgb/hex)'),
    }),
  }
);

