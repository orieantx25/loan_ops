"use client";

import { useState } from "react";

const isDev = process.env.NODE_ENV === "development";

export function DevSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isDev) return null;

  const onSync = async (push: boolean) => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch(push ? "/api/sync-push" : "/api/sync", {
        method: "POST",
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        recordCount?: number;
        asOf?: string;
        pushed?: boolean;
      };

      if (!res.ok || !data.ok) {
        setMessage(data.message ?? "Sync failed.");
        return;
      }

      if (push && data.pushed) {
        setMessage(
          `Deployed ${data.recordCount} records (${data.asOf}). Reloading…`,
        );
        window.setTimeout(() => window.location.reload(), 800);
        return;
      }

      if (push && !data.pushed) {
        setMessage(data.message ?? "Synced — no changes to push.");
        window.setTimeout(() => window.location.reload(), 800);
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
    <div className="dev-sync-wrap flex flex-col items-end gap-1">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => void onSync(false)}
          disabled={syncing}
          className="text-[0.68rem] font-semibold px-2 py-1 rounded-md border border-white/25 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
          title="Fetch sheet and update local students.json"
        >
          {syncing ? "…" : "Sync"}
        </button>
        <button
          type="button"
          onClick={() => void onSync(true)}
          disabled={syncing}
          className="text-[0.68rem] font-semibold px-2 py-1 rounded-md border border-sot-red bg-sot-red text-white hover:bg-[#c41820] transition disabled:opacity-50"
          title="Sync sheet, commit, push to GitHub, and trigger Vercel deploy"
        >
          {syncing ? "Deploying…" : "Sync & deploy"}
        </button>
      </div>
      {message ? (
        <span className="text-[0.62rem] text-white/60 max-w-[220px] text-right leading-tight">
          {message}
        </span>
      ) : null}
    </div>
  );
}
