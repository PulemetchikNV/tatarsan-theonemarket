import { FastifyRequest, FastifyReply } from 'fastify';
import { orchestratorAgent } from '../langchain/agents/orchestratorAgent.js';
import { logger } from '../utils/logger.js';
import type { AnalyzeCompanyRequest, AnalyzeCompanyResponse, GetDashboardResponse } from '../types/index.js';

export async function analyzeCompanyHandler(
  request: FastifyRequest<{ Body: AnalyzeCompanyRequest }>,
  reply: FastifyReply
) {
  try {
    const { companyName, deepAnalysis = true } = request.body;

    if (!companyName) {
      return reply.code(400).send({
        success: false,
        error: 'Company name is required',
      });
    }

    logger.info(`🔍 Analyzing company: ${companyName}`);

    // Orchestrator agent coordinates all 7 agents
    const result = await orchestratorAgent.analyzeCompany(companyName, deepAnalysis);

    const response: AnalyzeCompanyResponse = {
      success: true,
      data: result,
    };

    return reply.send(response);
  } catch (error) {
    logger.error('Error analyzing company:', error);
    return reply.code(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getDashboardHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    logger.info('📊 Fetching dashboard data');

    // For MVP: return mock data
    // TODO: implement real dashboard aggregation
    const dashboardData = await orchestratorAgent.getDashboard();

    const response: GetDashboardResponse = {
      success: true,
      data: dashboardData,
    };

    return reply.send(response);
  } catch (error) {
    logger.error('Error fetching dashboard:', error);
    return reply.code(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}


