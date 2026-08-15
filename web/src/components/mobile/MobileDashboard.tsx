"use client";

import { useMemo, useState } from "react";
import type { Analytics } from "@/lib/analytics";
import { DATA_CYCLE, formatAsOfParts } from "@/lib/dataMeta";
import type { DashboardFilters, Student } from "@/lib/types";
import { DataSheetPanels } from "../DataSheetPanels";
import { DevSyncButton } from "../DevSyncButton";
import { PortalReturnButton } from "../PortalReturnButton";
import { Funnel } from "../Funnel";
import { HBarList } from "../HBarList";
import { OverlapMatrix } from "../OverlapMatrix";
import { SectionNav } from "../SectionNav";
import { StudentDrawer } from "../StudentDrawer";
import { StudentTable } from "../StudentTable";
import { MobileCampusCards } from "./MobileCampusCards";
import { MobileFilterSheet } from "./MobileFilterSheet";
import { MobileVendorList } from "./MobileVendorList";
import { FldgVidyalakshmiPanels, OpsFlagsPanels } from "../OpsFlagsPanels";

type Props = {
  filtered: Student[];
  a: Analytics;
  filters: DashboardFilters;
  setFilters: (f: DashboardFilters) => void;
  campuses: string[];
  reset: () => void;
};

export function MobileDashboard({
  filtered,
  a,
  filters,
  setFilters,
  campuses,
  reset,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const sst = a.dataSheet.initialInputSst;
  const latest = a.dataSheet.latestInput;
  const sstCount = (label: string) =>
    sst.rows.find((r) => r.label === label)?.count ?? 0;
  const sstPct = (n: number) =>
    sst.total ? `${((n / sst.total) * 100).toFixed(0)}% of leads` : undefined;
  const latestCount = (label: string) =>
    latest.rows.find((r) => r.label === label)?.count ?? 0;
  const latestPct = (n: number) =>
    latest.total ? `${((n / latest.total) * 100).toFixed(0)}% of leads` : undefined;

  const pct = (n: number) =>
    a.needLoan ? `${((n / a.needLoan) * 100).toFixed(0)}% of need` : undefined;

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.search) n++;
    if (filters.campus !== "All") n++;
    if (filters.vendor !== "All") n++;
    if (filters.stage !== "All") n++;
    if (filters.loanRequired !== "All") n++;
    if (filters.critical !== "All") n++;
    if (filters.duplicateVendor !== "All") n++;
    if (filters.attentionFlag !== "All") n++;
    return n;
  }, [filters]);

  const asOf = formatAsOfParts();

  return (
    <div className="mobile-shell min-h-screen bg-sot-bg flex flex-col">
      <header className="mobile-header shrink-0">
        <div className="mobile-header-top">
          <div className="mobile-header-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ugsot-logo.png"
              alt="uGSOT"
              className="mobile-header-logo"
            />
            <h1 className="mobile-header-title">Loan Operations</h1>
          </div>
          <div className="mobile-header-actions">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="mobile-header-filter-btn"
              aria-label="Open filters"
            >
              <span aria-hidden>⚙</span>
              {activeFilterCount > 0 ? (
                <span className="mobile-header-filter-badge">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="mobile-header-meta">
          <span className="mobile-header-meta-item">{DATA_CYCLE}</span>
          <span className="mobile-header-meta-item">
            As of {asOf.date}
            {asOf.time ? ` · ${asOf.time}` : ""}
          </span>
          <span className="mobile-header-meta-item">{a.total} records</span>
          <PortalReturnButton variant="mobile" />
        </div>

        {activeFilterCount > 0 ? (
          <div className="mobile-header-filters">
            {filtered.length} in view ·{" "}
            <button type="button" className="underline" onClick={reset}>
              clear filters
            </button>
          </div>
        ) : null}

        {process.env.NODE_ENV === "development" ? (
          <div className="mobile-header-sync">
            <DevSyncButton />
          </div>
        ) : null}

        <div className="mobile-header-nav">
          <SectionNav variant="dark" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 mobile-main-scroll space-y-6">
        <section id="summary" className="scroll-mt-48 space-y-4">
          <div className="space-y-2">
            <SectionLabel>Initial Input (By SST)</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <KpiTile label="Total Leads" value={sst.total} hero />
              <KpiTile
                label="Loan required — Yes"
                value={sstCount("Loan required — Yes")}
                hint={sstPct(sstCount("Loan required — Yes"))}
                tone="red"
              />
              <KpiTile
                label="Loan required — No"
                value={sstCount("Loan required — No")}
                hint={sstPct(sstCount("Loan required — No"))}
              />
              <KpiTile
                label="Drop"
                value={sstCount("Drop")}
                hint={sstPct(sstCount("Drop"))}
                tone="amber"
              />
              <KpiTile
                label="DNR"
                value={sstCount("DNR")}
                hint={sstPct(sstCount("DNR"))}
                tone="red"
              />
              <KpiTile
                label="Blanks"
                value={sstCount("Blanks")}
                hint={sstPct(sstCount("Blanks"))}
                tone="amber"
              />
            </div>
            {sstCount("Any other input") > 0 ? (
              <KpiTile
                label="Any other input"
                value={sstCount("Any other input")}
                hint={sstPct(sstCount("Any other input"))}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <SectionLabel>Pipeline health</SectionLabel>
            <KpiTile label="Need Loan" value={a.needLoan} hero tone="red" />
            <div className="grid grid-cols-2 gap-2">
              <KpiTile
                label="Processing"
                value={a.processing}
                hint={pct(a.processing)}
                tone="blue"
              />
              <KpiTile
                label="Sanctioned"
                value={a.sanctioned}
                hint={pct(a.sanctioned)}
                tone="green"
              />
              <KpiTile
                label="Disbursed"
                value={a.disbursed}
                hint={pct(a.disbursed)}
                tone="green"
              />
              <KpiTile
                label="Rejected"
                value={a.rejected}
                hint={pct(a.rejected)}
                tone="red"
              />
              <KpiTile
                label="Initially Yes but Now No"
                value={latestCount("Initially Yes but Now No")}
                hint={latestPct(latestCount("Initially Yes but Now No"))}
                tone="amber"
              />
              <KpiTile
                label="Initially Yes but not sure"
                value={latestCount("Initially Yes but not sure")}
                hint={latestPct(latestCount("Initially Yes but not sure"))}
                tone="amber"
              />
            </div>
          </div>

          <div className="space-y-2">
            <SectionLabel>Sem fee paid</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <KpiTile
                label="Sem Fee Paid"
                value={a.semFeePaidTotal}
                tone="green"
              />
              <KpiTile
                label="Sem Fee paid - Varified"
                value={a.semFeePaidYes}
                tone="green"
              />
              <KpiTile
                label="Sem fee paid - under review"
                value={a.semFeePaidUnderReview}
                tone="amber"
              />
            </div>
            {a.semFeePaidByCampus.length > 0 ? (
              <div className="card card-pad space-y-2">
                <div className="text-[0.75rem] font-semibold">By campus</div>
                {a.semFeePaidByCampus.map((r) => (
                  <div
                    key={r.campus}
                    className="flex justify-between text-[0.8rem]"
                  >
                    <span>{r.campus}</span>
                    <span className="font-semibold">{r.count}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <SectionLabel>Attention needed</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <KpiTile label="Risk Cases" value={a.riskCases} tone="red" />
              <KpiTile
                label="Risk to Control"
                value={a.riskToControl}
                tone="green"
                hint={
                  a.riskCases
                    ? `${a.riskToControl}/${a.riskCases} initial risk`
                    : undefined
                }
              />
              <KpiTile
                label="Risk · Sem Fee Paid"
                value={a.riskCasesSemFeePaid}
                tone="green"
                hint={
                  a.riskCases
                    ? `${a.riskCasesSemFeePaid}/${a.riskCases} risk`
                    : undefined
                }
              />
              <KpiTile label="Need FLDG" value={a.needFldg} tone="red" />
              <KpiTile
                label="Need Vidyalakshmi"
                value={a.needVidyalakshmi}
                tone="amber"
              />
              <KpiTile label="Not Started" value={a.notStarted} tone="amber" />
              <KpiTile label="Dup Vendors" value={a.dupVendors} tone="amber" />
            </div>
          </div>

          <button
            type="button"
            className="text-[0.75rem] font-semibold text-sot-black/70 underline-offset-2 hover:underline"
            onClick={() => setMoreOpen((o) => !o)}
          >
            {moreOpen ? "Hide more metrics" : "More metrics"}
          </button>
          {moreOpen ? (
            <div className="grid grid-cols-2 gap-2">
              <KpiTile label="Total Students" value={a.total} />
              <KpiTile label="With Vendor" value={a.withVendor} />
              <KpiTile label="Avg Vendors" value={a.avgVendors.toFixed(2)} />
              <KpiTile label="Docs Pending" value={a.docsPending} />
            </div>
          ) : null}
        </section>

        <section id="fldg" className="scroll-mt-48 space-y-3">
          <FldgVidyalakshmiPanels ops={a.opsFlags} />
        </section>

        <section id="vendors" className="scroll-mt-48 space-y-3">
          <SectionLabel>Vendors</SectionLabel>
          <MobileVendorList stats={a.vendorStats} />
          <HBarList
            title="Vendors per Student"
            subtitle="Fixes duplicate counting illusion"
            items={a.vendorDist.map((r) => ({
              label: r.label,
              count: r.count,
            }))}
          />
          <div className="mobile-card">
            <div className="font-display font-bold text-sm mb-2">
              Unique vs Applications
            </div>
            <div className="grid grid-cols-2 gap-2 text-[0.8rem]">
              <StatBlock label="Unique with vendor" value={a.withVendor} />
              <StatBlock label="Total applications" value={a.totalApps} />
              <StatBlock label="Multi-vendor students" value={a.dupVendors} />
              <StatBlock
                label="Avg vendors / shared"
                value={a.avgVendors.toFixed(2)}
              />
            </div>
          </div>
        </section>

        <section id="campus" className="scroll-mt-48 space-y-3">
          <SectionLabel>Campus</SectionLabel>
          <MobileCampusCards rows={a.campuses} />
        </section>

        <section id="intake" className="scroll-mt-48 space-y-3">
          <SectionLabel>Intake</SectionLabel>
          <DataSheetPanels
            initialInputSst={a.dataSheet.initialInputSst}
            latestInput={a.dataSheet.latestInput}
            loanBifurcation={a.dataSheet.loanBifurcation}
            reasonsNotStarted={a.dataSheet.reasonsNotStarted}
            initialCaseStatus={a.dataSheet.initialCaseStatus}
            currentCaseStatus={a.dataSheet.currentCaseStatus}
          />
        </section>

        <section id="pipeline" className="scroll-mt-48 space-y-3">
          <SectionLabel>Pipeline</SectionLabel>
          <Funnel rows={a.funnel} />
          <HBarList
            title="Loan Status Distribution"
            subtitle="Canonical stage — one stage per student"
            items={a.stageDist.map((s) => ({
              label: s.stage,
              count: s.count,
            }))}
            useStageColors
          />
        </section>

        <section id="risk" className="scroll-mt-48 space-y-3">
          <SectionLabel>Risk</SectionLabel>
          <HBarList
            title="Risk Dashboard"
            items={a.risk.map((r) => ({
              label: r.flag,
              count: r.count,
            }))}
            accent
          />
        </section>

        <section id="ops" className="scroll-mt-48 space-y-3">
          <OpsFlagsPanels ops={a.opsFlags} />
        </section>

        <section id="students" className="scroll-mt-48 space-y-3 pb-8">
          <SectionLabel>Students</SectionLabel>
          <StudentTable
            title="Top Pending Students"
            students={a.topPending}
            onSelect={setSelected}
            onClearFilters={reset}
            collapsible
            defaultOpen={false}
          />
          <StudentTable
            title="Need FLDG Attention"
            students={filtered.filter((s) => s.needFldg)}
            onSelect={setSelected}
            onClearFilters={reset}
            collapsible
            defaultOpen={false}
          />
          <StudentTable
            title="Need Vidyalakshmi Attention"
            students={filtered.filter((s) => s.needVidyalakshmi)}
            onSelect={setSelected}
            onClearFilters={reset}
            collapsible
            defaultOpen={false}
          />
          <StudentTable
            title="Needs Vishwa's attention"
            students={filtered.filter((s) => s.needVishwa)}
            onSelect={setSelected}
            onClearFilters={reset}
            collapsible
            defaultOpen={false}
          />
          <StudentTable
            title="Might drop"
            students={filtered.filter((s) =>
              s.dropStatus.toLowerCase().includes("might drop"),
            )}
            onSelect={setSelected}
            onClearFilters={reset}
            collapsible
            defaultOpen={false}
          />
          <StudentTable
            title="Critical Cases"
            students={filtered.filter((s) => s.critical)}
            onSelect={setSelected}
            onClearFilters={reset}
            collapsible
            defaultOpen={false}
          />
          <div className="space-y-3">
            <div className="font-display text-sm font-bold text-sot-black">
              Multi-vendor
            </div>
            <OverlapMatrix overlap={a.overlap} />
            <StudentTable
              title="Duplicate Vendor Students"
              students={filtered
                .filter((s) => s.duplicateVendor)
                .sort((x, y) => y.vendorCount - x.vendorCount)}
              onSelect={setSelected}
              onClearFilters={reset}
              collapsible
              defaultOpen={false}
            />
          </div>
        </section>
      </main>

      <MobileFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        campuses={campuses}
        resultCount={filtered.length}
      />

      <StudentDrawer
        student={selected}
        onClose={() => setSelected(null)}
        mobile
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="section-label font-display text-sm font-bold text-sot-black">
      {children}
    </h2>
  );
}

function KpiTile({
  label,
  value,
  hint,
  tone = "neutral",
  hero,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "red" | "amber" | "green" | "blue";
  hero?: boolean;
}) {
  const toneClass = {
    neutral: "border-sot-border",
    red: "border-l-4 border-l-sot-red",
    amber: "border-l-4 border-l-sot-amber",
    green: "border-l-4 border-l-sot-green",
    blue: "border-l-4 border-l-[#2563eb]",
  }[tone];

  return (
    <div className={`mobile-card ${toneClass} ${hero ? "col-span-2" : ""}`}>
      <div className="text-[0.62rem] uppercase tracking-wide text-sot-black/55 font-semibold leading-snug">
        {label}
      </div>
      <div
        className={`font-display font-bold tabular-nums mt-0.5 ${
          hero ? "text-3xl" : "text-xl"
        }`}
      >
        {value}
      </div>
      {hint ? (
        <div className="text-[0.65rem] text-sot-black/50 mt-0.5">{hint}</div>
      ) : null}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-[#f5f5f5] p-2">
      <div className="text-[0.62rem] uppercase text-sot-black/50">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
