import { GenerateReportGraphState } from './state';
import { StateGraph, START, END } from '@langchain/langgraph';
import {
    getCardTool,
    getListTool,
    getChartTool,
    getSectionTool,
    getRecommendationTool,
} from '../../../langchain/agents/reportGenerator/tools/index';
import { REPORT_GENERATOR_SYSTEM_PROMPT } from '../../../langchain/agents/reportGenerator/prompts/index';
import { MODELS } from '../../../langchain/shared/models';
import { getLlmCall, shouldContinue } from '../../utils';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { UserRole, ROLES } from '../../../const';
import { IndustryAnalysis } from '../../types';

// Используем модель для reportGenerator (может быть другая)
const llm = MODELS.reportGenerator ?? MODELS.main;
const tools = [
    getCardTool,
    getListTool,
    getChartTool,
    getSectionTool,
    getRecommendationTool,
];
const llmWithTools = llm.bindTools(tools);
const llmCall = getLlmCall(llmWithTools, REPORT_GENERATOR_SYSTEM_PROMPT);
const toolNode = new ToolNode(tools);

/**
 * Subgraph для генерации HTML отчёта
 * 
 * Использует tools для создания HTML компонентов:
 * - get_card: карточки метрик
 * - get_list: списки
 * - get_chart: графики
 * - get_section: секции
 * - get_recommendation: рекомендации
 */
export const GenerateReportGraph = new StateGraph(GenerateReportGraphState)
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
 * Input для generateReport
 */
interface GenerateReportInput {
    role: UserRole;
    region: string;
    collectedData: Record<string, any>;
    marketResearchData: Record<string, any>;
    analysis: IndustryAnalysis | undefined;
    healthScore: number | undefined;
}

/**
 * Output от generateReport
 */
interface GenerateReportOutput {
    report: string;
}

/**
 * Извлекает HTML из последнего AIMessage
 */
function extractHtmlFromMessages(messages: any[]): string {
    // Ищем последний AIMessage
    const lastAiMessage = messages
        .filter((m): m is AIMessage => m instanceof AIMessage || m._getType?.() === 'ai')
        .at(-1);
    
    if (!lastAiMessage?.content) {
        console.warn('No AIMessage content found for report');
        return '<div class="error">Failed to generate report</div>';
    }

    const content = typeof lastAiMessage.content === 'string' 
        ? lastAiMessage.content 
        : JSON.stringify(lastAiMessage.content);

    return content;
}

/**
 * Функция для вызова из главного графа
 * 
 * Принимает все данные, возвращает HTML report
 */
export async function generateReport(state: GenerateReportInput): Promise<GenerateReportOutput> {
    // Формируем полный контекст для агента
    const roleData = ROLES[state.role];
    
    const marketDataJson = JSON.stringify({
        region: state.region,
        collectedData: state.collectedData,
        marketResearch: state.marketResearchData,
        analysis: state.analysis,
        healthScore: state.healthScore,
    }, null, 2);
    
    const userRoleDescription = roleData ? `
        <userRole description="Роль пользователя, для которого генерируется отчет">
            ${roleData.name}
        </userRole>
        <htmlRequirements description="ОБЯЗАТЕЛЬНО СФОКУСИРОВАТЬСЯ В ИТОГОВОМ ОТЧЕТЕ НА ЭТОЙ ИНФОРМАЦИИ">
            ${roleData.neededStatistics}
        </htmlRequirements>
    ` : '';
    
    const userMessage = new HumanMessage(`
        <goal>
            Создай ПОДРОБНЫЙ HTML отчет, основываясь на информации о рынке.
        </goal>
        ${userRoleDescription}
        <marketDataJson>
            ${marketDataJson}
        </marketDataJson>
    `);
    
    // Запускаем subgraph
    const result = await GenerateReportGraph.invoke({
        messages: [userMessage],
        role: state.role,
        region: state.region,
        collectedData: state.collectedData,
        marketResearchData: state.marketResearchData,
        analysis: state.analysis,
        healthScore: state.healthScore,
    });
    
    // Извлекаем HTML из последнего сообщения
    const report = extractHtmlFromMessages(result.messages);
    
    console.log('GenerateReport completed, length:', report.length);
    
    return {
        report,
    };
}

