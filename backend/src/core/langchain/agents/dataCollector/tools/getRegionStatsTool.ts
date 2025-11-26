import * as z from "zod";
import { tool } from 'langchain';
import { createModuleLogger } from '../../../../utils/index.js';
import { getRegionStats } from "../../../../dataApi.js";

const logger = createModuleLogger('getRegionStatsTool');

export const getRegionStatsTool = tool(
  async ({ region }: { region: string }) => {
    logger.info({ region }, 'Запрос статистики по региону');
    try {
      const data = await getRegionStats(region);
      logger.info({ region }, 'Статистика получена успешно');
      return JSON.stringify(data);
    } catch (error) {
      logger.error({ err: error, region }, 'Ошибка получения статистики');
      return JSON.stringify({ error: "Failed to fetch region stats", details: String(error) });
    }
  },
  {
    name: "get_region_stats",
    description: "Get aggregated market statistics for a specific region (vacancies, employers, salaries). Returns raw data.",
    schema: z.object({
      region: z.string().optional().describe("Region name (default: Татарстан). Example: 'Татарстан', 'Казань'"),
    }),
  }
);
