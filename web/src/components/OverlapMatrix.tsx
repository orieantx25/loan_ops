"use client";

import { OVERLAP_VENDORS } from "@/lib/types";

type Overlap = { a: string; b: string; count: number };

export function OverlapMatrix({ overlap }: { overlap: Overlap[] }) {
  const max = Math.max(...overlap.map((o) => o.count), 1);
  const get = (a: string, b: string) =>
    a === b
      ? null
      : overlap.find((o) => o.a === a && o.b === b)?.count ?? 0;

  return (
    <div className="card card-pad overflow-x-auto">
      <div className="section-title mb-1">Vendor Overlap Matrix</div>
      <div className="muted mb-3">
        Shared students (Shared-to flags + Loan Status tokens)
      </div>
      <table className="w-full min-w-[560px]">
        <thead>
          <tr>
            <th className="text-left text-xs muted p-2">Vendor</th>
            {OVERLAP_VENDORS.map((v) => (
              <th
                key={v}
                className="text-center text-[0.65rem] muted p-1.5 font-semibold leading-tight"
              >
                {v.split(" ")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {OVERLAP_VENDORS.map((row) => (
            <tr key={row}>
              <td className="text-xs font-semibold p-2 whitespace-nowrap max-w-[100px]">
                {row}
              </td>
              {OVERLAP_VENDORS.map((col) => {
                const val = get(row, col);
                if (val == null) {
                  return (
                    <td key={col} className="p-1">
                      <div className="heat-cell bg-[#eee] text-sot-muted text-[0.75rem]">—</div>
                    </td>
                  );
                }
                const intensity = val / max;
                const bg = `rgba(227, 28, 36, ${0.08 + intensity * 0.75})`;
                const color = intensity > 0.55 ? "#fff" : "#111";
                return (
                  <td key={col} className="p-1">
                    <div
                      className="heat-cell text-[0.75rem]"
                      style={{ background: bg, color }}
                    >
                      {val}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
