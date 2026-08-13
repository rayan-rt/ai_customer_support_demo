import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validation/orders";
import { runSupportAgent } from "@/lib/ai/agent";
import {
  addMessage,
  getConversationMessages,
  getOrCreateConversation,
} from "@/lib/services/conversation-service";
import { getAuthUser } from "@/lib/auth/session";
import { getCustomerById, getCustomerByProfileId } from "@/lib/services/customer-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = chatRequestSchema.parse(body);
    const user = await getAuthUser();

    const customer = parsed.customerId
      ? await getCustomerById(parsed.customerId)
      : user
        ? await getCustomerByProfileId(user.id)
        : null;

    const conversation = await getOrCreateConversation({
      conversationId: parsed.conversationId,
      customerId: customer?.id,
      channel: parsed.channel,
    });

    await addMessage({
      conversationId: conversation.id,
      role: "user",
      content: parsed.message,
    });

    const history = (await getConversationMessages(conversation.id))
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(0, -1)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const { responseText, toolCalls, escalated } = await runSupportAgent({
      message: parsed.message,
      history,
      context: {
        customerId: customer?.id,
        profileId: user?.id,
        customerEmail: customer?.email ?? user?.email,
        customerName: customer?.name ?? user?.fullName,
        conversationId: conversation.id,
        source: parsed.channel === "simulated_whatsapp" ? "simulated_whatsapp" : "ai_chat",
      },
    });

    await addMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: responseText,
      metadata: { toolCalls, escalated },
    });

    return NextResponse.json({
      message: responseText,
      conversationId: conversation.id,
      toolCalls,
      escalated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
