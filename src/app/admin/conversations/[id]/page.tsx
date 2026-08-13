import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getConversation } from "@/lib/services/conversation-service";
import { AdminNav } from "@/components/admin/nav";
import { StatusBadge } from "@/components/ui/layout";
import { formatDate } from "@/lib/utils/format";

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv) notFound();

  const messages = (conv.messages ?? []) as Array<{
    id: string;
    role: string;
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Conversation</h1>
          <StatusBadge status={conv.status} />
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {(conv.customers as { name?: string; email?: string })?.name} · {conv.channel}
        </p>
        <div className="mt-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-4 text-sm ${
                m.role === "user" ? "bg-zinc-900 text-white ml-8" : "bg-white border mr-8"
              }`}
            >
              <p className="text-xs opacity-60 capitalize">{m.role} · {formatDate(m.created_at)}</p>
              <p className="mt-2 whitespace-pre-wrap">{m.content}</p>
              {m.metadata?.toolCalls ? (
                <p className="mt-2 text-xs opacity-70">Tools used</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
