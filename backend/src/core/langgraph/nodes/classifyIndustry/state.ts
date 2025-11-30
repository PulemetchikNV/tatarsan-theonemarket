import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { UserRole } from '../../../const';
import { IndustryAnalysis } from '../../types';

/**
 * State для subgraph classifyIndustry
 * 
 * Отличается от collectors:
 * - Получает УЖЕ собранные данные (collectedData, marketResearchData)
 * - Возвращает analysis (typed!) и healthScore
 */
export const ClassifyIndustryGraphState = Annotation.Root({
    // Добавляем messages из MessagesAnnotation (нужно для tool calling)
    ...MessagesAnnotation.spec,
    
    // Input данные (из предыдущих шагов)
    role: Annotation<UserRole>,
    collectedData: Annotation<Record<string, any>>,
    marketResearchData: Annotation<Record<string, any>>,
    
    // Output (typed!)
    analysis: Annotation<IndustryAnalysis | undefined>,
    healthScore: Annotation<number | undefined>,
})
