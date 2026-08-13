import { NextResponse } from "next/server";
import { updateDocument, deleteDocument } from "@/lib/services/knowledge-service";
import { requireAdmin } from "@/lib/auth/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const doc = await updateDocument(id, body);
    return NextResponse.json(doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update document";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
