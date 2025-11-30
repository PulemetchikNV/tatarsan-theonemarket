import { ClassifyIndustryGraphState } from './state';
import { StateGraph, START, END } from '@langchain/langgraph';
import { calculateHealthScoreTool } from '../../../langchain/agents/industryClassifier/tools/calculateHealthScore';
import { CLASSIFIER_SYSTEM_PROMPT } from '../../../langchain/agents/industryClassifier/promps/index';
import { MODELS } from '../../../langchain/shared/models';
import { getLlmCall, shouldContinue, extractDataFromMessages } from '../../utils';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import { UserRole } from '../../../const';
import { IndustryAnalysis } from '../../types';

const llm = MODELS.main;
const tools = [calculateHealthScoreTool];
const llmWithTools = llm.bindTools(tools);
const llmCall = getLlmCall(llmWithTools, CLASSIFIER_SYSTEM_PROMPT);
const toolNode = new ToolNode(tools);

/**
 * Subgraph для классификации и расчёта Health Score
 * 
 * Отличие от collectors:
 * - Не собирает данные из API
 * - Анализирует УЖЕ собранные данные
 * - Вычисляет Health Score через tool
 */
export const ClassifyIndustryGraph = new StateGraph(ClassifyIndustryGraphState)
    .addNode('llmCall', llmCall)
    .addNode('toolNode', toolNode)
    .addEdge(START, 'llmCall')
    .addConditionalEdges(
        'llmCall',
        shouldContinue,
        ["toolNode", END]
    )
    .addEdge('toolNode', 'llmCall')
    .compile();

/**
 * Input для classifyIndustry
 */
interface ClassifyIndustryInput {
    role: UserRole;
    collectedData: Record<string, any>;
    marketResearchData: Record<string, any>;
}

/**
 * Output от classifyIndustry
 */
interface ClassifyIndustryOutput {
    analysis: IndustryAnalysis;
    healthScore: number;
}

/**
 * Функция для вызова из главного графа
 * 
 * Принимает собранные данные, возвращает analysis и healthScore
 */
export async function classifyIndustry(state: ClassifyIndustryInput): Promise<ClassifyIndustryOutput> {
    // Формируем контекст для агента: объединяем все собранные данные
    const dataContext = {
        collectedData: state.collectedData,
        marketResearch: state.marketResearchData,
    };
    
    const userMessage = new HumanMessage(
        `Analyze this market data and calculate Health Score for the region.
        
User role: ${state.role}

Market Data:
${JSON.stringify(dataContext, null, 2)}`
    );
    
    // Запускаем subgraph
    const result = await ClassifyIndustryGraph.invoke({
        messages: [userMessage],
        role: state.role,
        collectedData: state.collectedData,
        marketResearchData: state.marketResearchData,
    });
    
    // Извлекаем результат из messages
    const analysisData = extractDataFromMessages(result.messages) as IndustryAnalysis;
    
    console.log('ClassifyIndustry extracted data:', analysisData);
    
    // Извлекаем healthScore из результата
    const healthScore = analysisData.health_score ?? 0;
    
    return {
        analysis: analysisData,
        healthScore,
    };
}

