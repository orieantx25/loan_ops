import { DATA_CYCLE, formatAsOfParts } from "@/lib/dataMeta";
import { DevSyncButton } from "./DevSyncButton";
import { PortalReturnButton } from "./PortalReturnButton";

type Props = {
  recordCount: number;
};

export function DashboardHeader({ recordCount }: Props) {
  const asOf = formatAsOfParts();

  return (
    <header className="dashboard-header sticky top-0 z-30 bg-sot-black text-white shadow-[0_2px_12px_rgba(17,17,17,0.18)]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 min-h-[2.75rem]">
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

          <div className="dashboard-header-meta flex items-center gap-3 sm:gap-4 shrink-0 flex-nowrap ml-auto overflow-x-auto">
            <DevSyncButton />
            <Meta label="Cycle" value={DATA_CYCLE} />
            <Meta label="As of" value={asOf.date} sub={asOf.time} />
            <Meta label="Records" value={String(recordCount)} />
            <PortalReturnButton />
          </div>
        </div>
      </div>
    </header>
  );
}

function Meta({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="shrink-0 text-right">
      <div className="text-[0.58rem] uppercase tracking-wider text-white/40 leading-none">
        {label}
      </div>
      <div className="font-semibold text-[0.8rem] mt-0.5 leading-tight whitespace-nowrap">
        {value}
      </div>
      {sub ? (
        <div className="text-[0.65rem] text-white/55 mt-0.5 tabular-nums whitespace-nowrap">
          {sub}
        </div>
      ) : null}
    </div>
  );
}
