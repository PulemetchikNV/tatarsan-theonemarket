import { CollectDataGraphState } from './state';
import { StateGraph, START, END } from '@langchain/langgraph';
import { getRegionStatsTool } from '../../../langchain/agents/dataCollector/tools';
import { MODELS } from '../../../langchain/shared/models';
import { getLlmCall, shouldContinue, extractDataFromMessages } from '../../utils';
import { DATA_COLLECTOR_SYSTEM_PROMPT } from '../../../langchain/agents/dataCollector/prompts';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { UserRole } from '../../../const';

const llm = MODELS.main;
const tools = [getRegionStatsTool];
const llmWithTools = llm.bindTools(tools);
const llmCall = getLlmCall(llmWithTools, DATA_COLLECTOR_SYSTEM_PROMPT);
const toolNode = new ToolNode(tools);

/**
 * Subgraph для сбора основных данных
 * 
 * Flow: llmCall → (tool_calls?) → toolNode → llmCall → ... → END
 */
export const CollectMainDataGraph = new StateGraph(CollectDataGraphState)
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
 * Инициализирует messages с user запросом и возвращает collectedData
 */
export async function collectMainData(state: { role: UserRole; region: string; query?: string }) {
    // Формируем запрос для агента
    const userMessage = new HumanMessage(
        `Collect market data for region: ${state.region}. User role: ${state.role}.${state.query ? ` Additional context: ${state.query}` : ''}`
    );
    
    // Запускаем subgraph с начальным сообщением
    const result = await CollectMainDataGraph.invoke({
        messages: [userMessage],
        role: state.role,
        collectedData: {},
    });
    
    // Извлекаем данные из messages
    const collectedData = extractDataFromMessages(result.messages);
    
    console.log('CollectMainData extracted data:', collectedData);
    
    return {
        collectedData,
    };
}
