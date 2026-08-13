-- Populate placeholder demo embeddings after seed.sql.
-- Replace with real Cohere embeddings via scripts/generate-embeddings.ts before RAG production use.
-- Run: pnpm exec supabase db query --linked -f supabase/scripts/seed-embeddings.sql

update public.knowledge_chunks
set embedding = (array_fill(0.01::real, array[1024]))::extensions.vector(1024)
where embedding is null;
