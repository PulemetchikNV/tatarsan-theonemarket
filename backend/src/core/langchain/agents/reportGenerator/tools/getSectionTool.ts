import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует HTML секцию
 */
export const getSectionTool = tool(
  async ({ title, content, level }) => {
    const headingLevel = level || 2;
    
    return `
<section style="margin-bottom: 2rem;">
  <h${headingLevel} style="font-size: ${headingLevel === 1 ? '1.875rem' : '1.5rem'}; font-weight: 700; color: #111827; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb;">${title}</h${headingLevel}>
  <div style="color: #4b5563; line-height: 1.6;">
    ${content}
  </div>
</section>`.trim();
  },
  {
    name: 'get_section',
    description: `Генерирует HTML секцию с заголовком.

Используй для:
- Executive Summary
- Разделов отчета
- Группировки контента

Параметры:
- title: заголовок секции
- content: HTML содержимое секции
- level: уровень заголовка (1-3, по умолчанию 2)

Возвращает: HTML код секции`,
    schema: z.object({
      title: z.string().describe('Заголовок секции'),
      content: z.string().describe('HTML содержимое секции'),
      level: z.number().optional().describe('Уровень заголовка (1-3)'),
    }),
  }
);

