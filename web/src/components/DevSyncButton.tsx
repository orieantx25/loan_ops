"use client";

import { useState } from "react";

const isDev = process.env.NODE_ENV === "development";

export function DevSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isDev) return null;

  const onSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        recordCount?: number;
        asOf?: string;
      };

      if (!res.ok || !data.ok) {
        setMessage(data.message ?? "Sync failed.");
        return;
      }

      setMessage(
        `Synced ${data.recordCount} records (${data.asOf}). Reloading…`,
      );
      window.setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void onSync()}
        disabled={syncing}
        className="text-[0.68rem] font-semibold px-2 py-1 rounded-md border border-white/25 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
        title="Fetch latest from Google Sheet and update students.json (dev only)"
      >
        {syncing ? "Syncing…" : "Sync sheet"}
      </button>
      {message ? (
        <span className="text-[0.62rem] text-white/60 max-w-[200px] text-right leading-tight">
          {message}
        </span>
      ) : null}
    </div>
  );
}
