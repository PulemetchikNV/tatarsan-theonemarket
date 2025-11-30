import { MarketResearchGraphState } from './state';
import { StateGraph, START, END } from '@langchain/langgraph';
import { getMarketMetricsTool } from '../../../langchain/agents/marketResearcher/tools/getData';
import { MODELS } from '../../../langchain/shared/models';
import { getLlmCall, shouldContinue, extractDataFromMessages } from '../../utils';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import { UserRole } from '../../../const';
import { MARKET_RESEARCHER_SYSTEM_PROMPT } from '../../../langchain/agents/marketResearcher/prompts/index.js';

const llm = MODELS.main;
const tools = [getMarketMetricsTool];
const llmWithTools = llm.bindTools(tools);
const llmCall = getLlmCall(llmWithTools, MARKET_RESEARCHER_SYSTEM_PROMPT);
const toolNode = new ToolNode(tools);

/**
 * Subgraph для исследования рынка
 * 
 * Flow: llmCall → (tool_calls?) → toolNode → llmCall → ... → END
 */
export const CollectMarketResearchGraph = new StateGraph(MarketResearchGraphState)
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
 * Функция для вызова из главного графа
 * 
 * Инициализирует messages с user запросом и возвращает marketResearch данные
 */
export async function collectMarketResearch(state: { role: UserRole; region: string; query?: string }) {
    // Формируем запрос для агента
    const userMessage = new HumanMessage(
        `Analyze IT market for region: ${state.region}. User role: ${state.role}.${state.query ? ` Additional context: ${state.query}` : ''}`
    );
    
    // Запускаем subgraph с начальным сообщением
    const result = await CollectMarketResearchGraph.invoke({
        messages: [userMessage],
        role: state.role,
        marketResearchData: {},
    });
    
    // Извлекаем данные из messages
    const marketResearch = extractDataFromMessages(result.messages);
    
    console.log('CollectMarketResearch extracted data:', marketResearch);
    
    return {
        marketResearchData: marketResearch,
    };
}

