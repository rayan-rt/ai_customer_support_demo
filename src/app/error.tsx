"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isConnectionError =
    error.message.includes("fetch failed") ||
    error.message.includes("ENOTFOUND") ||
    error.message.includes("ECONNREFUSED");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-serif text-3xl text-[var(--foreground)]">
        {isConnectionError ? "Unable to reach the database" : "Something went wrong"}
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        {isConnectionError
          ? "Check your internet connection and Supabase project status, then try again."
          : "An unexpected error occurred while loading this page."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white"
      >
        Try again
      </button>
    </main>
  );
}
