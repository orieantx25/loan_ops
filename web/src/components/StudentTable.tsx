"use client";

import { useMemo, useState } from "react";
import type { Student } from "@/lib/types";

function toCsv(students: Student[]): string {
  const headers = [
    "Name",
    "Mobile",
    "Provisional ID",
    "Campus",
    "Primary Vendor",
    "Vendors",
    "Stage",
    "Loan Required",
    "Critical",
    "FLDG",
    "Vidyalakshmi",
    "Pending Days",
    "Reason",
    "Comments",
  ];
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = students.map((s) =>
    [
      s.name,
      s.mobile,
      s.provisionalId,
      s.campus,
      s.primaryVendor,
      s.vendors.join("; "),
      s.stage,
      s.loanRequired,
      s.critical ? "Yes" : "No",
      s.needFldg ? "Yes" : "No",
      s.needVidyalakshmi ? "Yes" : "No",
      s.pendingDays ?? "",
      s.reasonRaw,
      s.comments,
    ]
      .map((x) => escape(String(x ?? "")))
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function rowTint(days: number | null): string {
  if (days == null) return "";
  if (days >= 30) return "row-age-hot";
  if (days >= 15) return "row-age-warm";
  return "";
}

export function StudentTable({
  title,
  students,
  empty = "No students match.",
  onSelect,
  onClearFilters,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  students: Student[];
  empty?: string;
  onSelect?: (s: Student) => void;
  onClearFilters?: () => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const sorted = useMemo(
    () =>
      [...students].sort(
        (a, b) => (b.pendingDays ?? -1) - (a.pendingDays ?? -1),
      ),
    [students],
  );

  const showBody = !collapsible || open;

  return (
    <div className="card overflow-x-auto">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 ${
          showBody ? "border-b border-sot-border/60" : ""
        }`}
      >
        {collapsible ? (
          <button
            type="button"
            className="flex items-start gap-2 text-left min-w-0 flex-1"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <span
              className="mt-0.5 text-sot-black/70 font-bold text-sm shrink-0 w-4"
              aria-hidden
            >
              {open ? "▾" : "▸"}
            </span>
            <span className="min-w-0">
              <span className="section-title block">{title}</span>
              <span className="text-[0.75rem] text-sot-black/65 mt-0.5 block">
                {sorted.length} rows
                {open ? " · sorted by pending days" : " · click to expand"}
              </span>
            </span>
          </button>
        ) : (
          <div>
            <div className="section-title">{title}</div>
            <div className="text-[0.75rem] text-sot-black/65 mt-0.5">
              {sorted.length} rows · sorted by pending days
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 shrink-0">
          {showBody ? (
            <button
              type="button"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-sot-border bg-white hover:bg-[#fafafa] disabled:opacity-40"
              disabled={sorted.length === 0}
              onClick={(e) => {
                e.stopPropagation();
                downloadCsv(
                  `${title.replace(/\s+/g, "_").toLowerCase()}.csv`,
                  toCsv(sorted),
                );
              }}
            >
              Export CSV
            </button>
          ) : null}
          {collapsible ? (
            <button
              type="button"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-sot-border bg-white hover:bg-[#fafafa]"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Collapse" : "Expand"}
            </button>
          ) : null}
        </div>
      </div>

      {showBody ? (
        <div className="card-pad pt-3">
          {sorted.length === 0 ? (
            <div className="py-6 text-center">
              <div className="text-sot-black/70 mb-3">{empty}</div>
              {onClearFilters ? (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-sm font-semibold text-sot-red underline-offset-2 hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <table className="table-sot">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Campus</th>
                  <th>Vendor</th>
                  <th>Stage</th>
                  <th>Flags</th>
                  <th>Days</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr
                    key={s.key}
                    className={`${rowTint(s.pendingDays)} ${
                      onSelect ? "cursor-pointer" : ""
                    }`}
                    onClick={() => onSelect?.(s)}
                  >
                    <td>
                      <div className="font-semibold text-sot-black">{s.name}</div>
                      <div className="text-[0.75rem] text-sot-black/60">
                        {s.mobile || "—"}
                      </div>
                    </td>
                    <td>{s.campus}</td>
                    <td>
                      <div>{s.primaryVendor}</div>
                      {s.duplicateVendor ? (
                        <div className="badge badge-amber mt-1">
                          {s.vendorCount} vendors
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span className="badge">{s.stage}</span>
                    </td>
                    <td className="space-x-1">
                      {s.critical ? (
                        <span className="badge badge-red">Critical</span>
                      ) : null}
                      {s.needFldg ? (
                        <span className="badge badge-red">FLDG</span>
                      ) : null}
                      {s.needVidyalakshmi ? (
                        <span className="badge badge-amber">Vidyalakshmi</span>
                      ) : null}
                    </td>
                    <td className="font-semibold tabular-nums">
                      {s.pendingDays ?? "—"}
                    </td>
                    <td className="text-sot-black/60 whitespace-nowrap">
                      {s.provisionalId || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  );
}
