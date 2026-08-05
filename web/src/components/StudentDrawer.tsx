"use client";

import type { Student } from "@/lib/types";

export function StudentDrawer({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  if (!student) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/35 border-0 cursor-pointer"
        aria-label="Close student detail"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-xl border-l border-sot-border overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-sot-border px-4 py-3 flex items-start justify-between gap-3">
          <div>
            <div className="font-display font-bold text-lg leading-tight">
              {student.name}
            </div>
            <div className="text-[0.8rem] text-sot-black/65 mt-0.5">
              Student 360
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold px-2.5 py-1 rounded-md border border-sot-border hover:bg-[#fafafa]"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-4 text-[0.85rem]">
          <Block title="Contact">
            <Row label="Mobile" value={student.mobile || "—"} />
            <Row label="Provisional ID" value={student.provisionalId || "—"} />
            <Row label="Campus" value={student.campus} />
          </Block>

          <Block title="Loan status">
            <Row label="Loan required" value={student.loanRequired || "—"} />
            <Row label="Stage" value={student.stage} />
            <Row label="Loan stage (raw)" value={student.loanStage || "—"} />
            <Row label="Case status" value={student.caseStatus || "—"} />
            <Row
              label="Pending days"
              value={
                student.pendingDays != null ? String(student.pendingDays) : "—"
              }
            />
            <Row label="Ageing" value={student.ageingBucket} />
          </Block>

          <Block title="Vendors">
            <Row
              label="Primary"
              value={student.primaryVendor || "—"}
            />
            <Row
              label="All vendors"
              value={
                student.vendors.length ? student.vendors.join(", ") : "None"
              }
            />
            <Row label="Vendor count" value={String(student.vendorCount)} />
            <div className="text-[0.8rem] text-sot-black/80 mt-1 leading-snug">
              {student.loanStatus || "No loan status logged."}
            </div>
          </Block>

          <Block title="Flags">
            <div className="flex flex-wrap gap-1.5">
              {student.critical ? (
                <span className="badge badge-red">Critical</span>
              ) : null}
              {student.needFldg ? (
                <span className="badge badge-red">FLDG</span>
              ) : null}
              {student.needVidyalakshmi ? (
                <span className="badge badge-amber">Vidyalakshmi</span>
              ) : null}
              {student.needVishwa ? (
                <span className="badge badge-amber">Vishwa</span>
              ) : null}
              {student.duplicateVendor ? (
                <span className="badge badge-amber">Multi-vendor</span>
              ) : null}
              {!student.critical &&
              !student.needFldg &&
              !student.needVidyalakshmi &&
              !student.needVishwa &&
              !student.duplicateVendor ? (
                <span className="text-sot-black/55">No flags</span>
              ) : null}
            </div>
            <Row label="Risk category" value={student.riskCategory} />
          </Block>

          <Block title="Reason if not started">
            <p className="leading-snug text-sot-black whitespace-pre-wrap">
              {student.reasonRaw || "—"}
            </p>
            {student.reasonBucket && student.reasonBucket !== "—" ? (
              <div className="mt-1 text-[0.75rem] text-sot-black/60">
                Bucket: {student.reasonBucket}
              </div>
            ) : null}
          </Block>

          <Block title="Comments">
            <p className="leading-snug text-sot-black whitespace-pre-wrap">
              {student.comments || "—"}
            </p>
          </Block>
        </div>
      </aside>
    </>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[0.65rem] uppercase tracking-wide font-semibold text-sot-black/60 mb-1.5">
        {title}
      </div>
      <div className="rounded-lg border border-sot-border bg-[#fafafa] p-3 space-y-1.5">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-sot-black/60 shrink-0">{label}</span>
      <span className="font-semibold text-right text-sot-black">{value}</span>
    </div>
  );
}
