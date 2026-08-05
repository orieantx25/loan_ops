"use client";

import { stageColor } from "@/lib/stageColors";

type Item = { label: string; count: number; color?: string };

export function HBarList({
  title,
  subtitle,
  items,
  accent,
  useStageColors,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  accent?: boolean;
  useStageColors?: boolean;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="card card-pad">
      <div className="section-title mb-1">{title}</div>
      {subtitle ? (
        <div className="text-[0.75rem] text-sot-black/60 mb-2">{subtitle}</div>
      ) : (
        <div className="mb-2" />
      )}
      <div className="space-y-2">
        {items.map((item) => {
          const fill =
            item.color ||
            (useStageColors
              ? stageColor(item.label)
              : accent
                ? "var(--sot-red)"
                : "var(--sot-dark)");
          return (
            <div key={item.label}>
              <div className="flex justify-between text-[0.8rem] mb-0.5 gap-2">
                <span className="truncate text-sot-black">{item.label}</span>
                <span className="font-semibold shrink-0 text-sot-black">
                  {item.count}
                </span>
              </div>
              <div className="bar-track h-1.5">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(item.count / max) * 100}%`,
                    background: fill,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
