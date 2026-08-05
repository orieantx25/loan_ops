"use client";

import { stageColor } from "@/lib/stageColors";

type FunnelRow = {
  stage: string;
  count: number;
  convVsNeed: number;
  stepConv: number | null;
};

export function Funnel({ rows }: { rows: FunnelRow[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="card card-pad">
      <div className="section-title mb-3">Loan Funnel</div>
      <div className="space-y-2.5">
        {rows.map((row, i) => (
          <div key={row.stage}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <div className="font-semibold text-sm text-sot-black">{row.stage}</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-display font-bold text-base">{row.count}</span>
                <span className="text-[0.75rem] text-sot-black/60">
                  {(row.convVsNeed * 100).toFixed(0)}% of need
                </span>
              </div>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(row.count / max) * 100}%`,
                  background: stageColor(row.stage),
                }}
              />
            </div>
            {i > 0 && row.stepConv != null ? (
              <div className="text-[0.72rem] text-sot-black/55 mt-0.5">
                Step conversion {(row.stepConv * 100).toFixed(0)}%
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
