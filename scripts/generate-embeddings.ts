/**
 * Generates real Cohere embeddings for knowledge_chunks.
 * Run after migrations + seed: pnpm exec tsx scripts/generate-embeddings.ts
 */
import { createClient } from "@supabase/supabase-js";
import { CohereClient } from "cohere-ai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_PROJECT_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereApiKey = process.env.COHERE_API_KEY;
const embeddingModel = process.env.COHERE_EMBEDDING_MODEL ?? "embed-english-v3.0";
const embeddingDimension = Number(process.env.EMBEDDING_DIMENSION ?? 1024);

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY");
}
if (!cohereApiKey) {
  throw new Error("Missing COHERE_API_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const cohere = new CohereClient({ token: cohereApiKey });

async function embedText(text: string) {
  const response = await cohere.embed({
    texts: [text],
    model: embeddingModel,
    inputType: "search_document",
    embeddingTypes: ["float"],
  });

  const embeddings = response.embeddings;
  let embedding: number[] | null = null;

  if (embeddings && typeof embeddings === "object" && "float" in embeddings) {
    embedding = (embeddings as { float?: number[][] }).float?.[0] ?? null;
  } else if (Array.isArray(embeddings)) {
    embedding = (embeddings as number[][])[0] ?? null;
  }

  if (!embedding || embedding.length !== embeddingDimension) {
    throw new Error(`Unexpected embedding dimension: ${embedding?.length ?? 0}`);
  }

  return embedding;
}

async function main() {
  const { data: chunks, error } = await supabase
    .from("knowledge_chunks")
    .select("id, content")
    .order("created_at");

  if (error) throw error;
  if (!chunks?.length) {
    console.log("No knowledge chunks found.");
    return;
  }

  for (const chunk of chunks) {
    const embedding = await embedText(chunk.content);
    const { error: updateError } = await supabase
      .from("knowledge_chunks")
      .update({ embedding })
      .eq("id", chunk.id);

    if (updateError) throw updateError;
    console.log(`Embedded chunk ${chunk.id}`);
  }

  console.log(`Done. Updated ${chunks.length} chunks.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
