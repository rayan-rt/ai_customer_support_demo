"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="flex-1 rounded-lg border px-3 py-2 text-sm"
      >
        {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Update
      </button>
    </div>
  );
}
