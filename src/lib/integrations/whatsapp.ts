import { createAdminClient } from "@/lib/supabase/admin";

export class WhatsAppAdapter {
  static async sendMessage(
    conversationId: string,
    content: string,
    customerPhone?: string,
  ) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("automation_events")
      .insert({
        type: "whatsapp_message",
        provider: "whatsapp",
        status: "completed",
        payload: {
          simulated: true,
          to: customerPhone ?? "unknown",
          content: content.slice(0, 200),
        },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("integration_records").upsert(
      {
        provider: "whatsapp",
        external_id: `wa-msg-${conversationId.slice(0, 8)}-${Date.now()}`,
        entity_type: "conversation",
        entity_id: conversationId,
        status: "delivered",
        metadata: { simulated: true },
      },
      { onConflict: "provider,external_id" },
    );

    return { simulated: true, event: data };
  }

  static async sendInvoice(
    orderId: string,
    customerPhone?: string,
  ) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("automation_events")
      .insert({
        order_id: orderId,
        type: "whatsapp_invoice",
        provider: "whatsapp",
        status: "completed",
        payload: { simulated: true, to: customerPhone ?? "unknown" },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { simulated: true, event: data };
  }
}
