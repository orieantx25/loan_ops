/** Shared stage / funnel colors for bars, badges, and KPIs. */
export const STAGE_COLORS: Record<string, string> = {
  "Need Loan": "#b45309",
  "Not Started": "#b45309",
  Interested: "#6b6b6b",
  "Loan Started": "#3d5a80",
  "Documents Pending": "#c2410c",
  "Vendor Assigned": "#a16207",
  Processing: "#1d4ed8",
  Approved: "#15803d",
  Sanctioned: "#15803d",
  Disbursed: "#1b7a4e",
  Completed: "#1b7a4e",
  Rejected: "#e31c24",
  Refund: "#6b6b6b",
  DNP: "#7c3aed",
  "Not Required": "#9ca3af",
  Unclassified: "#9ca3af",
};

export function stageColor(stage: string, fallback = "#222222"): string {
  return STAGE_COLORS[stage] ?? fallback;
}

export type KpiTone = "green" | "amber" | "red" | "neutral" | "blue";

export const TONE_STYLES: Record<
  KpiTone,
  { value: string; border: string; activeBg: string }
> = {
  green: {
    value: "text-sot-green",
    border: "border-l-sot-green",
    activeBg: "bg-[#e8f5ef]",
  },
  amber: {
    value: "text-sot-amber",
    border: "border-l-sot-amber",
    activeBg: "bg-[#fff4e8]",
  },
  red: {
    value: "text-sot-red",
    border: "border-l-sot-red",
    activeBg: "bg-[#fdecec]",
  },
  blue: {
    value: "text-[#1d4ed8]",
    border: "border-l-[#1d4ed8]",
    activeBg: "bg-[#eff6ff]",
  },
  neutral: {
    value: "text-sot-black",
    border: "border-l-sot-dark",
    activeBg: "bg-[#f0f0f0]",
  },
};
