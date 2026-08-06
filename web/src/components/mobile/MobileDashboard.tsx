"use client";

import { useMemo, useState } from "react";
import type { Analytics } from "@/lib/analytics";
import { DATA_CYCLE, formatAsOfDisplay } from "@/lib/dataMeta";
import type { DashboardFilters, Student } from "@/lib/types";
import { DevSyncButton } from "../DevSyncButton";
import { Funnel } from "../Funnel";
import { HBarList } from "../HBarList";
import { StudentDrawer } from "../StudentDrawer";
import { MobileCampusCards } from "./MobileCampusCards";
import { MobileFilterSheet } from "./MobileFilterSheet";
import { MobileStudentList } from "./MobileStudentList";
import { MobileVendorList } from "./MobileVendorList";

type Tab = "home" | "pipeline" | "vendors" | "campus" | "students";

type Props = {
  filtered: Student[];
  a: Analytics;
  filters: DashboardFilters;
  setFilters: (f: DashboardFilters) => void;
  campuses: string[];
  reset: () => void;
};

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "◉" },
  { id: "pipeline", label: "Pipeline", icon: "▤" },
  { id: "vendors", label: "Vendors", icon: "◎" },
  { id: "campus", label: "Campus", icon: "⌂" },
  { id: "students", label: "Students", icon: "☰" },
];

export function MobileDashboard({
  filtered,
  a,
  filters,
  setFilters,
  campuses,
  reset,
}: Props) {
  const [tab, setTab] = useState<Tab>("home");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);
  const [studentSegment, setStudentSegment] = useState<
    "pending" | "fldg" | "vidya" | "critical" | "multi"
  >("pending");
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);

  const sst = a.dataSheet.initialInputSst;
  const sstCount = (label: string) =>
    sst.rows.find((r) => r.label === label)?.count ?? 0;

  const pct = (n: number) =>
    a.needLoan ? `${((n / a.needLoan) * 100).toFixed(0)}%` : "—";

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

  const segmentStudents = useMemo(() => {
    switch (studentSegment) {
      case "fldg":
        return filtered.filter((s) => s.needFldg);
      case "vidya":
        return filtered.filter((s) => s.needVidyalakshmi);
      case "critical":
        return filtered.filter((s) => s.critical);
      case "multi":
        return filtered
          .filter((s) => s.duplicateVendor)
          .sort((x, y) => y.vendorCount - x.vendorCount);
      default:
        return a.topPending.filter((s) =>
          filtered.some((f) => f.name === s.name && f.mobile === s.mobile),
        );
    }
  }, [studentSegment, filtered, a.topPending]);

  return (
    <div className="mobile-shell min-h-screen bg-sot-bg flex flex-col">
      <header className="mobile-header shrink-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ugsot-logo.png"
              alt="uGSOT"
              className="h-8 w-auto object-contain"
            />
            <div className="min-w-0">
              <div className="font-display font-bold text-sm leading-tight">
                Loan Ops
              </div>
              <div className="text-[0.65rem] text-white/55 truncate">
                {DATA_CYCLE} · {formatAsOfDisplay()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DevSyncButton />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="relative h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm"
              aria-label="Open filters"
            >
              ⚙
              {activeFilterCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-sot-red text-[0.6rem] font-bold text-white flex items-center justify-center">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
        {activeFilterCount > 0 ? (
          <div className="px-4 pb-2 text-[0.72rem] text-white/70">
            {filtered.length} of {a.total} students ·{" "}
            <button
              type="button"
              className="underline"
              onClick={reset}
            >
              clear filters
            </button>
          </div>
        ) : null}
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 mobile-main">
        {tab === "home" ? (
          <div className="space-y-4">
            <div className="mobile-hero-card w-full">
              <div className="text-[0.7rem] uppercase tracking-wider text-white/70 font-semibold">
                Need Loan
              </div>
              <div className="font-display font-bold text-4xl mt-1 tabular-nums">
                {a.needLoan}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricTile
                label="Processing"
                value={a.processing}
                hint={pct(a.processing)}
              />
              <MetricTile
                label="Sanctioned"
                value={a.sanctioned}
                hint={pct(a.sanctioned)}
              />
              <MetricTile
                label="Disbursed"
                value={a.disbursed}
                hint={pct(a.disbursed)}
              />
              <MetricTile
                label="Rejected"
                value={a.rejected}
                hint={pct(a.rejected)}
              />
            </div>

            <Section title="Attention">
              <div className="grid grid-cols-2 gap-2">
                <AttentionTile
                  label="Risk cases"
                  value={a.riskCases}
                  tone="red"
                />
                <AttentionTile
                  label="Need FLDG"
                  value={a.needFldg}
                  tone="red"
                />
                <AttentionTile
                  label="Vidyalakshmi"
                  value={a.needVidyalakshmi}
                  tone="amber"
                />
                <AttentionTile
                  label="Not started"
                  value={a.notStarted}
                  tone="amber"
                />
              </div>
            </Section>

            <Section title="SST initial input">
              <div className="grid grid-cols-3 gap-2">
                <MiniKpi label="Leads" value={sst.total} />
                <MiniKpi label="Yes" value={sstCount("Loan required — Yes")} />
                <MiniKpi label="No" value={sstCount("Loan required — No")} />
                <MiniKpi label="Drop" value={sstCount("Drop")} />
                <MiniKpi label="DNR" value={sstCount("DNR")} />
                <MiniKpi label="Blanks" value={sstCount("Blanks")} />
              </div>
            </Section>

            <Collapsible
              title="Intake details"
              open={intakeOpen}
              onToggle={() => setIntakeOpen((o) => !o)}
            >
              <div className="space-y-2 text-[0.8rem]">
                {a.dataSheet.latestInput.rows.slice(0, 8).map((r) => (
                  <div
                    key={r.label}
                    className="flex justify-between py-1 border-b border-sot-border/50 last:border-0"
                  >
                    <span className="text-sot-black/70 pr-2">{r.label}</span>
                    <span className="font-semibold tabular-nums">{r.count}</span>
                  </div>
                ))}
              </div>
            </Collapsible>

            <Collapsible
              title="Risk summary"
              open={riskOpen}
              onToggle={() => setRiskOpen((o) => !o)}
            >
              <div className="space-y-2">
                {a.risk.slice(0, 6).map((r) => (
                  <div key={r.flag} className="flex items-center gap-2">
                    <div className="flex-1 text-[0.78rem] truncate">{r.flag}</div>
                    <div className="font-semibold tabular-nums">{r.count}</div>
                  </div>
                ))}
              </div>
            </Collapsible>
          </div>
        ) : null}

        {tab === "pipeline" ? (
          <div className="space-y-4">
            <Funnel rows={a.funnel} />
            <HBarList
              title="Stage distribution"
              subtitle="One canonical stage per student"
              items={a.stageDist.map((s) => ({
                label: s.stage,
                count: s.count,
              }))}
              useStageColors
            />
            <HBarList
              title="Drop-off reasons"
              items={a.reasons.map((r) => ({
                label: r.bucket,
                count: r.count,
              }))}
            />
          </div>
        ) : null}

        {tab === "vendors" ? (
          <div className="space-y-3">
            <p className="text-[0.78rem] text-sot-black/65 px-0.5">
              Tap a vendor to expand metrics. Applications ≠ unique students.
            </p>
            <MobileVendorList stats={a.vendorStats} />
            <div className="mobile-card">
              <div className="font-display font-bold text-sm mb-2">
                Portfolio totals
              </div>
              <div className="grid grid-cols-2 gap-2 text-[0.8rem]">
                <div className="rounded-lg bg-[#f5f5f5] p-2">
                  <div className="text-sot-black/55 text-[0.65rem]">Unique w/ vendor</div>
                  <div className="font-bold text-lg">{a.withVendor}</div>
                </div>
                <div className="rounded-lg bg-[#f5f5f5] p-2">
                  <div className="text-sot-black/55 text-[0.65rem]">Applications</div>
                  <div className="font-bold text-lg">{a.totalApps}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "campus" ? (
          <div className="space-y-3">
            <p className="text-[0.78rem] text-sot-black/65 px-0.5">
              Need Loan heat by campus — totals match funnel KPIs.
            </p>
            <MobileCampusCards rows={a.campuses} />
          </div>
        ) : null}

        {tab === "students" ? (
          <div className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {(
                [
                  ["pending", "Top pending"],
                  ["fldg", "FLDG"],
                  ["vidya", "Vidyalakshmi"],
                  ["critical", "Critical"],
                  ["multi", "Multi-vendor"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStudentSegment(id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[0.72rem] font-semibold border ${
                    studentSegment === id
                      ? "bg-sot-red text-white border-sot-red"
                      : "bg-white border-sot-border"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <MobileStudentList
              students={segmentStudents}
              onSelect={setSelected}
            />
          </div>
        ) : null}
      </main>

      <nav className="mobile-bottom-nav shrink-0" aria-label="Main navigation">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`mobile-nav-item ${tab === t.id ? "active" : ""}`}
          >
            <span className="text-base leading-none" aria-hidden>
              {t.icon}
            </span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mobile-section-title">{title}</h2>
      {children}
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="mobile-card text-left">
      <div className="text-[0.65rem] uppercase tracking-wide text-sot-black/55 font-semibold">
        {label}
      </div>
      <div className="font-display font-bold text-2xl tabular-nums mt-0.5">
        {value}
      </div>
      {hint ? (
        <div className="text-[0.68rem] text-sot-black/50">{hint} of need</div>
      ) : null}
    </div>
  );
}

function AttentionTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "amber";
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-left ${
        tone === "red"
          ? "border-[#f5c2c4] bg-[#fdecec]"
          : "border-[#f0d2ad] bg-[#fff4e8]"
      }`}
    >
      <div className="text-[0.65rem] font-semibold text-sot-black/65">{label}</div>
      <div
        className={`font-display font-bold text-xl tabular-nums ${
          tone === "red" ? "text-sot-red" : "text-sot-amber"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white border border-sot-border px-2 py-2 text-center">
      <div className="text-[0.58rem] uppercase text-sot-black/50">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Collapsible({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mobile-card">
      <button
        type="button"
        className="w-full flex items-center justify-between font-display font-bold text-sm"
        onClick={onToggle}
      >
        {title}
        <span className="text-sot-black/40">{open ? "▾" : "▸"}</span>
      </button>
      {open ? <div className="mt-3 pt-3 border-t border-sot-border">{children}</div> : null}
    </div>
  );
}
