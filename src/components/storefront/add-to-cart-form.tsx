"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/cart-context";
import type { ProductWithVariants } from "@/lib/services/product-service";

export function AddToCartForm({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId);

  function handleAdd() {
    if (!variant) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      slug: product.slug,
      sku: variant.sku,
      size: variant.size,
      unitPrice: Number(product.price),
      quantity,
      imageUrl: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-8 space-y-4">
      <div>
        <label className="text-sm font-medium">Size</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock_quantity === 0}
              onClick={() => setVariantId(v.id)}
              className={`rounded-full border px-4 py-2 text-sm ${
                variantId === v.id
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : v.stock_quantity === 0
                    ? "cursor-not-allowed opacity-40"
                    : "border-[var(--border)]"
              }`}
            >
              {v.size}
              {v.stock_quantity === 0 ? " — Out" : ` (${v.stock_quantity})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Qty</label>
        <input
          type="number"
          min={1}
          max={variant?.stock_quantity ?? 1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-20 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!variant || variant.stock_quantity === 0}
          className="flex-1 rounded-full bg-[var(--accent)] py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {added ? "Added!" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="rounded-full border border-[var(--border)] px-6 py-3 text-sm"
        >
          View Cart
        </button>
      </div>
    </div>
  );
}
