import { NextResponse } from "next/server";
import { whatsappSimulatorSchema } from "@/lib/validation/orders";
import { runSupportAgent } from "@/lib/ai/agent";
import {
  addMessage,
  getConversationMessages,
  getOrCreateConversation,
} from "@/lib/services/conversation-service";
import { getCustomerById } from "@/lib/services/customer-service";
import { requireAdmin } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = whatsappSimulatorSchema.parse(body);
    const customer = await getCustomerById(parsed.customerId);
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const conversation = await getOrCreateConversation({
      conversationId: parsed.conversationId,
      customerId: customer.id,
      channel: "simulated_whatsapp",
    });

    await addMessage({ conversationId: conversation.id, role: "user", content: parsed.message });

    const history = (await getConversationMessages(conversation.id))
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(0, -1)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const { responseText, toolCalls, escalated } = await runSupportAgent({
      message: parsed.message,
      history,
      context: {
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        conversationId: conversation.id,
        source: "simulated_whatsapp",
      },
    });

    await addMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: responseText,
      metadata: { toolCalls, escalated, channel: "simulated_whatsapp" },
    });

    return NextResponse.json({
      message: responseText,
      conversationId: conversation.id,
      toolCalls,
      escalated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Simulator failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
