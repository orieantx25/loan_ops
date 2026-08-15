"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "fldg", label: "FLDG" },
  { id: "vendors", label: "Vendors" },
  { id: "campus", label: "Campus" },
  { id: "intake", label: "Intake" },
  { id: "pipeline", label: "Pipeline" },
  { id: "risk", label: "Risk" },
  { id: "ops", label: "Ops flags" },
  { id: "students", label: "Students" },
] as const;

type SectionNavProps = {
  variant?: "light" | "dark";
};

export function SectionNav({ variant = "light" }: SectionNavProps) {
  const [active, setActive] = useState<string>("summary");

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <nav className="py-0" aria-label="Dashboard sections">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-0.5 px-0.5 scrollbar-none">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => jump(s.id)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold border transition ${
              active === s.id
                ? "bg-sot-red text-white border-sot-red"
                : variant === "dark"
                  ? "bg-white/10 text-white/90 border-white/20 hover:bg-white/15"
                  : "bg-white text-sot-black border-sot-border hover:border-[#ccc]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
