import { NextResponse } from "next/server";
import { ExcelAdapter } from "@/lib/integrations/excel";
import { requireAdmin } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { orderId, orderNumber } = await request.json();
    if (!orderId || !orderNumber) {
      return NextResponse.json({ error: "orderId and orderNumber required" }, { status: 400 });
    }
    const result = await ExcelAdapter.syncOrder(orderId, orderNumber);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Excel sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
