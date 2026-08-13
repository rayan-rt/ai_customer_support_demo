import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/ui/layout";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { BRAND_NAME } from "@/lib/config/env";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [orders, events, tickets] = await Promise.all([
    supabase.from("orders").select("*, customers(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("automation_events").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("tickets").select("*").eq("status", "open"),
  ]);

  const revenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total), 0);

  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/conversations", label: "Conversations" },
    { href: "/admin/knowledge", label: "Knowledge" },
    { href: "/admin/automation", label: "Automation" },
    { href: "/admin/whatsapp", label: "WhatsApp Sim" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Admin</p>
            <h1 className="text-xl font-semibold">{BRAND_NAME}</h1>
          </div>
          <Link href="/" className="text-sm underline">Storefront</Link>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 pb-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm hover:bg-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Recent Revenue", value: formatCurrency(revenue) },
            { label: "Open Tickets", value: String(tickets.data?.length ?? 0) },
            { label: "Recent Orders", value: String(orders.data?.length ?? 0) },
            { label: "Automation Events", value: String(events.data?.length ?? 0) },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border bg-white p-5">
              <p className="text-xs text-zinc-500">{kpi.label}</p>
              <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-medium">Recent Orders</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(orders.data ?? []).map((o) => (
                <li key={o.id} className="flex items-center justify-between">
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium underline">
                      {o.order_number}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {(o.customers as { name?: string })?.name} · {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.status} />
                    <p className="mt-1">{formatCurrency(Number(o.total))}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-medium">Automation Activity</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {(events.data ?? []).map((e) => (
                <li key={e.id} className="flex items-center justify-between">
                  <span>
                    {e.type} <span className="text-zinc-400">({e.provider})</span>
                  </span>
                  <StatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
