import { NextResponse } from "next/server";
import { knowledgeSearchSchema } from "@/lib/validation/orders";
import { searchKnowledge } from "@/lib/services/knowledge-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, matchCount } = knowledgeSearchSchema.parse(body);
    const chunks = await searchKnowledge(query, matchCount ?? 5);
    return NextResponse.json({ chunks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
