"use client";

import { useRef } from "react";
import * as XLSX from "xlsx";
import { useStudentData } from "./DataProvider";
import {
  transformWorkbookRows,
  validateSheetHeaders,
  validateStudentSnapshot,
} from "@/lib/sheetTransform";

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

export function DataBanner() {
  const { warnings, error, meta, refreshing, isUploadOverride } = useStudentData();

  if (!warnings.length && !error && !refreshing && !isUploadOverride) return null;

  let tone = "bg-amber-50 border-amber-200 text-amber-950";
  if (isUploadOverride) tone = "bg-blue-50 border-blue-200 text-blue-950";
  if (error && !meta?.fresh) tone = "bg-amber-50 border-amber-200 text-amber-950";

  return (
    <div className={`rounded-lg border px-3 py-2 text-[0.78rem] leading-snug ${tone}`}>
      {refreshing ? (
        <p className="text-sot-black/70">Refreshing from live sheet…</p>
      ) : null}
      {isUploadOverride ? (
        <p>Using uploaded file for this session. Live polling is paused.</p>
      ) : null}
      {warnings.map((w) => (
        <p key={w}>{w}</p>
      ))}
      {error && !warnings.length ? <p>{error}</p> : null}
      {meta && !meta.fresh && meta.syncedAt ? (
        <p className="text-sot-black/60 mt-0.5">
          Last good data: {formatAsOf(meta.syncedAt)}
        </p>
      ) : null}
    </div>
  );
}

export function DataControls() {
  const { isUploadOverride, setUploadOverride, clearUploadOverride, refreshing } =
    useStudentData();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheetName =
      wb.SheetNames.find((n) => n.toLowerCase().includes("master")) ??
      wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    }) as unknown[][];

    if (!rows.length) {
      alert("No data found in the uploaded file.");
      return;
    }

    const headers = rows[0].map((h, j) =>
      h != null && String(h).trim() ? String(h).replace(/\n/g, " ").trim() : `col_${j}`,
    );
    const missing = validateSheetHeaders(headers);
    if (missing.length) {
      alert(`Upload rejected — missing columns: ${missing.join(", ")}`);
      return;
    }

    const students = transformWorkbookRows(rows);
    const validation = validateStudentSnapshot(students);
    if (!validation.ok) {
      alert(`Upload rejected — ${validation.message}`);
      return;
    }

    setUploadOverride(students);
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={refreshing}
        onClick={() => inputRef.current?.click()}
        className="text-[0.68rem] font-semibold px-2 py-1 rounded-md border border-white/25 text-white/90 hover:bg-white/10 transition"
      >
        Upload sheet
      </button>
      {isUploadOverride ? (
        <button
          type="button"
          onClick={clearUploadOverride}
          className="text-[0.68rem] font-semibold px-2 py-1 rounded-md border border-white/25 text-white/90 hover:bg-white/10 transition"
        >
          Use live sheet
        </button>
      ) : null}
    </div>
  );
}

export function formatSyncedAt(iso: string | undefined): string {
  if (!iso) return "—";
  return formatAsOf(iso);
}
