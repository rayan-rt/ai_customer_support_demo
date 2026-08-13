"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/cart-context";

export function FloatingSupportButton() {
  return (
    <Link
      href="/support"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:opacity-90"
    >
      <span aria-hidden>✦</span> AI Support
    </Link>
  );
}

export function CartHeaderWrapper({ children }: { children: React.ReactNode }) {
  const { itemCount } = useCart();
  return (
    <>
      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link href="/" className="font-serif text-xl tracking-wide text-[var(--accent)]">
              Lumière Bridal
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/products" className="hover:text-[var(--accent)]">Shop</Link>
              <Link href="/support" className="hover:text-[var(--accent)]">Support</Link>
              <Link href="/cart" className="relative hover:text-[var(--accent)]">
                Cart
                {itemCount > 0 ? (
                  <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-white">
                    {itemCount}
                  </span>
                ) : null}
              </Link>
              <Link href="/auth/login" className="hover:text-[var(--accent)]">Account</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <FloatingSupportButton />
    </>
  );
}
