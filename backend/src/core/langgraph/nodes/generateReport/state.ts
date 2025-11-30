import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { UserRole } from '../../../const';
import { IndustryAnalysis } from '../../types';

/**
 * State для subgraph generateReport
 * 
 * Принимает ВСЕ данные из предыдущих шагов:
 * - collectedData, marketResearchData — сырые данные
 * - analysis — результат классификации
 * - healthScore — числовой скор
 * 
 * Возвращает HTML report
 */
export const GenerateReportGraphState = Annotation.Root({
    // Добавляем messages из MessagesAnnotation (нужно для tool calling)
    ...MessagesAnnotation.spec,
    
    // Input данные
    role: Annotation<UserRole>,
    region: Annotation<string>,
    collectedData: Annotation<Record<string, any>>,
    marketResearchData: Annotation<Record<string, any>>,
    analysis: Annotation<IndustryAnalysis | undefined>,
    healthScore: Annotation<number | undefined>,
    
    // Output
    report: Annotation<string | undefined>,
})

