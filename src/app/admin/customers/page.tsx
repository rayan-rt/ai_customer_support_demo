import { requireAdmin } from "@/lib/auth/session";
import { listCustomers } from "@/lib/services/customer-service";
import { AdminNav } from "@/components/admin/nav";
import { formatDate } from "@/lib/utils/format";

export default async function AdminCustomersPage() {
  await requireAdmin();
  const customers = await listCustomers();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="mt-6 overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4">{c.email}</td>
                  <td className="p-4">{c.phone ?? "—"}</td>
                  <td className="p-4">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
