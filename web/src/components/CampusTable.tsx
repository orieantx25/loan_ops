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
};

export function CampusTable({ rows }: { rows: Row[] }) {
  const totals = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      needLoan: acc.needLoan + r.needLoan,
      processing: acc.processing + r.processing,
      sanctioned: acc.sanctioned + r.sanctioned,
      disbursed: acc.disbursed + r.disbursed,
      rejected: acc.rejected + r.rejected,
      riskCases: acc.riskCases + r.riskCases,
    }),
    {
      total: 0,
      needLoan: 0,
      processing: 0,
      sanctioned: 0,
      disbursed: 0,
      rejected: 0,
      riskCases: 0,
    },
  );

  const maxNeed = Math.max(...rows.map((r) => r.needLoan), 1);

  return (
    <div className="card card-pad overflow-x-auto">
      <div className="section-title mb-1">Campus bifurcation</div>
      <div className="text-[0.75rem] text-sot-black/65 mb-3">
        Need Loan = Loan required (Latest) = Yes. Totals reconcile with funnel and
        KPI cards.
      </div>
      <table className="table-sot">
        <thead>
          <tr>
            <th className="sticky-col">Campus</th>
            <th>Total</th>
            <th>Need Loan</th>
            <th>Processing</th>
            <th>Sanctioned</th>
            <th>Disbursed</th>
            <th>Rejected</th>
            <th>Risk cases</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const intensity = r.needLoan / maxNeed;
            const heatBg = `rgba(227, 28, 36, ${0.06 + intensity * 0.35})`;
            return (
              <tr key={r.campus}>
                <td
                  className={`sticky-col ${
                    r.campus === "Unassigned"
                      ? "font-semibold text-sot-muted"
                      : "font-semibold"
                  }`}
                >
                  {r.campus}
                </td>
                <td>{r.total}</td>
                <td style={{ background: heatBg }} className="font-semibold">
                  {r.needLoan}
                </td>
                <td>{r.processing}</td>
                <td>{r.sanctioned}</td>
                <td>{r.disbursed}</td>
                <td>{r.rejected}</td>
                <td>
                  <span className={r.riskCases ? "badge badge-red" : "badge"}>
                    {r.riskCases}
                  </span>
                </td>
              </tr>
            );
          })}
          <tr className="border-t-2 border-sot-border bg-[#f0f0f0]">
            <td className="sticky-col font-display font-bold bg-[#f0f0f0]">
              Total
            </td>
            <td className="font-bold">{totals.total}</td>
            <td className="font-bold text-sot-red">{totals.needLoan}</td>
            <td className="font-bold">{totals.processing}</td>
            <td className="font-bold">{totals.sanctioned}</td>
            <td className="font-bold">{totals.disbursed}</td>
            <td className="font-bold">{totals.rejected}</td>
            <td>
              <span
                className={`badge font-bold ${
                  totals.riskCases > 0 ? "badge-red" : ""
                }`}
              >
                {totals.riskCases}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
