import fs from "fs/promises";
import path from "path";
import { fetchSheetCsv } from "./fetchSheetCsv";
import { parseCsvToRows } from "./parseCsv";
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

function formatAsOfLabel(d = new Date()): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  const validation = validateStudentSnapshot(students);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const asOf = formatAsOfLabel();
  const needLoanYes = countNeedLoanYes(students);

  const dataDir = path.join(process.cwd(), "src", "data");
  const libDir = path.join(process.cwd(), "src", "lib");

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, "students.json"),
    JSON.stringify(students, null, 2) + "\n",
    "utf-8",
  );

  const metaContent = `/** Snapshot metadata for the dashboard header (from last sheet sync). */
export const DATA_AS_OF = "${asOf}";
export const DATA_CYCLE = "2026 Cycle";
`;
  await fs.writeFile(path.join(libDir, "dataMeta.ts"), metaContent, "utf-8");

  return {
    ok: true,
    recordCount: students.length,
    needLoanYes,
    asOf,
  };
}
