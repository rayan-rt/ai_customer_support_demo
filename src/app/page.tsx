import Link from "next/link";
import Image from "next/image";
import { CartHeaderWrapper } from "@/components/storefront/shell";
import { listProducts } from "@/lib/services/product-service";
import { formatCurrency } from "@/lib/utils/format";
import { BRAND_NAME } from "@/lib/config/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProducts();
  const featured = products.slice(0, 4);

  return (
    <CartHeaderWrapper>
      <section className="relative overflow-hidden bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--accent)]">
              New Collection
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight text-[var(--foreground)]">
              Modern bridal elegance, crafted for your moment
            </h1>
            <p className="mt-6 max-w-lg text-[var(--muted)]">
              Discover curated gowns, suits, and occasion wear from {BRAND_NAME}.
              Shop online or chat with our AI stylist for personalized help.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/products"
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white"
              >
                Shop Collection
              </Link>
              <Link
                href="/support"
                className="rounded-full border border-[var(--border)] px-6 py-3 text-sm"
              >
                Ask AI Support
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1515377901643-4a9748da2991?w=800"
              alt="Bridal gown"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-2xl">Featured Pieces</h2>
          <Link href="/products" className="text-sm text-[var(--accent)] underline">
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition hover:shadow-md"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  {product.category}
                </p>
                <h3 className="mt-1 font-medium">{product.name}</h3>
                <p className="mt-1 text-[var(--accent)]">{formatCurrency(Number(product.price))}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </CartHeaderWrapper>
  );
}
