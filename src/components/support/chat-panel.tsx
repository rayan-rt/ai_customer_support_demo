"use client";

import { useEffect, useRef, useState } from "react";
import { SUGGESTED_QUESTIONS } from "@/lib/ai/prompts";
import { cn } from "@/lib/utils/cn";
import type { ToolCallInfo } from "@/types/domain";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallInfo[];
  escalated?: boolean;
}

interface SupportChatProps {
  customerId?: string;
  channel?: "web" | "simulated_whatsapp";
  title?: string;
  className?: string;
}

export function SupportChat({
  customerId,
  channel = "web",
  title = "AI Support",
  className,
}: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId, customerId, channel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat failed");

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
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white shadow-sm", className)}>
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="font-serif text-lg">{title}</h2>
        <p className="text-xs text-[var(--muted)]">Powered by AI · Tools for live data & policies</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ minHeight: 320 }}>
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted)]">Ask about policies, products, or orders.</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--foreground)]",
              )}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.toolCalls && m.toolCalls.length > 0 ? (
                <div className="mt-2 space-y-1 border-t border-black/10 pt-2 text-xs opacity-80">
                  {m.toolCalls.map((tc, j) => (
                    <p key={j}>⚙ {tc.name}</p>
                  ))}
                </div>
              ) : null}
              {m.escalated ? (
                <p className="mt-2 text-xs font-medium text-rose-700">Escalated to human support</p>
              ) : null}
            </div>
          </div>
        ))}

        {loading ? (
          <div className="text-sm text-[var(--muted)]">Thinking...</div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 border-t border-[var(--border)] p-4"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-full border border-[var(--border)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
