export const EMBEDDING_DIMENSION = Number(
  process.env.EMBEDDING_DIMENSION ?? 1024,
);

export const COHERE_EMBEDDING_MODEL =
  process.env.COHERE_EMBEDDING_MODEL ?? "embed-english-v3.0";

export const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export const BRAND_NAME = "Lumière Bridal";
