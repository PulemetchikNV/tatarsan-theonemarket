import { z } from 'zod';
import { tool } from 'langchain';

/**
 * Tool: Генерирует grid-обёртку для группировки элементов
 * Использует единую систему CSS из frontend/src/style.css
 */
export const getGridTool = tool(
  async ({ columns, content }: { columns: string; content: string }) => {
    const gridClass = columns === 'auto' ? 'grid-auto' : `grid-${columns}`;
    
    return `
<div class="grid ${gridClass}">
${content}
</div>`.trim();
  },
  {
    name: 'get_grid',
    description: `Создаёт grid-контейнер для группировки карточек, графиков или списков в ряд.

ОБЯЗАТЕЛЬНО используй для:
- Группировки карточек метрик (3-4 в ряд)
- Размещения графиков рядом (2 в ряд)
- Размещения списков SWOT рядом (2 в ряд)

Параметры:
- columns: количество колонок ("2", "3", "4", "auto")
  - "2" = 2 элемента в ряд
  - "3" = 3 элемента в ряд  
  - "4" = 4 элемента в ряд
  - "auto" = автоматическая подгонка под ширину

- content: HTML содержимое (карточки, графики, списки)

Пример:
get_grid({
  columns: "4",
  content: "{card1}{card2}{card3}{card4}"
})

Возвращает: HTML grid-контейнер`,
    schema: z.object({
      columns: z.enum(['2', '3', '4', 'auto']).describe('Количество колонок'),
      content: z.string().describe('HTML содержимое для размещения в grid'),
    }),
  }
);

