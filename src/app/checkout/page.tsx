"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CartHeaderWrapper } from "@/components/storefront/shell";
import { PageShell } from "@/components/ui/layout";
import { useCart } from "@/components/storefront/cart-context";
import { formatCurrency } from "@/lib/utils/format";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("name")),
      customerEmail: String(form.get("email")),
      customerPhone: String(form.get("phone") || ""),
      shippingAddress: {
        line1: String(form.get("line1")),
        line2: String(form.get("line2") || ""),
        city: String(form.get("city")),
        state: String(form.get("state")),
        postal_code: String(form.get("postal_code")),
        country: String(form.get("country") || "US"),
      },
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      source: "storefront" as const,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <CartHeaderWrapper>
        <PageShell title="Checkout">
          <p className="text-[var(--muted)]">Your cart is empty.</p>
        </PageShell>
      </CartHeaderWrapper>
    );
  }

  return (
    <CartHeaderWrapper>
      <PageShell title="Checkout">
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-medium">Contact</h3>
            {(["name", "email", "phone"] as const).map((field) => (
              <input
                key={field}
                name={field}
                type={field === "email" ? "email" : "text"}
                required={field !== "phone"}
                placeholder={field === "name" ? "Full name" : field === "email" ? "Email" : "Phone"}
                className="w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm"
              />
            ))}
            <h3 className="pt-4 font-medium">Shipping Address</h3>
            {(["line1", "line2", "city", "state", "postal_code", "country"] as const).map((field) => (
              <input
                key={field}
                name={field}
                required={field !== "line2" && field !== "country"}
                defaultValue={field === "country" ? "US" : undefined}
                placeholder={field.replace("_", " ")}
                className="w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm"
              />
            ))}
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h3 className="font-medium">Order Summary</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.variantId} className="flex justify-between">
                  <span>
                    {i.productName} ({i.size}) × {i.quantity}
                  </span>
                  <span>{formatCurrency(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[var(--accent)] py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </form>
      </PageShell>
    </CartHeaderWrapper>
  );
}
