import type { RawStudent } from "./types";

export const MIN_STUDENT_ROWS = 100;
export const MIN_NEED_LOAN_YES = 20;
export const MAX_ROW_DROP_RATIO = 0.5;

const REQUIRED_HEADER_PARTS = [
  ["name"],
  ["loan required"],
  ["campus"],
  // Loan Stage was removed; Loan Status lives in column AI.
  ["loan status"],
] as const;

/** 0-based index of Google Sheet column AI (A=0 … AI=34). */
const LOAN_STATUS_COL_AI = 34;

/** Coarse Loan Stage values used by analytics when the sheet column is gone. */
function deriveLoanStageFromStatus(
  loanStatus: string | null,
  loanRequired: string | null,
): string | null {
  const W = (loanStatus ?? "").toLowerCase();
  const H = (loanRequired ?? "").toLowerCase();
  if (W.includes("disbursed")) return "Disbursed";
  if (W.includes("sanctioned")) return "Loan Proccessed/Accepted";
  if (W.includes("not eligbile") || W.includes("not eligible")) return "Rejected";
  if (
    W.includes("processing") ||
    W.includes("docs pending") ||
    W.includes("state scheme")
  )
    return "Ongoing";
  if (H === "no") return "Not Required";
  if (H === "yes") return "Not even started";
  if (loanStatus) return "Ongoing";
  return null;
}

function cleanKey(k: string): string {
  return k.replace(/\n/g, " ").trim();
}

function cellStr(v: unknown): string | null {
  if (v == null || v === "") return null;
  return String(v);
}

function normalizeMobile(v: unknown): number | string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) {
    return Number.isInteger(v) ? v : Math.trunc(v);
  }
  const s = String(v).trim();
  return s || null;
}

function rowToRecord(
  headers: string[],
  row: unknown[],
): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  for (let j = 0; j < headers.length; j++) {
    rec[headers[j]] = j < row.length ? row[j] : null;
  }
  return rec;
}

function getByPartial(
  keys: string[],
  rec: Record<string, unknown>,
  ...parts: string[]
): unknown {
  for (const k of keys) {
    const kl = k.toLowerCase();
    if (parts.every((p) => kl.includes(p.toLowerCase()))) return rec[k];
  }
  return null;
}

function getExactish(
  keys: string[],
  rec: Record<string, unknown>,
  name: string,
): unknown {
  for (const k of keys) {
    if (cleanKey(k).toLowerCase() === name.toLowerCase()) return rec[k];
  }
  return null;
}

/** Prefer header "Loan Status", else sheet column AI. */
function getLoanStatus(
  headers: string[],
  keys: string[],
  rec: Record<string, unknown>,
  row: unknown[],
): string | null {
  const byExact = cellStr(getExactish(keys, rec, "Loan Status"));
  if (byExact) return byExact;

  const aiHeader = headers[LOAN_STATUS_COL_AI];
  if (aiHeader && !aiHeader.startsWith("col_")) {
    const byAiHeader = cellStr(rec[aiHeader]);
    if (byAiHeader) return byAiHeader;
  }

  if (LOAN_STATUS_COL_AI < row.length) {
    return cellStr(row[LOAN_STATUS_COL_AI]);
  }

  return cellStr(getByPartial(keys, rec, "Loan Status"));
}

export function headersFromRow(row: unknown[]): string[] {
  return row.map((h, j) =>
    h != null && String(h).trim() !== ""
      ? cleanKey(String(h))
      : `col_${j}`,
  );
}

export function validateSheetHeaders(headers: string[]): string[] {
  const missing: string[] = [];
  const lower = headers.map((h) => h.toLowerCase());
  for (const parts of REQUIRED_HEADER_PARTS) {
    const found = lower.some((h) =>
      parts.every((p) => h.includes(p)),
    );
    if (!found) missing.push(parts.join(" + "));
  }
  return missing;
}

export function transformSheetRows(values: unknown[][]): RawStudent[] {
  if (!values.length) return [];

  const headers = headersFromRow(values[0]);
  const normalized: RawStudent[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const nameCell = row[1];
    if (nameCell == null || String(nameCell).trim() === "") continue;

    const r = rowToRecord(headers, row);
    const keys = Object.keys(r);

    let sharedProp: unknown = null;
    for (const k of keys) {
      if (k.toLowerCase().includes("propelld")) {
        sharedProp = r[k];
        break;
      }
    }

    normalized.push({
      sno: (r["S. No"] as number | null) ?? null,
      name: cellStr(r["Name"]),
      mobile: normalizeMobile(r["Mobile Number"]),
      provisionalId: cellStr(r["Provisional ID"]),
      campus: cellStr(r["Campus"]),
      needLoanSst: cellStr(getByPartial(keys, r, "Need Loan")),
      criticality: cellStr(getByPartial(keys, r, "Criticality")),
      scholarship: (r["Scholarship"] as number | string | null) ?? null,
      loanAmt: (getByPartial(keys, r, "Loan Amt") as number | string | null) ?? null,
      annualIncome:
        (getByPartial(keys, r, "Annual Income") as number | string | null) ??
        null,
      incomeProof: cellStr(getByPartial(keys, r, "Income Proof")),
      sstRemarks: cellStr(getByPartial(keys, r, "SST Remarks")),
      pranjalComments: cellStr(getByPartial(keys, r, "Pranjal")),
      loanRequired: cellStr(getByPartial(keys, r, "Loan required")),
      sharedIcici:
        cellStr(getByPartial(keys, r, "Shared to ICICI")) ??
        cellStr(getExactish(keys, r, "Shared to ICICI")),
      sharedPropelld: cellStr(sharedProp),
      sharedStudy4Buddy: cellStr(getByPartial(keys, r, "Study4Buddy")),
      sharedPoonawala: cellStr(getByPartial(keys, r, "Poonawala")),
      sharedGyandhan: cellStr(getByPartial(keys, r, "GyanDhan")),
      caseStatus: cellStr(getByPartial(keys, r, "Initial Case")),
      currentCaseStatus: cellStr(getByPartial(keys, r, "CurrentCase")),
      tentativeDate: cellStr(getByPartial(keys, r, "Tentative")),
      loanStage:
        cellStr(getByPartial(keys, r, "Loan Stage")) ??
        deriveLoanStageFromStatus(
          getLoanStatus(headers, keys, r, row),
          cellStr(getByPartial(keys, r, "Loan required")),
        ),
      loanStatus: getLoanStatus(headers, keys, r, row),
      needFldg: cellStr(getByPartial(keys, r, "FLDG")),
      needVishwa: cellStr(getByPartial(keys, r, "Vishwa")),
      needVidyalakshmi:
        cellStr(getByPartial(keys, r, "Vidyalaksmi")) ??
        cellStr(getByPartial(keys, r, "Vidyalakshmi")),
      reasonNotStarted: cellStr(getByPartial(keys, r, "Reason if not")),
      semFeePaid:
        cellStr(getExactish(keys, r, "Sem Fee Paid")) ??
        cellStr(getByPartial(keys, r, "Sem Fee Paid")) ??
        (headers[40] ? cellStr(r[headers[40]]) : null),
      semFeeCampus:
        cellStr(getExactish(keys, r, "Sem Fee Campus")) ??
        cellStr(getByPartial(keys, r, "Sem Fee Campus")) ??
        (headers[41] ? cellStr(r[headers[41]]) : null),
    });
  }

  return normalized;
}

export function countNeedLoanYes(students: RawStudent[]): number {
  return students.filter(
    (s) => String(s.loanRequired ?? "").trim().toLowerCase() === "yes",
  ).length;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export function validateStudentSnapshot(
  students: RawStudent[],
  previousCount?: number,
): ValidationResult {
  if (students.length < MIN_STUDENT_ROWS) {
    return {
      ok: false,
      code: "MIN_ROWS",
      message: `Only ${students.length} rows returned (minimum ${MIN_STUDENT_ROWS}).`,
    };
  }

  const needLoan = countNeedLoanYes(students);
  if (needLoan < MIN_NEED_LOAN_YES) {
    return {
      ok: false,
      code: "NEED_LOAN_FLOOR",
      message: `Need Loan count ${needLoan} is below minimum ${MIN_NEED_LOAN_YES}.`,
    };
  }

  if (
    previousCount != null &&
    previousCount > 0 &&
    students.length < previousCount * MAX_ROW_DROP_RATIO
  ) {
    return {
      ok: false,
      code: "ROW_COUNT_DROP",
      message: `Row count dropped from ${previousCount} to ${students.length} (>50% loss).`,
    };
  }

  return { ok: true };
}

export function transformWorkbookRows(rows: unknown[][]): RawStudent[] {
  return transformSheetRows(rows);
}
