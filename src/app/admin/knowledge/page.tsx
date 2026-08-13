import { requireAdmin } from "@/lib/auth/session";
import { listDocuments } from "@/lib/services/knowledge-service";
import { AdminNav } from "@/components/admin/nav";

export default async function AdminKnowledgePage() {
  await requireAdmin();
  const docs = await listDocuments();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Documents ingested into pgvector for RAG retrieval.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {docs.map((doc) => (
            <div key={doc.id} className="rounded-xl border bg-white p-5">
              <p className="text-xs uppercase text-zinc-400">{doc.category}</p>
              <h3 className="mt-1 font-medium">{doc.title}</h3>
              <p className="mt-2 line-clamp-4 text-sm text-zinc-600">{doc.content}</p>
              <p className="mt-3 text-xs text-zinc-400">Source: {doc.source}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
