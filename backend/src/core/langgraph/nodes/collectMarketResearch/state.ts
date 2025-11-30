import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { UserRole } from '../../../const';
import { DataAnnotation } from '../../state';

/**
 * State для subgraph collectMarketResearch
 * 
 * Включает:
 * - messages (из MessagesAnnotation) — для tool calling loop
 * - role, marketResearchData — наши кастомные поля
 */
export const MarketResearchGraphState = Annotation.Root({
    // Добавляем messages из MessagesAnnotation (нужно для tool calling)
    ...MessagesAnnotation.spec,
    
    // Наши поля
    role: Annotation<UserRole>,
    marketResearchData: DataAnnotation,
})

