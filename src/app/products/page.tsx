import Link from "next/link";
import Image from "next/image";
import { CartHeaderWrapper } from "@/components/storefront/shell";
import { PageShell } from "@/components/ui/layout";
import { listProducts } from "@/lib/services/product-service";
import { formatCurrency } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const products = await listProducts({
    category: params.category,
    search: params.search,
  });
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <CartHeaderWrapper>
      <PageShell title="Shop" subtitle="Bridal gowns, suits, and occasion wear">
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-full px-4 py-1.5 text-sm ${!params.category ? "bg-[var(--accent)] text-white" : "border border-[var(--border)]"}`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className={`rounded-full px-4 py-1.5 text-sm ${params.category === cat ? "bg-[var(--accent)] text-white" : "border border-[var(--border)]"}`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white hover:shadow-md"
            >
              <div className="relative aspect-[3/4] bg-[var(--surface)]">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="p-4">
                <p className="text-xs text-[var(--muted)]">{product.category}</p>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-[var(--accent)]">{formatCurrency(Number(product.price))}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {product.variants.filter((v) => v.stock_quantity > 0).length} sizes in stock
                </p>
              </div>
            </Link>
          ))}
        </div>
      </PageShell>
    </CartHeaderWrapper>
  );
}
