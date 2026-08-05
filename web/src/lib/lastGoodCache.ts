import type { RawStudent } from "./types";
import type { DataSource, StudentsApiMeta } from "./studentsApiTypes";

type CacheEntry = {
  students: RawStudent[];
  meta: StudentsApiMeta;
};

let lastGood: CacheEntry | null = null;

export function getLastGood(): CacheEntry | null {
  return lastGood;
}

export function setLastGood(students: RawStudent[], meta: StudentsApiMeta): void {
  lastGood = { students, meta };
}

export function buildMeta(
  students: RawStudent[],
  source: DataSource,
  fresh: boolean,
  needLoanYes?: number,
): StudentsApiMeta {
  return {
    syncedAt: new Date().toISOString(),
    recordCount: students.length,
    needLoanYes: needLoanYes ?? countNeedLoan(students),
    source,
    fresh,
  };
}

function countNeedLoan(students: RawStudent[]): number {
  return students.filter(
    (s) => String(s.loanRequired ?? "").trim().toLowerCase() === "yes",
  ).length;
}
