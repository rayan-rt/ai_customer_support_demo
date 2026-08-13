import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listConversations } from "@/lib/services/conversation-service";
import { AdminNav } from "@/components/admin/nav";
import { StatusBadge } from "@/components/ui/layout";
import { formatDate } from "@/lib/utils/format";

export default async function AdminConversationsPage() {
  await requireAdmin();
  const conversations = await listConversations();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <div className="mt-6 space-y-3">
          {conversations.map((conv) => {
            const msgs = (conv.messages ?? []) as Array<{ content: string; role: string }>;
            const last = msgs[msgs.length - 1];
            return (
              <Link
                key={conv.id}
                href={`/admin/conversations/${conv.id}`}
                className="block rounded-xl border bg-white p-5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {(conv.customers as { name?: string })?.name ?? "Guest"} · {conv.channel}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-1">
                      {last?.content ?? "No messages"}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={conv.status} />
                    <p className="mt-1 text-xs text-zinc-400">{formatDate(conv.updated_at)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
