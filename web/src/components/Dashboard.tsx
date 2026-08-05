"use client";

import { useMemo, useState } from "react";
import {
  applyFilters,
  campusOptions,
  computeAnalytics,
  enrichStudents,
} from "@/lib/analytics";
import { DATA_AS_OF, DATA_CYCLE } from "@/lib/dataMeta";
import type { DashboardFilters, RawStudent, Student } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";
import { Filters } from "./Filters";
import { KpiCard } from "./KpiCard";
import { Funnel } from "./Funnel";
import { VendorGrid } from "./VendorGrid";
import { OverlapMatrix } from "./OverlapMatrix";
import { CampusTable } from "./CampusTable";
import { DataSheetPanels } from "./DataSheetPanels";
import { HBarList } from "./HBarList";
import { StudentTable } from "./StudentTable";
import { StudentDrawer } from "./StudentDrawer";
import { SectionNav } from "./SectionNav";
import { DevSyncButton } from "./DevSyncButton";

export function Dashboard({ raw }: { raw: RawStudent[] }) {
  const all = useMemo(() => enrichStudents(raw), [raw]);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<Student | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const campuses = useMemo(() => campusOptions(all), [all]);
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);
  const a = useMemo(() => computeAnalytics(filtered), [filtered]);

  const pct = (n: number) =>
    a.needLoan ? `${((n / a.needLoan) * 100).toFixed(0)}% of need` : undefined;

  const sst = a.dataSheet.initialInputSst;
  const sstCount = (label: string) =>
    sst.rows.find((r) => r.label === label)?.count ?? 0;
  const sstPct = (n: number) =>
    sst.total ? `${((n / sst.total) * 100).toFixed(0)}% of leads` : undefined;

  const latest = a.dataSheet.latestInput;
  const latestCount = (label: string) =>
    latest.rows.find((r) => r.label === label)?.count ?? 0;
  const latestPct = (n: number) =>
    latest.total ? `${((n / latest.total) * 100).toFixed(0)}% of leads` : undefined;

  const reset = () => setFilters({ ...DEFAULT_FILTERS });

  const toggleFilter = (patch: Partial<DashboardFilters>) => {
    const next = { ...DEFAULT_FILTERS, ...patch };
    const same =
      filters.campus === next.campus &&
      filters.vendor === next.vendor &&
      filters.stage === next.stage &&
      filters.critical === next.critical &&
      filters.loanRequired === next.loanRequired &&
      filters.duplicateVendor === next.duplicateVendor &&
      filters.attentionFlag === next.attentionFlag &&
      filters.search === next.search;
    setFilters(same ? { ...DEFAULT_FILTERS } : next);
  };

  return (
    <div className="min-h-screen bg-sot-bg">
      <header className="bg-sot-black text-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ugsot-logo.png"
              alt="upGrad School of Technology"
              width={220}
              height={68}
              className="h-10 sm:h-11 w-auto max-w-[240px] object-contain object-left shrink-0"
            />
            <div className="hidden sm:block border-l border-white/15 pl-3 min-w-0">
              <h1 className="font-display text-base font-bold tracking-tight leading-none">
                Loan Operations
              </h1>
            </div>
          </div>
          <div className="flex gap-4 sm:gap-5 text-right shrink-0 items-center">
            <DevSyncButton />
            <Meta label="Cycle" value={DATA_CYCLE} />
            <Meta label="As of" value={DATA_AS_OF} />
            <Meta label="Records" value={String(a.total)} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4 space-y-4">
        <Filters
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          campuses={campuses}
        />
        <SectionNav />

        <section id="summary" className="scroll-mt-4 space-y-3">
          <SectionLabel>Initial Input (By SST)</SectionLabel>
          <div className="kpi-scroll flex md:grid md:grid-cols-6 gap-3 overflow-x-auto pb-1">
            <KpiCard label="Total Leads" value={sst.total} hero tone="neutral" />
            <KpiCard
              label="Loan required — Yes"
              value={sstCount("Loan required — Yes")}
              tone="red"
              hint={sstPct(sstCount("Loan required — Yes"))}
            />
            <KpiCard
              label="Loan required — No"
              value={sstCount("Loan required — No")}
              tone="neutral"
              hint={sstPct(sstCount("Loan required — No"))}
            />
            <KpiCard
              label="Drop"
              value={sstCount("Drop")}
              tone="amber"
              hint={sstPct(sstCount("Drop"))}
            />
            <KpiCard
              label="DNR"
              value={sstCount("DNR")}
              tone="red"
              hint={sstPct(sstCount("DNR"))}
            />
            <KpiCard
              label="Blanks"
              value={sstCount("Blanks")}
              tone="amber"
              hint={sstPct(sstCount("Blanks"))}
            />
          </div>
          {sstCount("Any other input") > 0 ? (
            <div className="kpi-scroll flex gap-3 overflow-x-auto pb-1">
              <KpiCard
                label="Any other input"
                value={sstCount("Any other input")}
                tone="neutral"
                hint={sstPct(sstCount("Any other input"))}
              />
            </div>
          ) : null}

          <SectionLabel>Pipeline health</SectionLabel>
          <div className="kpi-scroll flex md:grid md:grid-cols-7 gap-3 overflow-x-auto pb-1">
            <KpiCard
              label="Need Loan"
              value={a.needLoan}
              hero
              tone="red"
              active={filters.loanRequired === "Yes" && filters.stage === "All"}
              onClick={() => toggleFilter({ loanRequired: "Yes" })}
            />
            <KpiCard
              label="Processing"
              value={a.processing}
              tone="blue"
              hint={pct(a.processing)}
              active={filters.stage === "Processing"}
              onClick={() => toggleFilter({ stage: "Processing" })}
            />
            <KpiCard
              label="Sanctioned"
              value={a.sanctioned}
              tone="green"
              hint={pct(a.sanctioned)}
              active={filters.stage === "Sanctioned"}
              onClick={() => toggleFilter({ stage: "Sanctioned" })}
            />
            <KpiCard
              label="Disbursed"
              value={a.disbursed}
              tone="green"
              hint={pct(a.disbursed)}
              active={filters.stage === "Disbursed"}
              onClick={() => toggleFilter({ stage: "Disbursed" })}
            />
            <KpiCard
              label="Rejected"
              value={a.rejected}
              tone="red"
              hint={pct(a.rejected)}
              active={filters.stage === "Rejected"}
              onClick={() => toggleFilter({ stage: "Rejected" })}
            />
            <KpiCard
              label="Initially Yes but Now No"
              value={latestCount("Initially Yes but Now No")}
              tone="amber"
              hint={latestPct(latestCount("Initially Yes but Now No"))}
            />
            <KpiCard
              label="Initially Yes but not sure"
              value={latestCount("Initially Yes but not sure")}
              tone="amber"
              hint={latestPct(latestCount("Initially Yes but not sure"))}
            />
          </div>

          <SectionLabel>Attention needed</SectionLabel>
          <div className="kpi-scroll flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-1">
            <KpiCard
              label="Risk Cases"
              value={a.riskCases}
              tone="red"
              active={filters.attentionFlag === "Risk"}
              onClick={() => toggleFilter({ attentionFlag: "Risk" })}
            />
            <KpiCard
              label="Need FLDG"
              value={a.needFldg}
              tone="red"
              active={filters.attentionFlag === "FLDG"}
              onClick={() => toggleFilter({ attentionFlag: "FLDG" })}
            />
            <KpiCard
              label="Need Vidyalakshmi"
              value={a.needVidyalakshmi}
              tone="amber"
              active={filters.attentionFlag === "Vidyalakshmi"}
              onClick={() => toggleFilter({ attentionFlag: "Vidyalakshmi" })}
            />
            <KpiCard
              label="Not Started"
              value={a.notStarted}
              tone="amber"
              active={filters.stage === "Not Started"}
              onClick={() =>
                toggleFilter({ loanRequired: "Yes", stage: "Not Started" })
              }
            />
            <KpiCard
              label="Dup Vendors"
              value={a.dupVendors}
              tone="amber"
              active={filters.duplicateVendor === "Yes"}
              onClick={() => toggleFilter({ duplicateVendor: "Yes" })}
            />
          </div>

          <div>
            <button
              type="button"
              className="text-[0.75rem] font-semibold text-sot-black/70 underline-offset-2 hover:underline"
              onClick={() => setMoreOpen((o) => !o)}
            >
              {moreOpen ? "Hide more metrics" : "More metrics"}
            </button>
            {moreOpen ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                <KpiCard label="Total Students" value={a.total} />
                <KpiCard label="With Vendor" value={a.withVendor} />
                <KpiCard label="Avg Vendors" value={a.avgVendors.toFixed(2)} />
                <KpiCard label="Docs Pending" value={a.docsPending} />
              </div>
            ) : null}
          </div>
        </section>

        <section id="vendors" className="scroll-mt-4 space-y-3">
          <SectionLabel>Vendors</SectionLabel>
          <VendorGrid stats={a.vendorStats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HBarList
              title="Vendors per Student"
              subtitle="Fixes duplicate counting illusion"
              items={a.vendorDist.map((r) => ({
                label: r.label,
                count: r.count,
              }))}
            />
            <div className="card card-pad">
              <div className="section-title mb-2">Unique vs Applications</div>
              <p className="text-[0.8rem] text-sot-black/70 mb-4">
                One student across three vendors counts as{" "}
                <strong>1 unique</strong> and <strong>3 applications</strong> —
                never 3 students.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="Unique with vendor" value={a.withVendor} />
                <StatBlock label="Total applications" value={a.totalApps} />
                <StatBlock label="Multi-vendor students" value={a.dupVendors} />
                <StatBlock
                  label="Avg vendors / shared"
                  value={a.avgVendors.toFixed(2)}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="intake" className="scroll-mt-4 space-y-3">
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

        <section id="campus" className="scroll-mt-4 space-y-3">
          <SectionLabel>Campus</SectionLabel>
          <CampusTable rows={a.campuses} />
        </section>

        <section id="pipeline" className="scroll-mt-4 space-y-3">
          <SectionLabel>Pipeline</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          </div>
        </section>

        <section id="risk" className="scroll-mt-4 space-y-3">
          <SectionLabel>Risk</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HBarList
              title="Risk Dashboard"
              items={a.risk.map((r) => ({
                label: r.flag,
                count: r.count,
              }))}
              accent
            />
            <HBarList
              title="Drop-off Reasons"
              items={a.reasons.map((r) => ({
                label: r.bucket,
                count: r.count,
              }))}
            />
          </div>
        </section>

        <section id="students" className="scroll-mt-4 space-y-4">
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

        <footer className="pt-4 pb-8 text-center text-[0.8rem] text-sot-black/55">
          uGSOT Loan Operations · Formula logic ported from workbook · Data
          refreshes when{" "}
          <code className="text-[0.75rem]">students.json</code> is updated
        </footer>
      </main>

      <StudentDrawer student={selected} onClose={() => setSelected(null)} />
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.58rem] uppercase tracking-wider text-white/40 leading-none">
        {label}
      </div>
      <div className="font-semibold text-[0.8rem] mt-0.5 leading-tight">{value}</div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-sot-border bg-[#fafafa] p-3">
      <div className="text-[0.7rem] uppercase tracking-wide text-sot-black/60">
        {label}
      </div>
      <div className="kpi-value text-xl mt-1">{value}</div>
    </div>
  );
}
