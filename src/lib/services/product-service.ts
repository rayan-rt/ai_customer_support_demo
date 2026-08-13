import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import type { Product, ProductVariant } from "@/types/database";

export type ProductWithVariants = Product & { variants: ProductVariant[] };

function mapProduct(row: Product & { product_variants?: ProductVariant[] }): ProductWithVariants {
  return {
    ...row,
    variants: row.product_variants ?? [],
  };
}

export async function listProducts(options?: {
  category?: string;
  search?: string;
  activeOnly?: boolean;
}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("created_at", { ascending: false });

  if (options?.activeOnly !== false) {
    query = query.eq("is_active", true);
  }
  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,description.ilike.%${options.search}%`,
    );
  }

  const { data, error } = await query;
  throwIfSupabaseError(error, "Failed to list products");

  return (data ?? []).map((row) =>
    mapProduct(row as Product & { product_variants?: ProductVariant[] }),
  );
}

export async function getProductBySlug(slug: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throwIfSupabaseError(error, "Failed to load product");
  if (!data) return null;

  return mapProduct(data as Product & { product_variants?: ProductVariant[] });
}

export async function getProductById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throwIfSupabaseError(error, "Failed to load product");
  if (!data) return null;

  return mapProduct(data as Product & { product_variants?: ProductVariant[] });
}

export async function findProductByName(name: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .ilike("name", `%${name}%`)
    .eq("is_active", true)
    .limit(5);

  if (error) throwIfSupabaseError(error, "Failed to load product");
  return (data ?? []).map((row) =>
    mapProduct(row as Product & { product_variants?: ProductVariant[] }),
  );
}

export async function checkInventory(productId: string, size: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .ilike("size", size)
    .maybeSingle();

  if (error) throwIfSupabaseError(error, "Failed to check inventory");
  if (!data) return { available: false, stockQuantity: 0, variant: null };

  return {
    available: data.stock_quantity > 0,
    stockQuantity: data.stock_quantity,
    variant: data as ProductVariant,
  };
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throwIfSupabaseError(error, "Failed to update product");
}

export async function updateVariantStock(variantId: string, quantity: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .update({ stock_quantity: quantity })
    .eq("id", variantId)
    .select()
    .single();

  if (error) throwIfSupabaseError(error, "Failed to update variant stock");
}
