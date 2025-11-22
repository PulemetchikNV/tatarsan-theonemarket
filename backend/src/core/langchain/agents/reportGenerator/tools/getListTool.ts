import { z } from 'zod';
import { tool } from '@langchain/core/tools';

/**
 * Tool: Генерирует HTML список
 * Использует единую систему CSS из frontend/src/style.css
 */
export const getListTool = tool(
  async ({ title, items, icon }) => {
    const iconMap: Record<string, string> = {
      check: '✅',
      star: '⭐',
      warning: '⚠️',
      info: 'ℹ️',
      bullet: '•',
      arrow: '→',
      fire: '🔥',
      chart: '📊',
      rocket: '🚀',
      target: '🎯',
      trophy: '🏆',
      gear: '⚙️',
    };

    const listIcon = iconMap[icon || 'bullet'] || '•';
    const listItems = items.split('\n').filter(item => item.trim());

    return `
<div class="section">
  <h3 class="section-subtitle">${title}</h3>
  <ul class="list">
    ${listItems.map(item => `
    <li class="list-item">
      <span class="list-icon">${listIcon}</span>
      <span class="list-content">${item.trim()}</span>
    </li>`).join('')}
  </ul>
</div>`.trim();
  },
  {
    name: 'get_list',
    description: `Генерирует HTML список с элементами.

Используй для:
- Сильных сторон компании (icon: 'check')
- Слабых сторон / рисков (icon: 'warning')
- Рыночных трендов (icon: 'chart')
- Рекомендаций (icon: 'target')
- Ключевых инсайтов (icon: 'star')

Параметры:
- title: заголовок списка
- items: элементы списка (каждый с новой строки)
- icon: иконка ('check', 'star', 'warning', 'info', 'bullet', 'arrow', 'fire', 'chart', 'rocket', 'target', 'trophy', 'gear')

Возвращает: HTML код списка с CSS классами`,
    schema: z.object({
      title: z.string().describe('Заголовок списка'),
      items: z.string().describe('Элементы списка, каждый с новой строки'),
      icon: z.string().optional().describe('Иконка для элементов'),
    }),
  }
);
