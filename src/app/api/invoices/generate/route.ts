import { NextResponse } from "next/server";
import { createAndStoreInvoice } from "@/lib/services/invoice-service";
import { requireAdmin } from "@/lib/auth/session";
import { z } from "zod";

const schema = z.object({ orderId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = schema.parse(await request.json());
    const invoice = await createAndStoreInvoice(body.orderId);
    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invoice generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
