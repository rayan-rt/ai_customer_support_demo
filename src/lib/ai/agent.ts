import { ChatGroq } from "@langchain/groq";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { GROQ_MODEL } from "@/lib/config/env";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  isGroqToolUseFailed,
  parseGroqToolUseFailed,
} from "@/lib/ai/groq-tool-fallback";
import { retrieveProductContext } from "@/lib/ai/product-context";
import { retrieveKnowledgeContext } from "@/lib/ai/rag";
import { selectToolsForMessage, buildTools } from "@/lib/ai/tools";
import type { ToolCallInfo } from "@/types/domain";
import type { AgentContext } from "@/lib/ai/tools";
import type { StructuredToolInterface } from "@langchain/core/tools";

interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

const GROQ_TOOL_OPTIONS = {
  parallel_tool_calls: false as const,
};

function buildSystemPrompt(
  knowledgeContext: string,
  productContext: string,
  toolsAvailable: boolean,
) {
  let prompt = SYSTEM_PROMPT;

  if (knowledgeContext) {
    prompt += `

Relevant company knowledge (use for policy, sizing, shipping, and brand questions — do not invent details beyond this):
${knowledgeContext}`;
  } else {
    prompt += `

No matching knowledge base articles were found for this question. Do not guess policies or shipping rules; offer human support if needed.`;
  }

  if (productContext) {
    prompt += `

Live product catalog data (use these exact IDs for orders and inventory — do not call getProduct for these):
${productContext}`;
  }

  if (!toolsAvailable) {
    prompt += `

No backend tools are available for this turn. Answer from the context above only. Do not mention tools unless the customer explicitly asks for a refund or human agent.`;
  }

  return prompt;
}

async function executeToolCall(
  toolsByName: Record<string, StructuredToolInterface>,
  name: string,
  args: Record<string, unknown>,
) {
  const selected = toolsByName[name];
  if (!selected) {
    return JSON.stringify({ error: "Tool not found" });
  }

  return (selected as { invoke: (input: unknown) => Promise<unknown> }).invoke(args);
}

async function invokeWithGroqFallback(
  runnable: { invoke: (messages: BaseMessage[], options?: typeof GROQ_TOOL_OPTIONS) => Promise<AIMessage> },
  messages: BaseMessage[],
  toolsByName: Record<string, StructuredToolInterface>,
  toolCalls: ToolCallInfo[],
  toolsEnabled: boolean,
): Promise<AIMessage> {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await runnable.invoke(messages, GROQ_TOOL_OPTIONS);
    } catch (error) {
      if (!toolsEnabled || !isGroqToolUseFailed(error) || attempt === maxAttempts - 1) {
        throw error;
      }

      const parsedCalls = parseGroqToolUseFailed(error);
      if (!parsedCalls?.length) {
        throw error;
      }

      const syntheticToolCalls = parsedCalls.map((call, index) => ({
        id: `fallback-${Date.now()}-${attempt}-${index}`,
        name: call.name,
        args: call.args,
        type: "tool_call" as const,
      }));

      messages.push(
        new AIMessage({
          content: "",
          tool_calls: syntheticToolCalls,
        }),
      );

      for (const call of syntheticToolCalls) {
        const output = await executeToolCall(toolsByName, call.name, call.args);

        toolCalls.push({
          name: call.name,
          input: call.args,
          output,
        });

        messages.push(
          new ToolMessage({
            content: typeof output === "string" ? output : JSON.stringify(output),
            tool_call_id: call.id,
          }),
        );
      }
    }
  }

  throw new Error("Groq tool fallback exhausted retries");
}

export async function runSupportAgent(input: {
  message: string;
  history?: ChatHistoryMessage[];
  context: AgentContext;
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const [{ context: knowledgeContext }, { context: productContext }] = await Promise.all([
    retrieveKnowledgeContext(input.message),
    retrieveProductContext(input.message, input.history),
  ]);

  const allTools = buildTools(input.context);
  const tools = selectToolsForMessage(input.message, input.context, {
    history: input.history,
    hasProductContext: productContext.length > 0,
  });
  const toolsByName = Object.fromEntries(allTools.map((tool) => [tool.name, tool]));

  const model = new ChatGroq({
    apiKey,
    model: GROQ_MODEL,
    temperature: 0.3,
  });

  const runnable = tools.length > 0 ? model.bindTools(tools) : model;

  const messages: BaseMessage[] = [
    new SystemMessage(
      buildSystemPrompt(knowledgeContext, productContext, tools.length > 0),
    ),
    ...(input.history ?? []).map((entry) =>
      entry.role === "user"
        ? new HumanMessage(entry.content)
        : new AIMessage(entry.content),
    ),
    new HumanMessage(input.message),
  ];

  const toolCalls: ToolCallInfo[] = [];
  let response = await invokeWithGroqFallback(
    runnable,
    messages,
    toolsByName,
    toolCalls,
    tools.length > 0,
  );
  let iterations = 0;

  while (response.tool_calls?.length && iterations < 5) {
    iterations += 1;
    messages.push(response);

    for (const toolCall of response.tool_calls) {
      const args = (toolCall.args ?? {}) as Record<string, unknown>;
      const output = await executeToolCall(toolsByName, toolCall.name, args);

      toolCalls.push({
        name: toolCall.name,
        input: args,
        output,
      });

      messages.push(
        new ToolMessage({
          content: typeof output === "string" ? output : JSON.stringify(output),
          tool_call_id: toolCall.id ?? toolCall.name,
        }),
      );
    }

    response = await invokeWithGroqFallback(
      runnable,
      messages,
      toolsByName,
      toolCalls,
      tools.length > 0,
    );
  }

  const responseText =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
        ? response.content
            .filter(
              (part): part is { type: "text"; text: string } =>
                typeof part === "object" && "text" in part,
            )
            .map((part) => part.text)
            .join("")
        : "I'm sorry, I couldn't generate a response.";

  const escalated = toolCalls.some((tool) => tool.name === "createTicket");

  return { responseText, toolCalls, escalated };
}
