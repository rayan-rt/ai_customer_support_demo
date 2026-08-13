export interface ParsedToolCall {
  name: string;
  args: Record<string, unknown>;
}

function extractFailedGeneration(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);

  const jsonStart = message.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const body = JSON.parse(message.slice(jsonStart)) as {
        error?: { failed_generation?: string };
        failed_generation?: string;
      };
      return body.error?.failed_generation ?? body.failed_generation ?? null;
    } catch {
      // fall through
    }
  }

  const match = message.match(/failed_generation\\?":\\?"((?:\\.|[^"\\])*)\\?"/);
  return match?.[1]?.replace(/\\"/g, '"').replace(/\\\\/g, "\\") ?? null;
}

export function parseGroqToolUseFailed(error: unknown): ParsedToolCall[] | null {
  const failedGeneration = extractFailedGeneration(error);
  if (!failedGeneration) return null;

  const calls: ParsedToolCall[] = [];
  const pattern = /<function=(\w+)\s*(\{[\s\S]*?\})\s*<\/function>/g;

  for (const match of failedGeneration.matchAll(pattern)) {
    const name = match[1];
    const rawArgs = match[2];

    try {
      calls.push({ name, args: JSON.parse(rawArgs) as Record<string, unknown> });
    } catch {
      const normalized = rawArgs.replace(/\\"/g, '"');
      try {
        calls.push({ name, args: JSON.parse(normalized) as Record<string, unknown> });
      } catch {
        // skip malformed tool args
      }
    }
  }

  return calls.length > 0 ? calls : null;
}

export function isGroqToolUseFailed(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("tool_use_failed") || message.includes("Failed to call a function");
}
