import { GenerateReportGraphState } from './state';
import { StateGraph, START, END } from '@langchain/langgraph';
import {
    getGridTool,
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

// ═══════════════════════════════════════════════════════════════
//                        CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const llm = MODELS.reportGenerator ?? MODELS.main;
const REPORT_RECURSION_LIMIT = 100;

// Размер отчёта
const MIN_REPORT_LENGTH = 8000;   // Минимум символов для "хорошего" отчёта
const TARGET_REPORT_LENGTH = 15000; // Целевой размер
const MAX_PARTS = 3;  // Максимум частей (основная + 2 дополнения)

// ═══════════════════════════════════════════════════════════════
//                        REPORT GENERATOR GRAPH
// ═══════════════════════════════════════════════════════════════

const tools = [
    getGridTool,
    getCardTool,
    getListTool,
    getChartTool,
    getSectionTool,
    getRecommendationTool,
];
const llmWithTools = llm.bindTools(tools);
const llmCall = getLlmCall(llmWithTools, REPORT_GENERATOR_SYSTEM_PROMPT);
const toolNode = new ToolNode(tools);

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

// ═══════════════════════════════════════════════════════════════
//                        TYPES
// ═══════════════════════════════════════════════════════════════

interface GenerateReportInput {
    role: UserRole;
    region: string;
    collectedData: Record<string, any>;
    marketResearchData: Record<string, any>;
    analysis: IndustryAnalysis | undefined;
    healthScore: number | undefined;
}

interface GenerateReportOutput {
    report: string;
    parts: number;
    totalLength: number;
}

// ═══════════════════════════════════════════════════════════════
//                        HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function extractHtmlFromMessages(messages: any[]): string {
    const lastAiMessage = messages
        .filter((m): m is AIMessage => m instanceof AIMessage || m._getType?.() === 'ai')
        .at(-1);
    
    if (!lastAiMessage?.content) {
        console.warn('No AIMessage content found for report');
        return '<div class="error">Failed to generate report</div>';
    }

    return typeof lastAiMessage.content === 'string' 
        ? lastAiMessage.content 
        : JSON.stringify(lastAiMessage.content);
}

/**
 * Объединяет части отчёта
 * Убирает дублирующиеся content-wrap и recommendation
 */
function mergeReportParts(parts: string[]): string {
    if (parts.length === 1) return parts[0];
    
    // Первая часть полностью
    let merged = parts[0];
    
    // Убираем закрывающий </div> от content-wrap в первой части
    merged = merged.replace(/<\/div>\s*$/, '');
    
    // Добавляем остальные части (без открывающего content-wrap)
    for (let i = 1; i < parts.length; i++) {
        let part = parts[i];
        // Убираем открывающий content-wrap
        part = part.replace(/^<div class="content-wrap">\s*/i, '');
        // Убираем закрывающий </div> (кроме последней части)
        if (i < parts.length - 1) {
            part = part.replace(/<\/div>\s*$/, '');
        }
        merged += '\n\n<!-- PART ' + (i + 1) + ' -->\n\n' + part;
    }
    
    return merged;
}

// ═══════════════════════════════════════════════════════════════
//                        PART GENERATORS
// ═══════════════════════════════════════════════════════════════

/**
 * Генерирует основную часть отчёта
 */
async function generateMainPart(state: GenerateReportInput): Promise<string> {
    const roleData = ROLES[state.role];
    
    const marketDataJson = JSON.stringify({
        region: state.region,
        collectedData: state.collectedData,
        marketResearch: state.marketResearchData,
        analysis: state.analysis,
        healthScore: state.healthScore,
    }, null, 2);
    
    const userRoleDescription = roleData ? `
        <userRole description="Роль пользователя">
            ${roleData.name}
        </userRole>
        <htmlRequirements>
            ${roleData.neededStatistics}
        </htmlRequirements>
    ` : '';
    
    const userMessage = new HumanMessage(`
        <goal>
            Создай ПЕРВУЮ ЧАСТЬ HTML дашборда: основные метрики и показатели.
        </goal>
        ${userRoleDescription}
        <marketDataJson>
            ${marketDataJson}
        </marketDataJson>
        
        <structure>
            Включи в эту часть:
            1. Header с названием региона и Health Score
            2. Grid с 4 основными метриками (Health Score, Вакансии, ЗП, Рост)
            3. Grid с 3 sub-scores (Таланты, Конкурентность, Технологичность)
            4. 1-2 графика (топ роли, грейды)
        </structure>
    `);
    
    const result = await GenerateReportGraph.invoke(
        {
            messages: [userMessage],
            role: state.role,
            region: state.region,
            collectedData: state.collectedData,
            marketResearchData: state.marketResearchData,
            analysis: state.analysis,
            healthScore: state.healthScore,
        },
        { recursionLimit: REPORT_RECURSION_LIMIT }
    );
    
    return extractHtmlFromMessages(result.messages);
}

/**
 * Генерирует дополнительную часть (SWOT, тренды, рекомендации)
 */
async function generateAdditionalPart(
    state: GenerateReportInput,
    existingReport: string,
    partNumber: number
): Promise<string> {
    const roleData = ROLES[state.role];
    
    const marketDataJson = JSON.stringify({
        region: state.region,
        collectedData: state.collectedData,
        marketResearch: state.marketResearchData,
        analysis: state.analysis,
        healthScore: state.healthScore,
    }, null, 2);
    
    // Разные задания для разных частей
    const partInstructions: Record<number, string> = {
        2: `
            <structure>
                Включи в эту часть:
                1. SWOT-анализ в grid-2 (Сильные стороны | Слабые стороны)
                2. Возможности и Угрозы в grid-2
                3. Топ работодателей региона (если есть данные)
                4. График трендов вакансий
            </structure>
        `,
        3: `
            <structure>
                Включи в эту часть:
                1. Детальный анализ зарплат по грейдам
                2. Рекомендации для пользователя (с учётом его роли)
                3. Прогноз развития рынка
                4. Финальная рекомендация (invest/watch/avoid)
            </structure>
        `
    };
    
    const userMessage = new HumanMessage(`
        <goal>
            Создай ЧАСТЬ ${partNumber} HTML дашборда: дополнительный анализ.
            ЭТО ПРОДОЛЖЕНИЕ - не повторяй то, что уже есть!
        </goal>
        
        <existingReport description="Уже сгенерированные секции (НЕ ПОВТОРЯЙ ИХ!)">
            ${existingReport.substring(0, 3000)}...
        </existingReport>
        
        ${partInstructions[partNumber] || partInstructions[2]}
        
        <userRole>${roleData?.name || state.role}</userRole>
        
        <marketDataJson>
            ${marketDataJson}
        </marketDataJson>
        
        <rules>
            - НЕ добавляй header с названием региона (уже есть)
            - НЕ повторяй метрики Health Score, вакансии, ЗП (уже есть)
            - Добавляй НОВЫЕ секции и данные
            - Оберни всё в <div class="content-wrap">
        </rules>
    `);
    
    const result = await GenerateReportGraph.invoke(
        {
            messages: [userMessage],
            role: state.role,
            region: state.region,
            collectedData: state.collectedData,
            marketResearchData: state.marketResearchData,
            analysis: state.analysis,
            healthScore: state.healthScore,
        },
        { recursionLimit: REPORT_RECURSION_LIMIT }
    );
    
    return extractHtmlFromMessages(result.messages);
}

// ═══════════════════════════════════════════════════════════════
//                        MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Генерирует отчёт с автоматическим дополнением
 * 
 * Паттерн: Size-based Expansion
 * 1. Генерируем основную часть
 * 2. Проверяем размер
 * 3. Если < MIN_LENGTH - генерируем дополнительную часть
 * 4. Повторяем до TARGET_LENGTH или MAX_PARTS
 */
export async function generateReport(state: GenerateReportInput): Promise<GenerateReportOutput> {
    const parts: string[] = [];
    
    // ═══════════════════════════════════════════════════════════
    // PART 1: Основные метрики
    // ═══════════════════════════════════════════════════════════
    console.log('\n📊 Generating PART 1: Main metrics...');
    const part1 = await generateMainPart(state);
    parts.push(part1);
    console.log(`   Part 1 length: ${part1.length} chars`);
    
    // ═══════════════════════════════════════════════════════════
    // PART 2+: Дополнительные секции (если нужно)
    // ═══════════════════════════════════════════════════════════
    let currentLength = part1.length;
    let partNumber = 2;
    
    while (currentLength < TARGET_REPORT_LENGTH && partNumber <= MAX_PARTS) {
        console.log(`\n📊 Generating PART ${partNumber}: Additional sections...`);
        console.log(`   Current length: ${currentLength}/${TARGET_REPORT_LENGTH}`);
        
        const existingReport = mergeReportParts(parts);
        const additionalPart = await generateAdditionalPart(state, existingReport, partNumber);
        
        parts.push(additionalPart);
        currentLength += additionalPart.length;
        
        console.log(`   Part ${partNumber} length: ${additionalPart.length} chars`);
        console.log(`   Total length: ${currentLength} chars`);
        
        partNumber++;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Объединяем все части
    // ═══════════════════════════════════════════════════════════
    const finalReport = mergeReportParts(parts);
    
    console.log(`\n✅ Report complete!`);
    console.log(`   Total parts: ${parts.length}`);
    console.log(`   Total length: ${finalReport.length} chars`);
    
    return {
        report: finalReport,
        parts: parts.length,
        totalLength: finalReport.length,
    };
}
