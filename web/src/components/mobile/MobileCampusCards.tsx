"use client";

type Row = {
  campus: string;
  total: number;
  needLoan: number;
  processing: number;
  sanctioned: number;
  disbursed: number;
  rejected: number;
  riskCases: number;
  semFeePaid: number;
};

export function MobileCampusCards({ rows }: { rows: Row[] }) {
  const maxNeed = Math.max(...rows.map((r) => r.needLoan), 1);

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = Math.round((r.needLoan / maxNeed) * 100);
        return (
          <div key={r.campus} className="mobile-card">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-display font-bold text-[0.95rem]">
                  {r.campus}
                </div>
                <div className="text-[0.72rem] text-sot-black/55">
                  {r.total} students
                </div>
              </div>
              <div className="text-right">
                <div className="text-[0.65rem] uppercase tracking-wide text-sot-black/50">
                  Need loan
                </div>
                <div className="font-display font-bold text-xl text-sot-red">
                  {r.needLoan}
                </div>
              </div>
            </div>
            <div className="bar-track mb-2">
              <div
                className="bar-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-5 gap-1 text-center">
              <MiniStat label="Fee" value={r.semFeePaid} />
              <MiniStat label="Proc." value={r.processing} />
              <MiniStat label="Sanc." value={r.sanctioned} />
              <MiniStat label="Disb." value={r.disbursed} />
              <MiniStat
                label="Risk"
                value={r.riskCases}
                accent={r.riskCases > 0}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#f5f5f5] py-1.5 px-1">
      <div className="text-[0.58rem] uppercase text-sot-black/50">{label}</div>
      <div
        className={`font-semibold text-sm tabular-nums ${
          accent ? "text-sot-red" : "text-sot-black"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
