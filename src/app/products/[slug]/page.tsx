import { notFound } from "next/navigation";
import Image from "next/image";
import { CartHeaderWrapper } from "@/components/storefront/shell";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
import { getProductBySlug } from "@/lib/services/product-service";
import { formatCurrency } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <CartHeaderWrapper>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-[var(--surface)]">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
          ) : null}
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-[var(--muted)]">{product.category}</p>
          <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
          <p className="mt-4 text-2xl text-[var(--accent)]">{formatCurrency(Number(product.price))}</p>
          <p className="mt-6 leading-relaxed text-[var(--muted)]">{product.description}</p>
          <AddToCartForm product={product} />
        </div>
      </div>
    </CartHeaderWrapper>
  );
}
