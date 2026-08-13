"use client";

import { useState } from "react";
import type { Customer } from "@/types/database";
import type { ToolCallInfo } from "@/types/domain";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallInfo[];
  escalated?: boolean;
}

export function WhatsAppSimulator({ customers }: { customers: Customer[] }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();

  async function send() {
    if (!input.trim() || !customerId || loading) return;
    const text = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/simulators/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, customerId, conversationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          toolCalls: data.toolCalls,
          escalated: data.escalated,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: err instanceof Error ? err.message : "Error" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white">
      <div className="border-b p-4">
        <label className="text-sm font-medium">Demo Customer</label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
          ))}
        </select>
      </div>
      <div className="h-80 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
            <div
              className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 ${
                m.role === "user" ? "bg-emerald-600 text-white" : "bg-zinc-100"
              }`}
            >
              {m.content}
              {m.toolCalls?.length ? (
                <p className="mt-1 text-xs opacity-70">
                  Tools: {m.toolCalls.map((t) => t.name).join(", ")}
                </p>
              ) : null}
              {m.escalated ? <p className="mt-1 text-xs text-rose-600">Escalated</p> : null}
            </div>
          </div>
        ))}
        {loading ? <p className="text-sm text-zinc-400">AI typing...</p> : null}
      </div>
      <div className="flex gap-2 border-t p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a WhatsApp message..."
          className="flex-1 rounded-full border px-4 py-2 text-sm"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading}
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
