import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует HTML список
 */
export const getListTool = tool(
  async ({ title, items, type, icon }) => {
    const iconMap: Record<string, string> = {
      check: '✅',
      star: '⭐',
      warning: '⚠️',
      info: 'ℹ️',
      bullet: '•',
      arrow: '→',
      fire: '🔥',
      chart: '📊',
    };

    const listIcon = iconMap[icon || 'bullet'] || '•';
    const listItems = items.split('\n').filter(item => item.trim());

    return `
<div style="margin-bottom: 1.5rem;">
  <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 1rem;">${title}</h3>
  <ul style="list-style: none; padding: 0; margin: 0;">
    ${listItems.map(item => `
    <li style="display: flex; align-items: start; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
      <span style="margin-right: 0.75rem; flex-shrink: 0;">${listIcon}</span>
      <span style="color: #374151;">${item.trim()}</span>
    </li>
    `).join('')}
  </ul>
</div>`.trim();
  },
  {
    name: 'get_list',
    description: `Генерирует HTML список с элементами.

Используй для:
- Сильных сторон компании
- Слабых сторон
- Рыночных трендов
- Рекомендаций
- Ключевых инсайтов

Параметры:
- title: заголовок списка
- items: элементы списка (каждый с новой строки)
- type: тип списка ('bulleted' или 'numbered')
- icon: иконка (check, star, warning, info, bullet, arrow, fire, chart)

Возвращает: HTML код списка`,
    schema: z.object({
      title: z.string().describe('Заголовок списка'),
      items: z.string().describe('Элементы списка, каждый с новой строки'),
      type: z.enum(['bulleted', 'numbered']).optional().describe('Тип списка'),
      icon: z.string().optional().describe('Иконка для элементов (check/star/warning/info/bullet/arrow/fire/chart)'),
    }),
  }
);

