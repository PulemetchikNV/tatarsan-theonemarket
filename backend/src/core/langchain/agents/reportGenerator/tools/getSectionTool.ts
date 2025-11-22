import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует HTML секцию
 * Использует единую систему CSS из frontend/src/style.css
 */
export const getSectionTool = tool(
  async ({ title, content }) => {
    return `
<div class="section">
  <h2 class="section-title">${title}</h2>
  <div class="section-content">
    ${content}
  </div>
</div>`.trim();
  },
  {
    name: 'get_section',
    description: `Генерирует HTML секцию с заголовком и контентом.

Используй для:
- Executive Summary
- Разделов отчета
- Группировки контента

Параметры:
- title: заголовок секции
- content: HTML содержимое секции (может включать <p>, <ul>, другие элементы)

Возвращает: HTML код секции с CSS классами`,
    schema: z.object({
      title: z.string().describe('Заголовок секции'),
      content: z.string().describe('HTML содержимое секции'),
    }),
  }
);
