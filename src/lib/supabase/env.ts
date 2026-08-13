function requireEnv(primary: string, fallback?: string): string {
  const value = process.env[primary] ?? (fallback ? process.env[fallback] : undefined);
  if (!value) {
    throw new Error(`Missing environment variable: ${primary}`);
  }
  return value;
}

export const supabaseUrl = requireEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_PROJECT_URL",
);

export const supabaseAnonKey = requireEnv(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PROJECT_ANON_KEY",
);
