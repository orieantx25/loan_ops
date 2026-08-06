import fs from "fs/promises";
import path from "path";
import { fetchSheetCsv } from "./fetchSheetCsv";
import { parseCsvToRows } from "./parseCsv";
import type { RawStudent } from "./types";
import {
  countNeedLoanYes,
  headersFromRow,
  transformSheetRows,
  validateSheetHeaders,
  validateStudentSnapshot,
} from "./sheetTransform";

export type SyncResult =
  | {
      ok: true;
      recordCount: number;
      needLoanYes: number;
      asOf: string;
    }
  | { ok: false; message: string };

async function readExistingStudentCount(): Promise<number | undefined> {
  try {
    const p = path.join(process.cwd(), "src", "data", "students.json");
    const raw = await fs.readFile(p, "utf-8");
    const students = JSON.parse(raw) as RawStudent[];
    return students.length > 0 ? students.length : undefined;
  } catch {
    return undefined;
  }
}

export async function syncFromGoogleSheet(): Promise<SyncResult> {
  const fetched = await fetchSheetCsv();
  if (!fetched.ok) return { ok: false, message: fetched.message };

  const values = parseCsvToRows(fetched.csv);
  if (!values.length) {
    return { ok: false, message: "No rows found in sheet export." };
  }

  const headers = headersFromRow(values[0]);
  const missing = validateSheetHeaders(headers);
  if (missing.length) {
    return {
      ok: false,
      message: `Missing columns: ${missing.join(", ")}`,
    };
  }

  const students = transformSheetRows(values);
  const previousCount = await readExistingStudentCount();
  const validation = validateStudentSnapshot(students, previousCount);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const syncedAt = new Date().toISOString();
  const needLoanYes = countNeedLoanYes(students);

  const dataDir = path.join(process.cwd(), "src", "data");
  const libDir = path.join(process.cwd(), "src", "lib");

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, "students.json"),
    JSON.stringify(students, null, 2) + "\n",
    "utf-8",
  );

  const timestampContent = `/** ISO timestamp of last sheet sync — updated by Sync sheet / extract. */
export const DATA_SYNCED_AT = "${syncedAt}";
`;
  await fs.writeFile(
    path.join(libDir, "syncTimestamp.ts"),
    timestampContent,
    "utf-8",
  );

  const asOf = new Date(syncedAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    ok: true,
    recordCount: students.length,
    needLoanYes,
    asOf,
  };
}
