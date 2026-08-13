import { createAdminClient } from "@/lib/supabase/admin";
import type { Customer } from "@/types/database";

export async function listCustomers() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Customer[];
}

export async function getCustomerById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Customer | null;
}

export async function getCustomerByProfileId(profileId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw error;
  return data as Customer | null;
}

export async function findOrCreateCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  profileId?: string;
}) {
  const supabase = createAdminClient();

  if (input.profileId) {
    const existing = await getCustomerByProfileId(input.profileId);
    if (existing) return existing;
  }

  const { data: byEmail } = await supabase
    .from("customers")
    .select("*")
    .eq("email", input.email)
    .maybeSingle();

  if (byEmail) return byEmail as Customer;

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      profile_id: input.profileId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}
