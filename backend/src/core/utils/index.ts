export * from './logger';

/**
 * Извлекает JSON из текста, обернутого в markdown code block
 * Или возвращает сам текст, если он уже является валидным JSON
 */
export function extractJson(text: string): string | null {
  const startMarker = '```json';
  const endMarker = '```';

  const startIndex = text.indexOf(startMarker);

  // Если начальный маркер не найден, проверяем является ли текст валидным JSON
  if (startIndex === -1) {
    try {
      JSON.parse(text);
      return text;
    } catch {
      return null;
    }
  }

  // Ищем конечный маркер ПОСЛЕ начального
  const endIndex = text.lastIndexOf(endMarker);

  // Убедимся, что конечный маркер находится после начального
  if (endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  // Вырезаем строку между маркерами
  const jsonString = text.substring(startIndex + startMarker.length, endIndex);

  return jsonString.trim();
}
