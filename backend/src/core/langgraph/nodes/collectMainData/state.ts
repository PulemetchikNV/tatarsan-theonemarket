import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { UserRole } from '../../../const';
import { DataAnnotation } from '../../state';

/**
 * State для subgraph collectMainData
 * 
 * Включает:
 * - messages (из MessagesAnnotation) — для tool calling loop
 * - role, collectedData — наши кастомные поля
 */
export const CollectDataGraphState = Annotation.Root({
    // Добавляем messages из MessagesAnnotation (нужно для tool calling)
    ...MessagesAnnotation.spec,
    
    // Наши поля
    role: Annotation<UserRole>,
    collectedData: DataAnnotation,
})
