import { NextResponse } from "next/server";
import fallbackStudents from "@/data/students.json";
import { fetchGoogleSheetValues } from "@/lib/fetchGoogleSheet";
import {
  buildMeta,
  getLastGood,
  setLastGood,
} from "@/lib/lastGoodCache";
import {
  countNeedLoanYes,
  headersFromRow,
  transformSheetRows,
  validateSheetHeaders,
  validateStudentSnapshot,
} from "@/lib/sheetTransform";
import type { StudentsApiResponse } from "@/lib/studentsApiTypes";
import type { RawStudent } from "@/lib/types";
import { DATA_CYCLE } from "@/lib/dataMeta";

function formatAsOf(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function staleResponse(
  students: RawStudent[],
  source: "fallback" | "cache",
  warnings: string[],
  error?: StudentsApiResponse["error"],
): StudentsApiResponse {
  const meta = buildMeta(students, source, false);
  return { students, meta, warnings, error };
}

export async function GET() {
  const warnings: string[] = [];
  const previous = getLastGood();
  const previousCount = previous?.meta.recordCount;

  const fetched = await fetchGoogleSheetValues();

  if (!fetched.ok) {
    if (previous) {
      warnings.push(
        `Live sheet unavailable (${fetched.message}). Showing last data from ${formatAsOf(previous.meta.syncedAt)}.`,
      );
      return NextResponse.json(
        staleResponse(previous.students, "cache", warnings, {
          code: fetched.code as StudentsApiResponse["error"] extends infer E
            ? E extends { code: infer C }
              ? C
              : never
            : never,
          message: fetched.message,
        }),
      );
    }

    const bundled = fallbackStudents as RawStudent[];
    warnings.push(
      `Live sheet unavailable (${fetched.message}). Showing bundled snapshot.`,
    );
    return NextResponse.json(
      staleResponse(bundled, "fallback", warnings, {
        code: fetched.code as "API_ERROR",
        message: fetched.message,
      }),
    );
  }

  const headers = headersFromRow(fetched.values[0]);
  const missingHeaders = validateSheetHeaders(headers);
  if (missingHeaders.length) {
    const msg = `Missing columns: ${missingHeaders.join(", ")}`;
    if (previous) {
      warnings.push(`${msg}. Showing last good data.`);
      return NextResponse.json(
        staleResponse(previous.students, "cache", warnings, {
          code: "SCHEMA_MISMATCH",
          message: msg,
        }),
      );
    }
    const bundled = fallbackStudents as RawStudent[];
    warnings.push(`${msg}. Showing bundled snapshot.`);
    return NextResponse.json(
      staleResponse(bundled, "fallback", warnings, {
        code: "SCHEMA_MISMATCH",
        message: msg,
      }),
    );
  }

  const students = transformSheetRows(fetched.values);
  const validation = validateStudentSnapshot(students, previousCount);

  if (!validation.ok) {
    if (previous) {
      warnings.push(`${validation.message} Update blocked — showing last good data.`);
      return NextResponse.json(
        staleResponse(previous.students, "cache", warnings, {
          code: validation.code as "VALIDATION_FAILED",
          message: validation.message,
        }),
      );
    }
    const bundled = fallbackStudents as RawStudent[];
    warnings.push(`${validation.message} Showing bundled snapshot.`);
    return NextResponse.json(
      staleResponse(bundled, "fallback", warnings, {
        code: validation.code as "VALIDATION_FAILED",
        message: validation.message,
      }),
    );
  }

  const needLoanYes = countNeedLoanYes(students);
  const meta = buildMeta(students, "google", true, needLoanYes);
  setLastGood(students, meta);

  const response: StudentsApiResponse = {
    students,
    meta,
    warnings,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "private, max-age=60",
      "X-Data-Cycle": DATA_CYCLE,
    },
  });
}
