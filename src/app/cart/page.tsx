"use client";

import Link from "next/link";
import Image from "next/image";
import { CartHeaderWrapper } from "@/components/storefront/shell";
import { PageShell } from "@/components/ui/layout";
import { useCart } from "@/components/storefront/cart-context";
import { formatCurrency } from "@/lib/utils/format";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  return (
    <CartHeaderWrapper>
      <PageShell title="Shopping Cart">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
            <p className="text-[var(--muted)]">Your cart is empty.</p>
            <Link href="/products" className="mt-4 inline-block text-[var(--accent)] underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-4"
                >
                  <div className="relative h-24 w-20 overflow-hidden rounded-lg bg-[var(--surface)]">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productName}</h3>
                    <p className="text-sm text-[var(--muted)]">
                      Size {item.size} · {item.sku}
                    </p>
                    <p className="mt-1">{formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
                      className="w-16 rounded border border-[var(--border)] px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs text-[var(--muted)] underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <h3 className="font-medium">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-2 font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-[var(--accent)] py-3 text-center text-sm font-medium text-white"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </PageShell>
    </CartHeaderWrapper>
  );
}
