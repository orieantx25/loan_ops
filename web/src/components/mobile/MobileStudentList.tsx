"use client";

import type { Student } from "@/lib/types";
import { stageColor } from "@/lib/stageColors";

export function MobileStudentList({
  students,
  onSelect,
  empty = "No students match.",
}: {
  students: Student[];
  onSelect: (s: Student) => void;
  empty?: string;
}) {
  if (!students.length) {
    return (
      <div className="mobile-card text-center text-[0.85rem] text-sot-black/55 py-8">
        {empty}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {students.slice(0, 50).map((s) => (
        <button
          key={`${s.name}-${s.mobile}`}
          type="button"
          onClick={() => onSelect(s)}
          className="mobile-card w-full text-left active:scale-[0.99] transition-transform"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[0.9rem] truncate">
                {s.name}
              </div>
              <div className="text-[0.72rem] text-sot-black/55 mt-0.5">
                {s.campus} · {s.primaryVendor || "No vendor"}
              </div>
            </div>
            <StagePill stage={s.stage} />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {s.critical ? <Flag tone="red">Critical</Flag> : null}
            {s.needFldg ? <Flag tone="red">FLDG</Flag> : null}
            {s.needVidyalakshmi ? <Flag tone="amber">Vidyalakshmi</Flag> : null}
            {s.duplicateVendor ? <Flag tone="amber">Multi-vendor</Flag> : null}
            {s.pendingDays != null && s.pendingDays >= 15 ? (
              <Flag tone="amber">{s.pendingDays}d pending</Flag>
            ) : null}
          </div>
        </button>
      ))}
      {students.length > 50 ? (
        <p className="text-center text-[0.75rem] text-sot-black/50 py-2">
          Showing 50 of {students.length} — narrow filters to see more
        </p>
      ) : null}
    </div>
  );
}

function StagePill({ stage }: { stage: string }) {
  return (
    <span
      className="shrink-0 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full text-white"
      style={{ background: stageColor(stage) }}
    >
      {stage}
    </span>
  );
}

function Flag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "red" | "amber";
}) {
  return (
    <span
      className={`text-[0.62rem] font-semibold px-1.5 py-0.5 rounded ${
        tone === "red"
          ? "bg-[#fdecec] text-sot-red"
          : "bg-[#fff4e8] text-sot-amber"
      }`}
    >
      {children}
    </span>
  );
}
