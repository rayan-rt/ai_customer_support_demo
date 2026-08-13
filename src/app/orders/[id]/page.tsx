import Link from "next/link";
import { notFound } from "next/navigation";
import { CartHeaderWrapper } from "@/components/storefront/shell";
import { StatusBadge } from "@/components/ui/layout";
import { getOrderById } from "@/lib/services/order-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const invoiceRaw = order.invoices;
  const invoice = Array.isArray(invoiceRaw) ? invoiceRaw[0] : invoiceRaw;
  const events = order.automation_events ?? [];
  const items = order.order_items ?? [];

  let invoiceUrl: string | null = null;
  if (invoice && typeof invoice === "object" && "id" in invoice) {
    const supabase = createAdminClient();
    if (invoice.file_path) {
      const { data } = await supabase.storage
        .from("invoices")
        .createSignedUrl(invoice.file_path, 3600);
      invoiceUrl = data?.signedUrl ?? null;
    }
  }

  const timeline = [
    { label: "Order Created", done: events.some((e: { type: string }) => e.type === "order_created") },
    { label: "Inventory Updated", done: events.some((e: { type: string }) => e.type === "inventory_updated") },
    { label: "Invoice Generated", done: events.some((e: { type: string }) => e.type === "invoice_generated") },
    { label: "Shopify Sync Simulated", done: events.some((e: { type: string }) => e.type === "shopify_sync") },
    { label: "Excel Sync Simulated", done: events.some((e: { type: string }) => e.type === "excel_sync") },
  ];

  return (
    <CartHeaderWrapper>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/products" className="text-sm text-[var(--accent)] underline">
          ← Continue shopping
        </Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Order {order.order_number}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(order.created_at)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="font-medium">Items</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((item: { id: string; product_name_snapshot: string; sku_snapshot: string; quantity: number; line_total: number }) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name_snapshot} × {item.quantity}
                    <span className="block text-xs text-[var(--muted)]">{item.sku_snapshot}</span>
                  </span>
                  <span>{formatCurrency(Number(item.line_total))}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="font-medium">Automation Timeline</h2>
            <ul className="mt-4 space-y-3">
              {timeline.map((step) => (
                <li key={step.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      step.done ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {step.done ? "✓" : "·"}
                  </span>
                  {step.label}
                </li>
              ))}
            </ul>
            {invoiceUrl ? (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-white"
              >
                View Invoice PDF
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </CartHeaderWrapper>
  );
}
