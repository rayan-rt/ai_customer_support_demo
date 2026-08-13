import { NextResponse } from "next/server";
import { getInvoiceSignedUrl } from "@/lib/services/invoice-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await getInvoiceSignedUrl(id);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get invoice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
