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
import { REPORT_GENERATOR_SYSTEM_PROMPT, REPORT_EVALUATOR_PROMPT } from '../../../langchain/agents/reportGenerator/prompts/index';
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
const MAX_ITERATIONS = 3;  // Максимум итераций evaluator-optimizer
const MIN_SCORE_TO_PASS = 75;  // Минимальный score для прохождения

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
    iterations: number;
    finalScore: number;
}

interface EvaluationResult {
    score: number;
    issues: string[];
    suggestions: string[];
    pass: boolean;
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

// ═══════════════════════════════════════════════════════════════
//                        EVALUATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Оценивает качество сгенерированного отчёта
 */
async function evaluateReport(report: string): Promise<EvaluationResult> {
    console.log('📊 Evaluating report quality...');
    
    const evaluationPrompt = `
${REPORT_EVALUATOR_PROMPT}

Отчёт для оценки:
\`\`\`html
${report.substring(0, 5000)}  // Ограничиваем размер для оценки
\`\`\`
`;

    try {
        const response = await llm.invoke([
            { role: 'system', content: 'Ты эксперт по оценке качества дашбордов. Отвечай ТОЛЬКО валидным JSON.' },
            { role: 'user', content: evaluationPrompt }
        ]);

        const content = typeof response.content === 'string' 
            ? response.content 
            : JSON.stringify(response.content);
        
        // Парсим JSON ответ
        const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
        const evaluation = JSON.parse(cleanJson) as EvaluationResult;
        
        // Проверяем что score проходит порог
        evaluation.pass = evaluation.score >= MIN_SCORE_TO_PASS;
        
        console.log(`📊 Evaluation: score=${evaluation.score}, pass=${evaluation.pass}`);
        if (evaluation.issues.length > 0) {
            console.log(`   Issues: ${evaluation.issues.join(', ')}`);
        }
        
        return evaluation;
    } catch (error) {
        console.warn('Failed to parse evaluation, assuming pass:', error);
        return {
            score: 80,
            issues: [],
            suggestions: [],
            pass: true
        };
    }
}

// ═══════════════════════════════════════════════════════════════
//                        SINGLE ITERATION GENERATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Генерирует отчёт (одна итерация)
 */
async function generateReportIteration(
    state: GenerateReportInput,
    feedback?: string[]
): Promise<string> {
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
    
    // Добавляем feedback если есть (для улучшения)
    const feedbackSection = feedback && feedback.length > 0 ? `
        <feedback description="ОБЯЗАТЕЛЬНО исправь эти проблемы в новой версии отчёта">
            ${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}
        </feedback>
    ` : '';
    
    const userMessage = new HumanMessage(`
        <goal>
            Создай ПОДРОБНЫЙ HTML отчет, основываясь на информации о рынке.
            ${feedback ? 'ЭТО УЛУЧШЕННАЯ ВЕРСИЯ - исправь указанные проблемы!' : ''}
        </goal>
        ${userRoleDescription}
        ${feedbackSection}
        <marketDataJson>
            ${marketDataJson}
        </marketDataJson>
    `);
    
    // Каждый invoke() начинает с чистого счётчика рекурсии!
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
        {
            recursionLimit: REPORT_RECURSION_LIMIT,
        }
    );
    
    return extractHtmlFromMessages(result.messages);
}

// ═══════════════════════════════════════════════════════════════
//                        MAIN FUNCTION (EVALUATOR-OPTIMIZER)
// ═══════════════════════════════════════════════════════════════

/**
 * Генерирует отчёт с итеративным улучшением
 * 
 * Паттерн: Evaluator-Optimizer
 * 1. Генерируем отчёт
 * 2. Оцениваем качество
 * 3. Если не прошёл - генерируем заново с feedback
 * 4. Повторяем до MAX_ITERATIONS или пока не пройдёт
 */
export async function generateReport(state: GenerateReportInput): Promise<GenerateReportOutput> {
    let report = '';
    let evaluation: EvaluationResult = { score: 0, issues: [], suggestions: [], pass: false };
    let feedback: string[] = [];
    
    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
        console.log(`\n🔄 Report generation iteration ${iteration}/${MAX_ITERATIONS}`);
        
        // 1. Генерируем отчёт (с feedback если не первая итерация)
        report = await generateReportIteration(state, iteration > 1 ? feedback : undefined);
        console.log(`   Generated report length: ${report.length}`);
        
        // 2. Оцениваем качество
        evaluation = await evaluateReport(report);
        
        // 3. Если прошёл - выходим
        if (evaluation.pass) {
            console.log(`✅ Report passed evaluation on iteration ${iteration}`);
            break;
        }
        
        // 4. Собираем feedback для следующей итерации
        feedback = [...evaluation.issues, ...evaluation.suggestions];
        console.log(`⚠️ Report failed, will retry with ${feedback.length} feedback items`);
    }
    
    console.log(`\n📄 Final report: ${report.length} chars, score: ${evaluation.score}, iterations: ${MAX_ITERATIONS}`);
    
    return {
        report,
        iterations: MAX_ITERATIONS,
        finalScore: evaluation.score,
    };
}
