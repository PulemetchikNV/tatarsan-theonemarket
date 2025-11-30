import { MessagesAnnotation } from "@langchain/langgraph";
import { Runnable } from "@langchain/core/runnables";
import { AIMessage } from "@langchain/core/messages";
import { END } from "@langchain/langgraph";

/**
 * Создаёт функцию llmCall для tool calling loop
 * 
 * Важно: state должен содержать messages (extend MessagesAnnotation)
 */
export const getLlmCall = (llmWithTools: Runnable, systemPrompt: string) => {
    return async function llmCall(state: typeof MessagesAnnotation.State) {
        console.log('===STATE===', state);
        
        // LLM decides whether to call a tool or not
        const result = await llmWithTools.invoke([
          {
            role: "system",
            content: systemPrompt
          },
          // Передаём предыдущие messages (если есть)
          ...(state.messages || []),
        ]);
      
        return {
          messages: [result]
        };
    }
}

/**
 * Conditional edge: продолжать tool calling или завершить
 * 
 * Проверяет есть ли tool_calls в последнем сообщении
 */
export function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages || [];
    const lastMessage = messages.at(-1);
  
    // If the LLM makes a tool call, then perform an action
    // AIMessage имеет tool_calls
    if (lastMessage && 'tool_calls' in lastMessage) {
        const aiMessage = lastMessage as AIMessage;
        if (aiMessage.tool_calls?.length) {
            return "toolNode";
        }
    }
    
    // Otherwise, we stop (reply to the user)
    return END;
}

/**
 * Извлекает данные из последнего AIMessage
 */
export function extractDataFromMessages(messages: any[]): Record<string, any> {
    // Ищем последний AIMessage (финальный ответ LLM)
    const lastAiMessage = messages
        .filter((m): m is AIMessage => m instanceof AIMessage || m._getType?.() === 'ai')
        .at(-1);
    
    if (!lastAiMessage?.content) {
        console.warn('No AIMessage content found');
        return {};
    }

    const content = typeof lastAiMessage.content === 'string' 
        ? lastAiMessage.content 
        : JSON.stringify(lastAiMessage.content);

    try {
        // Пытаемся распарсить JSON
        const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        console.warn('Failed to parse AIMessage content as JSON:', e);
        return { raw_response: content };
    }
}
