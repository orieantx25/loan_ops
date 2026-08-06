import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import { syncFromGoogleSheet } from "@/lib/syncDataFiles";

function repoRoot(): string {
  return path.resolve(process.cwd(), "..");
}

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { ok: false, message: "Sync & deploy is only available in local development." },
      { status: 403 },
    );
  }

  const result = await syncFromGoogleSheet();
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  const root = repoRoot();
  const files = ["web/src/data/students.json", "web/src/lib/syncTimestamp.ts"];

  try {
    execSync(`git add ${files.join(" ")}`, { cwd: root, stdio: "pipe" });

    const status = execSync("git status --porcelain", {
      cwd: root,
      encoding: "utf-8",
    }).trim();

    if (!status) {
      return NextResponse.json({
        ...result,
        pushed: false,
        message: "Synced — no git changes to push.",
      });
    }

    const msg = `chore: sync loan data (${result.recordCount} records, ${result.asOf})`;
    execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, {
      cwd: root,
      stdio: "pipe",
    });
    execSync("git push origin main", { cwd: root, stdio: "pipe" });

    return NextResponse.json({
      ...result,
      pushed: true,
      message: "Pushed to GitHub — Vercel deploy started.",
    });
  } catch (e) {
    const err = e as { stderr?: Buffer; message?: string };
    const detail =
      err.stderr?.toString() || err.message || "Git push failed.";
    return NextResponse.json(
      {
        ok: false,
        message: `Sync OK but deploy failed: ${detail}`,
        recordCount: result.recordCount,
        asOf: result.asOf,
      },
      { status: 500 },
    );
  }
}
