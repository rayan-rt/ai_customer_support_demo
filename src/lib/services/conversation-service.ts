import { createAdminClient } from "@/lib/supabase/admin";
import type { ConversationChannel, MessageRole } from "@/types/database";

export async function getOrCreateConversation(input: {
  customerId?: string;
  channel?: ConversationChannel;
  conversationId?: string;
}) {
  const supabase = createAdminClient();

  if (input.conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", input.conversationId)
      .maybeSingle();
    if (data) return data;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      customer_id: input.customerId ?? null,
      channel: input.channel ?? "web",
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addMessage(input: {
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationMessages(conversationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");

  if (error) throw error;
  return data ?? [];
}

export async function listConversations() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*, customers(name, email), messages(id, role, content, created_at)")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function escalateConversation(conversationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("conversations")
    .update({ status: "escalated" })
    .eq("id", conversationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversation(conversationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*, customers(*), messages(*)")
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  return data;
}
