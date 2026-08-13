import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/env";
import { cn } from "@/lib/utils/cn";

export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-xl tracking-wide text-[var(--accent)]">
          {BRAND_NAME}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/products" className="hover:text-[var(--accent)]">
            Shop
          </Link>
          <Link href="/support" className="hover:text-[var(--accent)]">
            Support
          </Link>
          <Link href="/cart" className="relative hover:text-[var(--accent)]">
            Cart
            {cartCount > 0 ? (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link href="/auth/login" className="hover:text-[var(--accent)]">
            Account
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--accent)]"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
    open: "bg-rose-100 text-rose-800",
    in_progress: "bg-amber-100 text-amber-800",
    resolved: "bg-emerald-100 text-emerald-800",
    completed: "bg-emerald-100 text-emerald-800",
    active: "bg-blue-100 text-blue-800",
    escalated: "bg-rose-100 text-rose-800",
    closed: "bg-zinc-100 text-zinc-600",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colors[status] ?? "bg-zinc-100 text-zinc-700",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PageShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {title ? (
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-[var(--foreground)]">{title}</h1>
          {subtitle ? <p className="mt-2 text-[var(--muted)]">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
