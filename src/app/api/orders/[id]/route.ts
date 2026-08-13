import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/services/order-service";
import { getAuthUser } from "@/lib/auth/session";
import { getCustomerByProfileId } from "@/lib/services/customer-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await getAuthUser();
    if (user?.role !== "admin") {
      const customer = await getCustomerByProfileId(user?.id ?? "");
      if (!customer || order.customer_id !== customer.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { requireAdmin } = await import("@/lib/auth/session");
    await requireAdmin();
    const { id } = await params;
    const { status } = await request.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
