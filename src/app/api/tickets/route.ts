import { NextResponse } from "next/server";
import { ticketSchema } from "@/lib/validation/orders";
import { createTicket, listTickets } from "@/lib/services/ticket-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ticketSchema.parse(body);
    const ticket = await createTicket(parsed);
    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create ticket";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const { requireAdmin } = await import("@/lib/auth/session");
    await requireAdmin();
    const tickets = await listTickets();
    return NextResponse.json(tickets);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
