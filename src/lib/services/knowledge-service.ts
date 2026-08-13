import { CohereClient } from "cohere-ai";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  COHERE_EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
} from "@/lib/config/env";
import type { KnowledgeChunkMatch } from "@/types/database";

function getCohereClient() {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("Missing COHERE_API_KEY");
  return new CohereClient({ token: apiKey });
}

export async function embedText(text: string, inputType: "search_query" | "search_document" = "search_query") {
  const cohere = getCohereClient();
  const response = await cohere.embed({
    texts: [text],
    model: COHERE_EMBEDDING_MODEL,
    inputType,
    embeddingTypes: ["float"],
  });

  const embeddings = response.embeddings;
  let embedding: number[] | null = null;

  if (embeddings && typeof embeddings === "object" && "float" in embeddings) {
    const floats = (embeddings as { float?: number[][] }).float;
    embedding = floats?.[0] ?? null;
  } else if (Array.isArray(embeddings)) {
    embedding = (embeddings as number[][])[0] ?? null;
  }
  if (!embedding || embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(`Unexpected embedding dimension: ${embedding?.length}`);
  }
  return embedding;
}

export async function searchKnowledge(query: string, matchCount = 5) {
  const embedding = await embedText(query, "search_query");
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: matchCount,
  });

  if (error) throw error;
  return (data ?? []) as KnowledgeChunkMatch[];
}

/** Fallback when vector embeddings are missing or similarity search returns nothing. */
export async function searchKnowledgeByKeyword(query: string, limit = 5) {
  const supabase = createAdminClient();
  const stopWords = new Set([
    "what",
    "is",
    "your",
    "the",
    "a",
    "an",
    "do",
    "you",
    "how",
    "can",
    "i",
    "my",
    "are",
    "our",
    "we",
  ]);
  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !stopWords.has(term));

  if (terms.length === 0) {
    return [] as KnowledgeChunkMatch[];
  }

  const orFilter = terms
    .map((term) => `title.ilike.%${term}%,content.ilike.%${term}%`)
    .join(",");

  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("id, title, content, category")
    .or(orFilter)
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((doc, index) => ({
    id: doc.id,
    document_id: doc.id,
    content: doc.content,
    chunk_index: 0,
    metadata: { title: doc.title, category: doc.category },
    similarity: Math.max(0.5, 1 - index * 0.05),
  })) as KnowledgeChunkMatch[];
}

export async function listDocuments() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("*")
    .order("title");

  if (error) throw error;
  return data ?? [];
}

export async function createDocument(input: {
  title: string;
  content: string;
  category: string;
}) {
  const supabase = createAdminClient();
  const { data: doc, error } = await supabase
    .from("knowledge_documents")
    .insert({ ...input, source: "admin" })
    .select()
    .single();

  if (error) throw error;

  const embedding = await embedText(input.content, "search_document");
  await supabase.from("knowledge_chunks").insert({
    document_id: doc.id,
    content: input.content,
    chunk_index: 0,
    embedding,
    metadata: { title: input.title, category: input.category },
  });

  return doc;
}

export async function deleteDocument(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("knowledge_documents").delete().eq("id", id);
  if (error) throw error;
}

export async function updateDocument(
  id: string,
  input: { title?: string; content?: string; category?: string },
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("knowledge_documents")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  if (input.content) {
    const embedding = await embedText(input.content, "search_document");
    await supabase
      .from("knowledge_chunks")
      .update({ content: input.content, embedding })
      .eq("document_id", id)
      .eq("chunk_index", 0);
  }

  return data;
}
