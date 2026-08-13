import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validation/orders";
import { createOrder } from "@/lib/services/order-service";
import { getAuthUser } from "@/lib/auth/session";
import { getCustomerByProfileId } from "@/lib/services/customer-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.parse(body);
    const user = await getAuthUser();
    const customer = user ? await getCustomerByProfileId(user.id) : null;

    const result = await createOrder({
      ...parsed,
      profileId: user?.id,
      customerId: parsed.customerId ?? customer?.id,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const { listOrders } = await import("@/lib/services/order-service");
    const { requireAdmin } = await import("@/lib/auth/session");
    await requireAdmin();
    const orders = await listOrders();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
