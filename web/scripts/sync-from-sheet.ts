import { syncFromGoogleSheet } from "../src/lib/syncDataFiles";

async function main() {
  const result = await syncFromGoogleSheet();
  if (!result.ok) {
    console.error("Sync failed:", result.message);
    process.exit(1);
  }
  console.log(
    `Synced ${result.recordCount} records (${result.needLoanYes} need loan) at ${result.asOf}`,
  );
  console.log(
    "Run npm run sync:push to commit and deploy, or use Sync & deploy in the UI.",
  );
}

void main();
