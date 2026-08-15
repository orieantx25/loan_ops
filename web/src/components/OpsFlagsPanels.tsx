"use client";

import type { Analytics } from "@/lib/analytics";
import { HBarList } from "./HBarList";
import { KpiCard } from "./KpiCard";

type Props = {
  ops: Analytics["opsFlags"];
};

export function OpsFlagsPanels({ ops }: Props) {
  const fldgTotals = ops.fldgByCampus.reduce(
    (acc, r) => ({
      needFldg: acc.needFldg + r.needFldg,
      fldgAndProcessing: acc.fldgAndProcessing + r.fldgAndProcessing,
      fldgNotProcessing: acc.fldgNotProcessing + r.fldgNotProcessing,
      fldgProcessingAndSanctioned:
        acc.fldgProcessingAndSanctioned + r.fldgProcessingAndSanctioned,
    }),
    {
      needFldg: 0,
      fldgAndProcessing: 0,
      fldgNotProcessing: 0,
      fldgProcessingAndSanctioned: 0,
    },
  );

  return (
    <div className="space-y-3">
      <SectionLabel>FLDG & Vidyalakshmi</SectionLabel>
      <div className="kpi-scroll flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-1">
        <KpiCard
          label="Need FLDG attention"
          value={ops.fldgTotal}
          hero
          tone="red"
        />
        <KpiCard
          label="FLDG + Processing PM Vidyalakshmi"
          value={ops.fldgAndProcessing}
          tone="amber"
        />
        <KpiCard
          label="FLDG + Sanctioned PM Vidyalakshmi"
          value={ops.fldgAndSanctioned}
          tone="green"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard
          label="Needs Vishwa's attention"
          value={ops.vishwaYes}
          tone="amber"
        />
        <KpiCard
          label="Processing through Vidyalakshmi"
          value={ops.processingVidyalakshmi}
          tone="blue"
        />
        <KpiCard
          label="Sanctioned by PM Vidyalakshmi"
          value={ops.sanctionedVidyalakshmi}
          tone="green"
        />
      </div>

      <div className="card card-pad overflow-x-auto">
        <div className="section-title mb-2">FLDG by campus</div>
        <table className="table-sot">
          <thead>
            <tr>
              <th className="sticky-col">Campus</th>
              <th>Need FLDG attention</th>
              <th>FLDG and Processing</th>
              <th>FLDG not processing through PM Vidyalakshmi</th>
              <th>FLDG, Processing and Sanctioned</th>
            </tr>
          </thead>
          <tbody>
            {ops.fldgByCampus.map((r) => (
              <tr key={r.campus}>
                <td className="sticky-col font-semibold">{r.campus}</td>
                <td className="font-semibold">{r.needFldg}</td>
                <td>{r.fldgAndProcessing}</td>
                <td>{r.fldgNotProcessing}</td>
                <td>{r.fldgProcessingAndSanctioned}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-sot-border bg-[#f0f0f0]">
              <td className="sticky-col font-display font-bold bg-[#f0f0f0]">
                Total
              </td>
              <td className="font-bold text-sot-red">{fldgTotals.needFldg}</td>
              <td className="font-bold">{fldgTotals.fldgAndProcessing}</td>
              <td className="font-bold">{fldgTotals.fldgNotProcessing}</td>
              <td className="font-bold">
                {fldgTotals.fldgProcessingAndSanctioned}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <SectionLabel>Ops flags</SectionLabel>
      <div className="kpi-scroll flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-1">
        <KpiCard label="Drop — Might drop" value={ops.dropMight} tone="amber" />
        <KpiCard
          label="Intent reverted to SST"
          value={ops.intentFilled}
          tone="amber"
        />
        <KpiCard
          label="Loan amount sanctioned"
          value={ops.loanAmountSanctionedFilled}
          tone="green"
        />
        <KpiCard
          label="SST comments filled"
          value={ops.sstCommentsFilled}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HBarList
          title="Drop status"
          items={ops.dropStatus
            .filter((r) => r.label !== "(blank)")
            .map((r) => ({
              label: r.label,
              count: r.count,
            }))}
        />
        <HBarList
          title="SST comments"
          items={
            ops.sstComments.length
              ? ops.sstComments.map((r) => ({
                  label: r.label,
                  count: r.count,
                }))
              : [{ label: "No comments", count: 0 }]
          }
        />
      </div>

      {ops.loanAmountSanctioned.length > 0 ? (
        <HBarList
          title="Loan amount sanctioned"
          items={ops.loanAmountSanctioned.map((r) => ({
            label: r.label,
            count: r.count,
          }))}
        />
      ) : null}

      {ops.bankerStatus.length > 0 ? (
        <HBarList
          title="Banker status"
          items={ops.bankerStatus.map((r) => ({
            label: r.label,
            count: r.count,
          }))}
        />
      ) : null}

      {ops.mentorFilled > 0 ? (
        <HBarList
          title="Mentor flag"
          items={ops.mentorFlag.map((r) => ({
            label: r.label,
            count: r.count,
          }))}
        />
      ) : null}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-sm font-bold tracking-tight text-sot-black">
      {children}
    </h2>
  );
}
