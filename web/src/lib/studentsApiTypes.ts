import type { RawStudent } from "./types";

export type DataSource = "google" | "fallback" | "cache" | "upload";

export type StudentsApiErrorCode =
  | "SHEET_NOT_FOUND"
  | "TAB_NOT_FOUND"
  | "API_ERROR"
  | "NETWORK_ERROR"
  | "SCHEMA_MISMATCH"
  | "ROW_COUNT_DROP"
  | "MIN_ROWS"
  | "NEED_LOAN_FLOOR"
  | "VALIDATION_FAILED";

export type StudentsApiMeta = {
  syncedAt: string;
  recordCount: number;
  needLoanYes: number;
  source: DataSource;
  fresh: boolean;
};

export type StudentsApiResponse = {
  students: RawStudent[];
  meta: StudentsApiMeta;
  warnings: string[];
  error?: {
    code: StudentsApiErrorCode;
    message: string;
  };
};

export const POLL_INTERVAL_MS =
  Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS) || 5 * 60 * 1000;
