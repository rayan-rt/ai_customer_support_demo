import { NextResponse } from "next/server";
import { listDocuments, createDocument } from "@/lib/services/knowledge-service";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireAdmin();
    const docs = await listDocuments();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const doc = await createDocument(body);
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create document";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
