import type { PostgrestError } from "@supabase/supabase-js";

export function throwIfSupabaseError(
  error: PostgrestError | null,
  context = "Database request failed",
): void {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}
