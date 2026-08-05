"use client";

import { useState } from "react";

type VendorStat = {
  vendor: string;
  uniqueExclusive: number;
  applications: number;
  multiVendorAtBank: number;
  pending: number;
  riskCases: number;
  sanctioned: number;
  disbursed: number;
  approvalPct: number;
  disbursementPct: number;
};

export function MobileVendorList({ stats }: { stats: VendorStat[] }) {
  const [open, setOpen] = useState<string | null>(stats[0]?.vendor ?? null);
  const sorted = [...stats].sort((a, b) => b.applications - a.applications);

  return (
    <div className="space-y-2">
      {sorted.map((v) => {
        const expanded = open === v.vendor;
        return (
          <div key={v.vendor} className="mobile-card overflow-hidden">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setOpen(expanded ? null : v.vendor)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-display font-bold text-[0.95rem]">
                  {v.vendor}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg tabular-nums">
                    {v.applications}
                  </span>
                  <span className="text-sot-black/40 text-sm">
                    {expanded ? "▾" : "▸"}
                  </span>
                </div>
              </div>
              <div className="text-[0.72rem] text-sot-black/55 mt-0.5">
                applications · {v.uniqueExclusive} unique only
              </div>
            </button>
            {expanded ? (
              <div className="mt-3 pt-3 border-t border-sot-border grid grid-cols-2 gap-2">
                <Stat label="Unique only" value={v.uniqueExclusive} />
                <Stat label="Multi-vendor" value={v.multiVendorAtBank} />
                <Stat label="Pending" value={v.pending} />
                <Stat
                  label="Risk cases"
                  value={v.riskCases}
                  accent={v.riskCases > 0}
                />
                <Stat label="Sanctioned" value={v.sanctioned} />
                <Stat label="Disbursed" value={v.disbursed} />
                <Stat
                  label="Approval %"
                  value={`${v.approvalPct.toFixed(0)}%`}
                />
                <Stat
                  label="Disburse %"
                  value={`${v.disbursementPct.toFixed(0)}%`}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#f5f5f5] px-2.5 py-2">
      <div className="text-[0.62rem] uppercase text-sot-black/50">{label}</div>
      <div
        className={`font-semibold tabular-nums ${
          accent ? "text-sot-red" : "text-sot-black"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
