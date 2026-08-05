"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { DashboardFilters } from "@/lib/types";
import { DEFAULT_FILTERS, VENDORS } from "@/lib/types";

const STAGES = [
  "All",
  "Need Loan",
  "Not Started",
  "Vendor Assigned",
  "Documents Pending",
  "Processing",
  "Sanctioned",
  "Disbursed",
  "Rejected",
  "Refund",
  "DNP",
  "Not Required",
  "Interested",
  "Unclassified",
];

type Props = {
  filters: DashboardFilters;
  onChange: (next: DashboardFilters) => void;
  resultCount: number;
  campuses: string[];
};

const CHIP_KEYS: {
  key: keyof DashboardFilters;
  label: string;
}[] = [
  { key: "search", label: "Search" },
  { key: "campus", label: "Campus" },
  { key: "vendor", label: "Vendor" },
  { key: "stage", label: "Stage" },
  { key: "loanRequired", label: "Loan Required" },
  { key: "critical", label: "Critical" },
  { key: "duplicateVendor", label: "Dup Vendor" },
  { key: "attentionFlag", label: "Flag" },
];

export function Filters({ filters, onChange, resultCount, campuses }: Props) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => onChange({ ...filters, [key]: value });

  const activeChips = useMemo(() => {
    return CHIP_KEYS.filter(({ key }) => {
      const v = filters[key];
      return v !== "All" && v !== "";
    }).map(({ key, label }) => ({
      key,
      label,
      value: String(filters[key]),
    }));
  }, [filters]);

  const activeCount = activeChips.length;

  const clearOne = (key: keyof DashboardFilters) => {
    if (key === "search") onChange({ ...filters, search: "" });
    else if (key === "attentionFlag")
      onChange({ ...filters, attentionFlag: "All" });
    else onChange({ ...filters, [key]: "All" });
  };

  const applyPreset = (preset: "attention" | "notStarted" | "multi") => {
    if (preset === "attention") {
      onChange({ ...DEFAULT_FILTERS, critical: "Yes" });
    } else if (preset === "notStarted") {
      onChange({
        ...DEFAULT_FILTERS,
        loanRequired: "Yes",
        stage: "Not Started",
      });
    } else {
      onChange({ ...DEFAULT_FILTERS, duplicateVendor: "Yes" });
    }
  };

  return (
    <div className="card px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <button
          type="button"
          className="text-xs font-semibold px-2.5 py-1 rounded-md border border-sot-border bg-white hover:bg-[#fafafa]"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? "Hide filters" : `Filters${activeCount ? ` (${activeCount})` : ""}`}
        </button>
        <span className="text-[0.72rem] text-sot-black/65">
          {resultCount} in view
        </span>
        <div className="flex flex-wrap gap-1">
          <PresetBtn onClick={() => applyPreset("attention")}>
            Need attention
          </PresetBtn>
          <PresetBtn onClick={() => applyPreset("notStarted")}>
            Not started
          </PresetBtn>
          <PresetBtn onClick={() => applyPreset("multi")}>Multi-vendor</PresetBtn>
        </div>
        <button
          type="button"
          className="ml-auto text-xs font-semibold text-sot-red underline-offset-2 hover:underline"
          onClick={() => onChange({ ...DEFAULT_FILTERS })}
        >
          Reset
        </button>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {activeChips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => clearOne(c.key)}
              className="inline-flex items-center gap-1 text-[0.68rem] font-semibold px-1.5 py-0.5 rounded bg-[#fdecec] border border-[#f5c2c4] text-sot-red"
            >
              {c.label}: {c.value}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-2 mt-2 pt-2 border-t border-sot-border/60">
          <Field label="Search">
            <input
              className="input-sot w-full py-1.5 text-[0.8rem]"
              placeholder="Name / mobile / ID"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
            />
          </Field>
          <Field label="Campus">
            <select
              className="select-sot w-full py-1.5 text-[0.8rem]"
              value={filters.campus}
              onChange={(e) => set("campus", e.target.value)}
            >
              {campuses.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Vendor">
            <select
              className="select-sot w-full py-1.5 text-[0.8rem]"
              value={filters.vendor}
              onChange={(e) => set("vendor", e.target.value)}
            >
              <option>All</option>
              {VENDORS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Stage">
            <select
              className="select-sot w-full py-1.5 text-[0.8rem]"
              value={filters.stage}
              onChange={(e) => set("stage", e.target.value)}
            >
              {STAGES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Loan Required">
            <select
              className="select-sot w-full py-1.5 text-[0.8rem]"
              value={filters.loanRequired}
              onChange={(e) => set("loanRequired", e.target.value)}
            >
              {["All", "Yes", "No", "Refund", "DNP", "Not Sure"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Critical">
            <select
              className="select-sot w-full py-1.5 text-[0.8rem]"
              value={filters.critical}
              onChange={(e) => set("critical", e.target.value)}
            >
              {["All", "Yes", "No"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Dup Vendor">
            <select
              className="select-sot w-full py-1.5 text-[0.8rem]"
              value={filters.duplicateVendor}
              onChange={(e) => set("duplicateVendor", e.target.value)}
            >
              {["All", "Yes", "No"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}
    </div>
  );
}

function PresetBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[0.68rem] font-semibold px-2 py-0.5 rounded-full border border-sot-border bg-white hover:border-[#ccc] text-sot-black"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-0.5 font-semibold uppercase tracking-wide text-[0.6rem] text-sot-black/70">
        {label}
      </div>
      {children}
    </label>
  );
}
