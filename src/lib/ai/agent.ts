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
import { retrieveKnowledgeContext } from "@/lib/ai/rag";
import { selectToolsForMessage } from "@/lib/ai/tools";
import type { ToolCallInfo } from "@/types/domain";
import type { AgentContext } from "@/lib/ai/tools";

interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

const GROQ_TOOL_OPTIONS = {
  parallel_tool_calls: false as const,
};

function buildSystemPrompt(knowledgeContext: string, toolsAvailable: boolean) {
  if (!knowledgeContext) {
    return `${SYSTEM_PROMPT}

No matching knowledge base articles were found for this question. Do not guess policies or shipping rules; offer human support if needed.`;
  }

  let prompt = `${SYSTEM_PROMPT}

Relevant company knowledge (use for policy, sizing, shipping, and brand questions — do not invent details beyond this):
${knowledgeContext}`;

  if (!toolsAvailable) {
    prompt += `

No backend tools are available for this turn. Answer from the knowledge context above only. Do not mention tools unless the customer explicitly asks for a refund or human agent.`;
  }

  return prompt;
}

export async function runSupportAgent(input: {
  message: string;
  history?: ChatHistoryMessage[];
  context: AgentContext;
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const { context: knowledgeContext } = await retrieveKnowledgeContext(input.message);
  const tools = selectToolsForMessage(input.message, input.context);
  const toolsByName = Object.fromEntries(tools.map((t) => [t.name, t]));

  const model = new ChatGroq({
    apiKey,
    model: GROQ_MODEL,
    temperature: 0.3,
  });

  const runnable =
    tools.length > 0 ? model.bindTools(tools) : model;

  const messages: BaseMessage[] = [
    new SystemMessage(buildSystemPrompt(knowledgeContext, tools.length > 0)),
    ...(input.history ?? []).map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
    ),
    new HumanMessage(input.message),
  ];

  const toolCalls: ToolCallInfo[] = [];
  let response = await runnable.invoke(messages, GROQ_TOOL_OPTIONS);
  let iterations = 0;

  while (response.tool_calls?.length && iterations < 5) {
    iterations += 1;
    messages.push(response);

    for (const toolCall of response.tool_calls) {
      const selected = toolsByName[toolCall.name];
      const output = selected
        ? await (selected as { invoke: (input: unknown) => Promise<unknown> }).invoke(
            toolCall.args,
          )
        : "Tool not found";

      toolCalls.push({
        name: toolCall.name,
        input: toolCall.args,
        output,
      });

      messages.push(
        new ToolMessage({
          content: typeof output === "string" ? output : JSON.stringify(output),
          tool_call_id: toolCall.id ?? toolCall.name,
        }),
      );
    }

    response = await runnable.invoke(messages, GROQ_TOOL_OPTIONS);
  }

  const responseText =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
        ? response.content
            .filter((c): c is { type: "text"; text: string } => typeof c === "object" && "text" in c)
            .map((c) => c.text)
            .join("")
        : "I'm sorry, I couldn't generate a response.";

  const escalated = toolCalls.some((t) => t.name === "createTicket");

  return { responseText, toolCalls, escalated };
}
