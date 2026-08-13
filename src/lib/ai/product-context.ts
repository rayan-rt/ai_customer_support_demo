import { findProductByName } from "@/lib/services/product-service";
import type { ProductWithVariants } from "@/lib/services/product-service";

const PRODUCT_KEYWORDS = [
  "lehenga",
  "lehnga",
  "gown",
  "suit",
  "bridal",
  "skirt",
  "veil",
  "dress",
];

const KEYWORD_ALIASES: Record<string, string> = {
  lehnga: "lehenga",
};

function normalizeQuery(query: string) {
  const lower = query.toLowerCase();
  return KEYWORD_ALIASES[lower] ?? query;
}

function extractProductQueries(text: string): string[] {
  const queries = new Set<string>();

  for (const match of text.matchAll(/"([^"]{3,80})"/g)) {
    queries.add(match[1].trim());
  }

  const interestedMatch = text.match(/interested in\s+"?([^,"\n]+)"?/i);
  if (interestedMatch) {
    queries.add(interestedMatch[1].trim());
  }

  for (const keyword of PRODUCT_KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(text)) {
      queries.add(keyword);
    }
  }

  return [...queries];
}

function formatProduct(product: ProductWithVariants) {
  const variants = product.variants
    .map(
      (variant) =>
        `  - ${variant.size}: ${variant.stock_quantity} in stock (variantId: ${variant.id}, sku: ${variant.sku})`,
    )
    .join("\n");

  return `[${product.name}] productId: ${product.id}, price: $${product.price}, category: ${product.category}
${variants || "  - No variants listed"}`;
}

export async function retrieveProductContext(
  message: string,
  history?: { content: string }[],
) {
  const fullText = [...(history ?? []).map((entry) => entry.content), message].join("\n");
  const queries = extractProductQueries(fullText);

  if (queries.length === 0) {
    return { products: [] as ProductWithVariants[], context: "" };
  }

  const byId = new Map<string, ProductWithVariants>();

  for (const query of queries) {
    const found = await findProductByName(normalizeQuery(query));
    for (const product of found) {
      byId.set(product.id, product);
    }
  }

  const products = [...byId.values()];
  if (products.length === 0) {
    return { products: [], context: "" };
  }

  const context = products.map(formatProduct).join("\n\n");
  return { products, context };
}
