import { Annotation } from '@langchain/langgraph';
import { UserRole } from '../const';
import { IndustryAnalysis } from './types';

export const DataAnnotation = Annotation<Record<string, any>>({
    default: () => ({}),
    reducer: (prev: Record<string, any>, curr: Record<string, any>) => {
        return { ...prev, ...curr };
    },
})

export const GraphState = Annotation.Root({
    // Input
    role: Annotation<UserRole>,
    region: Annotation<string>,
    query: Annotation<string | undefined>,

    // Data collection results
    collectedData: DataAnnotation,
    marketResearchData: DataAnnotation,

    // Analysis results (typed!)
    analysis: Annotation<IndustryAnalysis | undefined>,
    healthScore: Annotation<number | undefined>,
    
    // Output
    report: Annotation<string | undefined>,
})
