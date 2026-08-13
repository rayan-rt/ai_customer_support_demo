import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin/nav";
import { StatusBadge } from "@/components/ui/layout";
import { formatDate } from "@/lib/utils/format";

export default async function AdminAutomationPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: events }, { data: integrations }] = await Promise.all([
    supabase.from("automation_events").select("*").order("created_at", { ascending: false }).limit(30),
    supabase.from("integration_records").select("*").order("updated_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Automation & Integrations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Shopify Sync: Simulated / Connected · WhatsApp: Simulated · Excel: Simulated
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-medium">Automation Events</h2>
            <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
              {(events ?? []).map((e) => (
                <li key={e.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p>{e.type}</p>
                    <p className="text-xs text-zinc-400">{e.provider} · {formatDate(e.created_at)}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-medium">Integration Records</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {(integrations ?? []).map((r) => (
                <li key={r.id} className="flex justify-between border-b pb-2">
                  <span>{r.provider} · {r.entity_type}</span>
                  <span className="text-zinc-500">{r.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
