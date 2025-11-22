import * as z from "zod";
import { tool } from '@langchain/core/tools'
import { createModuleLogger } from '../../utils'

const logger = createModuleLogger('testTool')

export const testTool = tool(
    ({input}) => {
        logger.info({ input }, 'Test tool вызван')
        const result = `Результат выполнения тулза: ts: ${Date.now()}, input: ${input}`
        logger.info({ input, timestamp: Date.now() }, 'Test tool выполнен')
        return result
    },
    {
        name: "test",
        description: "Используй когда пользователь просит тебя провести тест тулзов. Отправь пользователю результат выполнения",
        schema: z.object({
            input: z.string(),
        }),
    }
)