import { tool } from 'langchain';

export const calculateITHealthTool = tool(
  async ({  }) => {
    return `Рассчитывает it здоровье региона "${region}".`;
  },
  {
    name: 'calculate_it_health',
    description: `Рассчитывает it здоровье региона "${region}".`,
  }
);