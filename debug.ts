import { NLPAgent } from "./src/agent/analyzer";
import { logger } from "./src/utils/logger";

async function main() {
    const agent = new NLPAgent();

    const testCases = [
        {
            name: "Fintech Case",
            text: `
        Stripe is a financial infrastructure platform for the internet. 
        They use Ruby and Go for their backend services and React for the dashboard.
        They compete with PayPal and Adyen.
      `,
        },
        {
            name: "AI Case",
            text: `
        Anthropic is an AI safety and research company that builds reliable, interpretable, and steerable AI systems.
        They train large language models using Python, PyTorch, and massive GPU clusters on AWS.
        Their main product is Claude.
      `,
        },
        {
            name: "Gaming Case",
            text: `
        Unity Technologies offers a platform for creating 3D content.
        Game developers use C# scripting within the Unity engine.
        It competes with Unreal Engine by Epic Games.
      `,
        },
    ];

    logger.info("Running debug analysis...");

    for (const test of testCases) {
        logger.info(`--- Analyzing: ${test.name} ---`);
        try {
            const result = await agent.analyze(test.text);
            logger.info("Result:", JSON.stringify(result, null, 2));
        } catch (error) {
            logger.error(`Analysis failed for ${test.name}:`, error);
        }
    }
}

main();
