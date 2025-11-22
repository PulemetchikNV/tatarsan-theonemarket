import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует финальную рекомендацию
 * Использует единую систему CSS из frontend/src/style.css
 */
export const getRecommendationTool = tool(
  async ({ type, reasoning }) => {
    const icons: Record<string, string> = {
      invest: '✅',
      watch: '👀',
      avoid: '❌',
    };

    const labels: Record<string, string> = {
      invest: 'ИНВЕСТИРОВАТЬ',
      watch: 'НАБЛЮДАТЬ',
      avoid: 'ИЗБЕГАТЬ',
    };

    return `
<div class="recommendation ${type}">
  <h2 class="recommendation-title">🎯 Финальная рекомендация</h2>
  <div class="recommendation-badge ${type}">
    ${icons[type]} ${labels[type]}
  </div>
  <div class="recommendation-content">
    <strong>Обоснование:</strong> ${reasoning}
  </div>
</div>`.trim();
  },
  {
    name: 'get_recommendation',
    description: `Генерирует финальную рекомендацию для инвестора.

Используй для:
- Финального вердикта по компании

Параметры:
- type: тип рекомендации ('invest', 'watch', 'avoid')
- reasoning: обоснование решения (текст)

Типы:
- 'invest' - компания рекомендуется к инвестициям (зеленый)
- 'watch' - компания требует наблюдения (желтый)
- 'avoid' - компанию следует избегать (красный)

Возвращает: HTML код рекомендации с CSS классами`,
    schema: z.object({
      type: z.enum(['invest', 'watch', 'avoid']).describe('Тип рекомендации'),
      reasoning: z.string().describe('Обоснование решения'),
    }),
  }
);

