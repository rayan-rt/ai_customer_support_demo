import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    fullName: profile?.full_name ?? "",
    role: (profile?.role as UserRole | undefined) ?? "customer",
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    redirect("/?error=admin_required");
  }
  return user;
}
