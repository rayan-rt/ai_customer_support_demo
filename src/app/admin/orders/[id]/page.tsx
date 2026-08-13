import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getOrderById } from "@/lib/services/order-service";
import { AdminNav } from "@/components/admin/nav";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { StatusBadge } from "@/components/ui/layout";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const events = order.automation_events ?? [];
  const items = order.order_items ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{order.order_number}</h1>
            <p className="text-sm text-zinc-500">{formatDate(order.created_at)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-medium">Items</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((item: { id: string; product_name_snapshot: string; quantity: number; line_total: number }) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.product_name_snapshot} × {item.quantity}</span>
                  <span>{formatCurrency(Number(item.line_total))}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-medium">Total: {formatCurrency(Number(order.total))}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-medium">Update Status</h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-white p-5">
          <h2 className="font-medium">Automation Timeline</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {events.map((e: { id: string; type: string; provider: string; status: string }) => (
              <li key={e.id} className="flex justify-between">
                <span>{e.type} ({e.provider})</span>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
