import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listOrders } from "@/lib/services/order-service";
import { AdminNav } from "@/components/admin/nav";
import { StatusBadge } from "@/components/ui/layout";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listOrders();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="mt-6 overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Source</th>
                <th className="p-4">Status</th>
                <th className="p-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium underline">
                      {o.order_number}
                    </Link>
                    <p className="text-xs text-zinc-500">{formatDate(o.created_at)}</p>
                  </td>
                  <td className="p-4">
                    {(o.customers as { name?: string; email?: string })?.name}
                    <p className="text-xs text-zinc-500">
                      {(o.customers as { email?: string })?.email}
                    </p>
                  </td>
                  <td className="p-4 capitalize">{String(o.source).replace(/_/g, " ")}</td>
                  <td className="p-4"><StatusBadge status={o.status} /></td>
                  <td className="p-4">{formatCurrency(Number(o.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
