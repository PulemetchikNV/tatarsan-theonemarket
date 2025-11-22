import { EventTrackerAgent } from "./src/agent/event-tracker";
import { logger } from "./src/utils/logger";

async function main() {
    const agent = new EventTrackerAgent();

    logger.info("=== Event Tracker Demo ===");

    // Track all events from mocked Telegram channels
    const events = await agent.trackEvents();

    logger.info(`\n📊 Found ${events.length} events:\n`);

    events.forEach((event, index) => {
        logger.info(`--- Event ${index + 1} ---`);
        logger.info(JSON.stringify(event, null, 2));
        logger.info("");
    });
}

main();
