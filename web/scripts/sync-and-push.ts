import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { syncFromGoogleSheet } from "../src/lib/syncDataFiles";

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(webDir, "..");

async function main() {
  console.log("Fetching from Google Sheet…");
  const result = await syncFromGoogleSheet();

  if (!result.ok) {
    console.error("Sync failed:", result.message);
    process.exit(1);
  }

  console.log(
    `Synced ${result.recordCount} records (${result.needLoanYes} need loan) at ${result.asOf}`,
  );

  const files = [
    "web/src/data/students.json",
    "web/src/lib/syncTimestamp.ts",
  ];

  execSync(`git add ${files.join(" ")}`, { cwd: repoRoot, stdio: "inherit" });

  const status = execSync("git status --porcelain", {
    cwd: repoRoot,
    encoding: "utf-8",
  }).trim();

  if (!status) {
    console.log("No changes to commit — data already up to date.");
    return;
  }

  const msg = `chore: sync loan data (${result.recordCount} records, ${result.asOf})`;
  execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, {
    cwd: repoRoot,
    stdio: "inherit",
  });

  console.log("Pushing to origin main…");
  execSync("git push origin main", { cwd: repoRoot, stdio: "inherit" });
  console.log("Done — Vercel will deploy automatically.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
