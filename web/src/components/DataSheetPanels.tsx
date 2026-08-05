"use client";

import { Fragment, useState } from "react";
import type { DataSheetRow } from "@/lib/analytics";

const LATEST_PRIMARY = new Set([
  "Yes",
  "No",
  "Drop",
  "DNP",
  "Not Sure",
  "Blanks",
  "Any other Input",
]);

function DataCountCard({
  title,
  subtitle,
  rows,
  footer,
  scrollBody,
  sections,
}: {
  title: string;
  subtitle?: string;
  rows?: DataSheetRow[];
  footer?: { label: string; count: number };
  scrollBody?: boolean;
  sections?: { label?: string; rows: DataSheetRow[] }[];
}) {
  return (
    <div className="card card-pad flex flex-col h-full min-h-0">
      <div className="section-title text-[0.95rem] leading-tight">{title}</div>
      {subtitle ? (
        <p className="text-[0.72rem] mt-0.5 mb-2 leading-snug text-sot-black/65">
          {subtitle}
        </p>
      ) : null}
      <div
        className={
          scrollBody ? "flex-1 min-h-0 max-h-[280px] overflow-y-auto -mx-0.5 px-0.5" : ""
        }
      >
        <table className="w-full text-[0.8rem]">
          <thead>
            <tr className="border-b border-sot-border">
              <th className="py-1.5 pr-2 text-left text-[0.65rem] uppercase tracking-wide font-semibold text-sot-black/60">
                Category
              </th>
              <th className="py-1.5 text-right text-[0.65rem] uppercase tracking-wide font-semibold text-sot-black/60 w-12">
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {sections
              ? sections.map((section, si) => (
                  <Fragment key={si}>
                    {section.label ? (
                      <tr className="border-t border-sot-border/50">
                        <td
                          colSpan={2}
                          className="pt-2 pb-1 text-[0.68rem] font-semibold uppercase tracking-wide text-sot-black/55"
                        >
                          {section.label}
                        </td>
                      </tr>
                    ) : null}
                    {section.rows.map((row, i) => (
                      <DataRow key={`${section.label}-${row.label}-${i}`} row={row} />
                    ))}
                  </Fragment>
                ))
              : rows?.map((row, i) => (
                  <DataRow key={`${row.label}-${i}`} row={row} />
                ))}
          </tbody>
          {!scrollBody && footer ? (
            <tfoot>
              <tr className="border-t border-sot-border font-bold text-sot-black">
                <td className="py-2 pr-2">{footer.label}</td>
                <td className="py-2 text-right tabular-nums w-12">{footer.count}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {scrollBody && footer ? (
        <table className="w-full text-[0.8rem] border-t border-sot-border mt-1">
          <tfoot>
            <tr className="font-bold text-sot-black">
              <td className="py-2 pr-2">{footer.label}</td>
              <td className="py-2 text-right tabular-nums w-12">{footer.count}</td>
            </tr>
          </tfoot>
        </table>
      ) : null}
    </div>
  );
}

function DataRow({ row }: { row: DataSheetRow }) {
  if (row.spacer) return null;
  return (
    <tr className="border-b border-sot-border/35 last:border-0">
      <td
        className={`py-1.5 pr-2 leading-snug text-sot-black ${
          row.indent
            ? "border-l-2 border-sot-border/60 pl-2.5 ml-0.5 text-[0.75rem]"
            : ""
        } ${row.groupHeader ? "font-semibold pt-2 first:pt-0" : ""}`}
      >
        {row.label}
      </td>
      <td
        className={`py-1.5 text-right font-semibold tabular-nums w-12 shrink-0 text-sot-black ${
          row.groupHeader ? "font-bold" : ""
        }`}
      >
        {row.count}
      </td>
    </tr>
  );
}

function CollapsibleCountList({
  title,
  subtitle,
  rows,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  rows: DataSheetRow[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const total = rows.reduce((a, r) => a + r.count, 0);

  return (
    <div className="card card-pad">
      <button
        type="button"
        className="flex items-start gap-2 text-left w-full"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span
          className="mt-0.5 text-sot-black/70 font-bold text-sm shrink-0 w-4"
          aria-hidden
        >
          {open ? "▾" : "▸"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="section-title text-[0.95rem] leading-tight block">
            {title}
          </span>
          {subtitle ? (
            <span className="text-[0.72rem] mt-0.5 block leading-snug text-sot-black/65">
              {subtitle}
            </span>
          ) : null}
          <span className="text-[0.72rem] mt-0.5 block text-sot-black/55">
            {rows.length} values · {total} students
          </span>
        </span>
      </button>
      {open ? (
        <div className="mt-2 border-t border-sot-border/50 pt-2">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-sot-border">
                <th className="py-1 pr-2 text-left text-[0.65rem] uppercase tracking-wide font-semibold text-sot-black/60">
                  Status
                </th>
                <th className="py-1 text-right text-[0.65rem] uppercase tracking-wide font-semibold text-sot-black/60 w-12">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-sot-border/35 last:border-0"
                >
                  <td className="py-1.5 pr-2 leading-snug text-sot-black">
                    {row.label}
                  </td>
                  <td className="py-1.5 text-right font-semibold tabular-nums w-12 shrink-0 text-sot-black">
                    {row.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function InlineCollapsible({
  title,
  rows,
  defaultOpen = false,
}: {
  title: string;
  rows: DataSheetRow[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!rows.length) return null;

  return (
    <div className="mt-2 pt-2 border-t border-sot-border/50">
      <button
        type="button"
        className="flex items-center gap-2 text-left w-full text-[0.75rem] font-semibold text-sot-black/80"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span aria-hidden>{open ? "▾" : "▸"}</span>
        {title} ({rows.length})
      </button>
      {open ? (
        <table className="w-full text-[0.78rem] mt-1.5">
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-sot-border/35 last:border-0"
              >
                <td className="py-1 pr-2 leading-snug text-sot-black">
                  {row.label}
                </td>
                <td className="py-1 text-right font-semibold tabular-nums w-10 shrink-0">
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

export function DataSheetPanels({
  initialInputSst,
  latestInput,
  loanBifurcation,
  reasonsNotStarted,
  initialCaseStatus,
  currentCaseStatus,
}: {
  initialInputSst: { rows: DataSheetRow[]; total: number };
  latestInput: { rows: DataSheetRow[]; total: number };
  loanBifurcation: {
    rows: DataSheetRow[];
    total: number;
    reconcileSum: number;
  };
  reasonsNotStarted: {
    fixedBuckets: DataSheetRow[];
    extraBuckets: DataSheetRow[];
    detail: DataSheetRow[];
    total: number;
  };
  initialCaseStatus: DataSheetRow[];
  currentCaseStatus: DataSheetRow[];
}) {
  const latestPrimary = latestInput.rows.filter((r) =>
    LATEST_PRIMARY.has(r.label),
  );
  const latestDrift = latestInput.rows.filter(
    (r) => !LATEST_PRIMARY.has(r.label),
  );

  return (
    <section className="space-y-3">
      <p className="text-[0.72rem] text-sot-black/65 -mt-1">
        SST intake, latest loan-required input, pipeline bifurcation, and
        not-started reasons.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        <DataCountCard
          title="Initial Input (By SST)"
          subtitle="Need Loan (SST input)"
          rows={initialInputSst.rows}
          footer={{ label: "Total Leads", count: initialInputSst.total }}
        />
        <DataCountCard
          title="Latest Input"
          subtitle="Loan required (Latest)"
          scrollBody
          sections={[
            { rows: latestPrimary },
            { label: "SST → Latest drift", rows: latestDrift },
          ]}
          footer={{ label: "Total Leads", count: latestInput.total }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        <DataCountCard
          title="Require loan bifurcation"
          subtitle="Loan required (Latest) = Yes"
          rows={loanBifurcation.rows}
          footer={{
            label: "Bifurcation total",
            count: loanBifurcation.total,
          }}
        />
        <div className="card card-pad flex flex-col h-full">
          <div className="section-title text-[0.95rem] leading-tight">
            Reasons for Not Started
          </div>
          <p className="text-[0.72rem] mt-0.5 mb-2 leading-snug text-sot-black/65">
            Latest = Yes & stage = Not even started
          </p>
          <div className="flex-1 min-h-0 max-h-[280px] overflow-y-auto -mx-0.5 px-0.5">
            <table className="w-full text-[0.8rem]">
              <thead>
                <tr className="border-b border-sot-border">
                  <th className="py-1.5 pr-2 text-left text-[0.65rem] uppercase tracking-wide font-semibold text-sot-black/60">
                    Bucket
                  </th>
                  <th className="py-1.5 text-right text-[0.65rem] uppercase tracking-wide font-semibold text-sot-black/60 w-12">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {reasonsNotStarted.fixedBuckets.map((row) => (
                  <DataRow key={row.label} row={row} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-sot-border font-bold text-sot-black">
                  <td className="py-2 pr-2">Not started</td>
                  <td className="py-2 text-right tabular-nums">
                    {reasonsNotStarted.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <InlineCollapsible
            title="Other reasons"
            rows={reasonsNotStarted.extraBuckets}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        <CollapsibleCountList
          title="Initial Case Status"
          subtitle="Master data — Initial Case Status"
          rows={initialCaseStatus}
          defaultOpen={false}
        />
        <CollapsibleCountList
          title="Current Case Status"
          subtitle="Master data — CurrentCase Status (started on 31/7)"
          rows={currentCaseStatus}
          defaultOpen={false}
        />
      </div>

      {reasonsNotStarted.detail.length > 0 ? (
        <CollapsibleCountList
          title="Raw reasons (top entries)"
          subtitle='Exact text from "Reason if not started"'
          rows={reasonsNotStarted.detail}
          defaultOpen={false}
        />
      ) : null}
    </section>
  );
}
