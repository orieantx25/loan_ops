"use client";

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
  open: boolean;
  onClose: () => void;
  filters: DashboardFilters;
  onChange: (next: DashboardFilters) => void;
  campuses: string[];
  resultCount: number;
};

export function MobileFilterSheet({
  open,
  onClose,
  filters,
  onChange,
  campuses,
  resultCount,
}: Props) {
  if (!open) return null;

  const set = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => onChange({ ...filters, [key]: value });

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/40"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-2xl bg-white shadow-2xl flex flex-col animate-slide-up safe-bottom">
        <div className="flex items-center justify-between px-4 py-3 border-b border-sot-border shrink-0">
          <div>
            <div className="font-display font-bold text-base">Filters</div>
            <div className="text-[0.75rem] text-sot-black/60">
              {resultCount} students in view
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-sot-black text-white"
          >
            Done
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 space-y-3 flex-1">
          <Field label="Search">
            <input
              className="input-sot w-full"
              placeholder="Name, mobile, or ID"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Campus">
              <select
                className="select-sot w-full"
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
                className="select-sot w-full"
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
                className="select-sot w-full"
                value={filters.stage}
                onChange={(e) => set("stage", e.target.value)}
              >
                {STAGES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Loan required">
              <select
                className="select-sot w-full"
                value={filters.loanRequired}
                onChange={(e) => set("loanRequired", e.target.value)}
              >
                {["All", "Yes", "No", "Refund", "DNP", "Not Sure"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <PresetChip
              label="Need attention"
              onClick={() => onChange({ ...DEFAULT_FILTERS, critical: "Yes" })}
            />
            <PresetChip
              label="Not started"
              onClick={() =>
                onChange({
                  ...DEFAULT_FILTERS,
                  loanRequired: "Yes",
                  stage: "Not Started",
                })
              }
            />
            <PresetChip
              label="Multi-vendor"
              onClick={() =>
                onChange({ ...DEFAULT_FILTERS, duplicateVendor: "Yes" })
              }
            />
          </div>
        </div>

        <div className="shrink-0 px-4 py-3 border-t border-sot-border flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="flex-1 py-2.5 rounded-xl border border-sot-border font-semibold text-sm"
          >
            Reset all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-sot-red text-white font-semibold text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-sot-black/60">
        {label}
      </div>
      {children}
    </label>
  );
}

function PresetChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[0.72rem] font-semibold px-3 py-1.5 rounded-full border border-sot-border bg-[#fafafa]"
    >
      {label}
    </button>
  );
}
