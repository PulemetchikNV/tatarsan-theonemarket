import { UserRole } from '../const';
import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphState } from './state';
import { collectMainData } from './nodes/collectMainData';
import { collectMarketResearch } from './nodes/collectMarketResearch';
import { classifyIndustry } from './nodes/classifyIndustry';
import { generateReport } from './nodes/generateReport';

function createGraph() {
    const graph = new StateGraph(GraphState)
        .addNode('collectMainData', async (state: typeof GraphState.State) => {
            const result = await collectMainData({
                role: state.role,
                region: state.region,
                query: state.query,
            });
            
            return {
                collectedData: result.collectedData,
            };
        })
        .addNode('collectMarketResearch', async (state: typeof GraphState.State) => {
            const result = await collectMarketResearch({
                role: state.role,
                region: state.region,
                query: state.query,
            });

            return {
                marketResearchData: result.marketResearchData,
            }
        })
        .addNode('classifyIndustry', async (state: typeof GraphState.State) => {
            const result = await classifyIndustry({
                role: state.role,
                collectedData: state.collectedData,
                marketResearchData: state.marketResearchData,
            });
            
            return {
                analysis: result.analysis,
                healthScore: result.healthScore,
            }
        })
        .addNode('generateReport', async (state: typeof GraphState.State) => {
            const result = await generateReport({
                role: state.role,
                region: state.region,
                collectedData: state.collectedData,
                marketResearchData: state.marketResearchData,
                analysis: state.analysis,
                healthScore: state.healthScore,
            });

            return {
                report: result.report,
            }
        })
        .addEdge(START, 'collectMainData')
        .addEdge(START, 'collectMarketResearch')
        .addEdge('collectMainData', 'classifyIndustry')
        .addEdge('collectMarketResearch', 'classifyIndustry')
        .addEdge('classifyIndustry', 'generateReport')
        .addEdge('generateReport', END)
        .compile();

    return graph;
}


type StartDashboardAnalysisParams = {
    role: UserRole;
    query: string | undefined;
    region: string;
}

export async function startDashboardAnalysis({
    role,
    query,
    region,
}: StartDashboardAnalysisParams): Promise<typeof GraphState.State> {
    const graph = createGraph();
    
    return graph.invoke({
        role,
        query,
        region,
        collectedData: {},
    });
}
