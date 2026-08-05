"use client";

import { useMemo, useState } from "react";

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

type SortKey = "applications" | "approval";

export function VendorGrid({ stats }: { stats: VendorStat[] }) {
  const [sort, setSort] = useState<SortKey>("applications");

  const sorted = useMemo(() => {
    const copy = [...stats];
    if (sort === "applications") {
      copy.sort((a, b) => b.applications - a.applications);
    } else {
      copy.sort((a, b) => b.approvalPct - a.approvalPct);
    }
    return copy;
  }, [stats, sort]);

  return (
    <div className="card card-pad">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <div className="section-title">Vendor Applications Stages</div>
          <div className="text-[0.75rem] text-sot-black/65 mt-1">
            Applications = all students shared to vendor. Unique only = students
            with only that bank partner.
          </div>
        </div>
        <div className="flex gap-1.5">
          <SortBtn
            active={sort === "applications"}
            onClick={() => setSort("applications")}
          >
            Applications
          </SortBtn>
          <SortBtn
            active={sort === "approval"}
            onClick={() => setSort("approval")}
          >
            Approval
          </SortBtn>
        </div>
      </div>
      <div className="overflow-x-auto pb-0.5">
        <div className="grid grid-cols-5 gap-2 sm:gap-3 min-w-[720px]">
          {sorted.map((v) => (
            <div
              key={v.vendor}
              className="rounded-lg border border-sot-border bg-[#fafafa] p-3 min-w-0 min-h-[220px] flex flex-col"
            >
              <div className="font-display font-bold text-[0.8rem] leading-snug mb-3 text-sot-black">
                {v.vendor}
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Metric label="Applications" value={v.applications} />
                <Metric label="Unique only" value={v.uniqueExclusive} />
                {v.multiVendorAtBank > 0 ? (
                  <Metric label="Multi-vendor" value={v.multiVendorAtBank} accent />
                ) : null}
                <Metric label="Pending" value={v.pending} />
                <Metric label="Risk cases" value={v.riskCases} accent={v.riskCases > 0} />
                <Metric label="Approval" value={v.sanctioned} />
                <Metric label="Disbursed" value={v.disbursed} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SortBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[0.72rem] font-semibold px-2.5 py-1 rounded-full border ${
        active
          ? "bg-sot-black text-white border-sot-black"
          : "bg-white text-sot-black border-sot-border"
      }`}
    >
      {children}
    </button>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[0.72rem] leading-snug py-1">
      <span className="text-sot-black/65">{label}</span>
      <span
        className={`shrink-0 tabular-nums ${
          accent ? "font-semibold text-sot-red" : "font-semibold text-sot-black"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
