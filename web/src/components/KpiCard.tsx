"use client";

import clsx from "clsx";
import type { KpiTone } from "@/lib/stageColors";
import { TONE_STYLES } from "@/lib/stageColors";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: KpiTone;
  hero?: boolean;
  active?: boolean;
  onClick?: () => void;
};

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  hero,
  active,
  onClick,
}: Props) {
  const styles = TONE_STYLES[tone];
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={clsx(
        "card text-left border-l-4 transition min-w-[140px]",
        hero ? "card-pad-lg col-span-2 sm:col-span-1" : "card-pad-sm",
        styles.border,
        active && styles.activeBg,
        interactive && "cursor-pointer hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sot-red",
        !interactive && "cursor-default",
      )}
    >
      <div className="muted uppercase tracking-wide text-[0.65rem] font-semibold text-sot-black/70">
        {label}
      </div>
      <div
        className={clsx(
          "kpi-value mt-1",
          hero ? "text-[2rem] sm:text-[2.25rem]" : "text-[1.5rem]",
          styles.value,
        )}
      >
        {value}
      </div>
      {hint ? <div className="text-[0.72rem] text-sot-black/60 mt-1">{hint}</div> : null}
    </button>
  );
}
