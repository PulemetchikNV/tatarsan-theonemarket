import * as z from "zod";
import { tool } from 'langchain';
import { createModuleLogger } from '../../../../utils/index.js';
import { MarketResearcherApi } from "../../../../api/index.js";

const logger = createModuleLogger('getMarketMetricsTool');

export const getMarketMetricsTool = tool(
  async ({ region, period_days }: { region: string, period_days: number }) => {
    logger.info({ region, period_days }, 'Запрос метрик рынка');
    
    try {
      // Вычисляем даты
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period_days);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const data = await MarketResearcherApi.getMetrics({
        region,
        start_date: startStr,
        end_date: endStr
      });
      
      logger.info({ region }, 'Метрики получены успешно');
      return JSON.stringify(data);
    } catch (error) {
      logger.error({ err: error, region }, 'Ошибка получения метрик');
      return JSON.stringify({ error: "Failed to fetch market metrics", details: String(error) });
    }
  },
  {
    name: "get_market_metrics",
    description: "Get comprehensive market metrics: competition ratios, salary gaps, demand dynamics, and structural data (remote work, tech companies ratio).",
    schema: z.object({
      region: z.string().optional().default('Татарстан').describe("Region name"),
      period_days: z.number().optional().default(30).describe("Analysis period in days (default: 30)"),
    }),
  }
);

