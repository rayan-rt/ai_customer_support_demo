import { createAdminClient } from "@/lib/supabase/admin";
import { escalateConversation } from "@/lib/services/conversation-service";

export async function createTicket(input: {
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  subject: string;
  description: string;
  conversationId?: string;
  customerId?: string;
}) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      category: input.category,
      priority: input.priority,
      subject: input.subject,
      description: input.description,
      conversation_id: input.conversationId ?? null,
      customer_id: input.customerId ?? null,
      status: "open",
    })
    .select()
    .single();

  if (error) throw error;

  if (input.conversationId) {
    await escalateConversation(input.conversationId);
  }

  return data;
}

export async function listTickets() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("*, customers(name, email)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "resolved",
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
