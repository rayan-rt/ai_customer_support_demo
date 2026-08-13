import {
  searchKnowledge,
  searchKnowledgeByKeyword,
} from "@/lib/services/knowledge-service";
import type { KnowledgeChunkMatch } from "@/types/database";

function formatContext(chunks: KnowledgeChunkMatch[]) {
  return chunks
    .map(
      (chunk, i) =>
        `[${i + 1}] ${(chunk.metadata as { title?: string }).title ?? "Document"} (similarity: ${chunk.similarity.toFixed(2)})\n${chunk.content}`,
    )
    .join("\n\n");
}

export async function retrieveKnowledgeContext(query: string) {
  let chunks: KnowledgeChunkMatch[] = [];

  try {
    chunks = await searchKnowledge(query, 5);
  } catch {
    chunks = [];
  }

  if (chunks.length === 0) {
    chunks = await searchKnowledgeByKeyword(query, 5);
  }

  if (chunks.length === 0) {
    return { chunks: [], context: "" };
  }

  return { chunks, context: formatContext(chunks) };
}
