"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Invalid password.");
        return;
      }
      const from = params.get("from") || "/";
      router.replace(from);
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sot-bg flex items-center justify-center px-4">
      <div className="card card-pad w-full max-w-sm">
        <div className="font-display font-bold text-lg mb-1">Loan Operations</div>
        <p className="text-[0.8rem] text-sot-black/60 mb-4">
          Authorized access only. Enter the team password to continue.
        </p>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
          <label className="block">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-sot-black/60">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              className="input-sot w-full mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? (
            <p className="text-[0.78rem] text-sot-red font-semibold">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-sot-red text-white font-semibold text-sm disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sot-bg flex items-center justify-center text-sm text-sot-black/50">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
