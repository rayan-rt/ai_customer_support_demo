import { requireAdmin } from "@/lib/auth/session";
import { listCustomers } from "@/lib/services/customer-service";
import { AdminNav } from "@/components/admin/nav";
import { WhatsAppSimulator } from "@/components/admin/whatsapp-simulator";

export default async function AdminWhatsAppPage() {
  await requireAdmin();
  const customers = await listCustomers();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold">WhatsApp Simulator</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Send messages as a demo customer. Uses the same AI agent as web support.
        </p>
        <div className="mt-6">
          <WhatsAppSimulator customers={customers} />
        </div>
      </div>
    </div>
  );
}
