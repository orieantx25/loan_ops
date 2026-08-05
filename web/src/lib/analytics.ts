import type {
  CanonicalStage,
  DashboardFilters,
  RawStudent,
  Student,
} from "./types";
import { OVERLAP_VENDORS, VENDORS } from "./types";

const AS_OF = new Date("2026-08-03");

function yes(v: unknown): boolean {
  return String(v ?? "")
    .trim()
    .toLowerCase() === "yes";
}

function trim(v: unknown): string {
  return String(v ?? "").trim();
}

function normCampus(raw: string): string {
  const t = raw.trim();
  const map: Record<string, string> = {
    SSAHE: "SSAHE",
    SSHAE: "SSAHE",
    ssHAE: "SSAHE",
    ssahe: "SSAHE",
    ADYPU: "ADYPU",
  };
  return map[t] || t.toUpperCase() || "—";
}

function studentKey(r: RawStudent): string {
  if (r.mobile != null && String(r.mobile).trim() !== "") {
    return `MOB|${String(r.mobile).replace(/\.0$/, "")}`;
  }
  if (r.provisionalId) return `PID|${trim(r.provisionalId)}`;
  return `NAME|${trim(r.name)}`;
}

function vendorsOf(r: RawStudent): string[] {
  const list: string[] = [];
  if (yes(r.sharedIcici)) list.push("ICICI");
  if (yes(r.sharedPropelld)) list.push("Propelld");
  if (yes(r.sharedStudy4Buddy)) list.push("Study4Buddy");
  if (yes(r.sharedPoonawala)) list.push("Poonawala Fincorp");
  if (yes(r.sharedGyandhan)) list.push("GyanDhan");
  return list;
}

function canonicalStage(r: RawStudent, vendorCount: number): CanonicalStage {
  const H = trim(r.loanRequired);
  const U = trim(r.caseStatus);
  const V = trim(r.loanStage);
  const W = trim(r.loanStatus);
  const Hl = H.toLowerCase();
  const Ul = U.toLowerCase();
  const Vl = V.toLowerCase();
  const Wl = W.toLowerCase();

  if (Hl === "refund" || Ul === "refund case") return "Refund";
  if (Hl === "dnp" || Ul === "dnp") return "DNP";
  if (Vl === "disbursed" || W.includes("Disbursed")) return "Disbursed";
  if (Vl === "loan proccessed/accepted" || Wl.includes("sanctioned"))
    return "Sanctioned";
  if (
    Vl === "rejected" ||
    W.includes("Not eligbile") ||
    Wl.includes("not eligible")
  )
    return "Rejected";
  if (W.includes("Docs Pending")) return "Documents Pending";
  if (Hl === "yes" && Vl === "ongoing") return "Processing";
  if (Hl === "yes" && vendorCount > 0 && (!V || Vl === "not even started"))
    return "Vendor Assigned";
  if (Hl === "yes" && Vl === "not even started") return "Need Loan";
  if (Hl === "yes") return "Loan Started";
  if (Hl === "not sure") return "Interested";
  if (Hl === "no" || Vl === "not required") return "Not Required";
  return "Unclassified";
}

function reasonBucket(raw: string): string {
  if (!raw) return "—";
  const s = raw.toLowerCase();
  if (raw.includes("DNP") || s.includes("unreachable")) return "Unreachable / DNP";
  if (s.includes("interest")) return "High Interest / Terms";
  if (s.includes("eligib") || s.includes("income") || s.includes("low"))
    return "Eligibility / Income";
  if (s.includes("start") || s.includes("newer") || s.includes("will start"))
    return "Process Yet to Start";
  if (s.includes("sure")) return "Undecided";
  if (s.includes("reject") || raw.includes("SBI")) return "Rejected Elsewhere";
  if (s.includes("call")) return "Bank Communication";
  if (s.includes("father") || s.includes("sister") || s.includes("waiting"))
    return "Family / Dependency";
  return "Other";
}

/** Legacy Data sheet — Reasons for not Started bucket labels (fixed set). */
const NOT_STARTED_SHEET_BUCKETS = [
  "DNP, but now starting the process",
  "Fresh - process about to start",
  "Newer Lead",
  "Low income / low eligibility",
  "Rejected elsewhere / other bank",
  "Pending - will share details later",
  "Misunderstanding / miscommunication (thought loan would be automatic)",
] as const;

/** Map to a Data sheet bucket, or exact text for future / unmapped reasons. */
function notStartedReasonBucket(raw: string): string | null {
  if (!raw.trim()) return null;
  const s = raw.toLowerCase();
  const trimmed = raw.trim();

  if (
    s.includes("misunderstand") ||
    s.includes("miscommunication") ||
    s.includes("automatic") ||
    s.includes("thought he") ||
    s.includes("thought that")
  )
    return NOT_STARTED_SHEET_BUCKETS[6];

  if (s.includes("share details") || s.includes("details later"))
    return NOT_STARTED_SHEET_BUCKETS[5];

  if (s.includes("newer lead")) return NOT_STARTED_SHEET_BUCKETS[2];

  if (s.includes("income") || s.includes("eligib"))
    return NOT_STARTED_SHEET_BUCKETS[3];

  if (
    s.includes("reject") ||
    s.includes("elsewhere") ||
    s.includes("other bank") ||
    s.includes("sbi") ||
    s.includes("icici") ||
    s.includes("propelld") ||
    s.includes("propelled") ||
    s.includes("started elsewhere")
  )
    return NOT_STARTED_SHEET_BUCKETS[4];

  if (s.includes("dnp")) return NOT_STARTED_SHEET_BUCKETS[0];

  if (
    s.includes("fresh") ||
    s.includes("about to start") ||
    s.includes("will start") ||
    s.includes("process will start")
  )
    return NOT_STARTED_SHEET_BUCKETS[1];

  return trimmed;
}

function normSst(v: string): string {
  return v.trim().toLowerCase();
}

function isRefundCase(s: Student): boolean {
  return (
    normSst(s.caseStatus) === "refund case" ||
    normSst(s.loanRequired) === "refund"
  );
}

function loanStageLower(s: Student): string {
  return s.loanStage.toLowerCase();
}

function caseStatusLower(s: Student): string {
  return s.caseStatus.toLowerCase();
}

export type DataSheetRow = {
  label: string;
  count: number;
  indent?: boolean;
  groupHeader?: boolean;
  spacer?: boolean;
};

function buildInitialInputSst(students: Student[]): {
  rows: DataSheetRow[];
  total: number;
} {
  const withName = students.filter((s) => s.name && s.name !== "—");
  const total = withName.length;
  const sst = (v: string) =>
    withName.filter((s) => normSst(s.needLoanSst) === v).length;
  const yes = sst("yes");
  const no = sst("no");
  const drop = sst("drop");
  const dnr = sst("dnr");
  const blanks = withName.filter((s) => !s.needLoanSst.trim()).length;
  const known = yes + no + drop + dnr + blanks;
  const other = total - known;

  const rows: DataSheetRow[] = [
    { label: "Loan required — Yes", count: yes },
    { label: "Loan required — No", count: no },
    { label: "Drop", count: drop },
    { label: "DNR", count: dnr },
    { label: "Blanks", count: blanks },
  ];
  if (other > 0) rows.push({ label: "Any other input", count: other });

  return { rows, total };
}

function buildLatestInput(students: Student[]): {
  rows: DataSheetRow[];
  total: number;
} {
  const withName = students.filter((s) => s.name && s.name !== "—");
  const total = withName.length;
  const lr = (v: string) =>
    withName.filter((s) => normSst(s.loanRequired) === v).length;
  const yes = lr("yes");
  const no = lr("no");
  const drop = lr("refund");
  const dnp = lr("dnp");
  const notSure = lr("not sure");
  const blanks = withName.filter((s) => !s.loanRequired.trim()).length;
  const known = yes + no + drop + dnp + notSure + blanks;
  const other = total - known;
  const initiallyYesNowNo = withName.filter(
    (s) =>
      normSst(s.needLoanSst) === "yes" && normSst(s.loanRequired) === "no",
  ).length;
  const initiallyYesNotSure = withName.filter(
    (s) =>
      normSst(s.needLoanSst) === "yes" &&
      normSst(s.loanRequired) === "not sure",
  ).length;

  const rows: DataSheetRow[] = [
    { label: "Yes", count: yes },
    { label: "No", count: no },
    { label: "Drop", count: drop },
    { label: "DNP", count: dnp },
    { label: "Not Sure", count: notSure },
    { label: "Blanks", count: blanks },
  ];
  if (other > 0) rows.push({ label: "Any other Input", count: other });
  rows.push(
    { label: "Initially Yes but Now No", count: initiallyYesNowNo },
    { label: "Initially Yes but not sure", count: initiallyYesNotSure },
  );

  return { rows, total };
}

function buildCaseStatusList(
  students: Student[],
  field: "caseStatus" | "currentCaseStatus",
): DataSheetRow[] {
  const withName = students.filter((s) => s.name && s.name !== "—");
  const map = countBy(withName, (s) => {
    const v = field === "caseStatus" ? s.caseStatus : s.currentCaseStatus;
    return v.trim() || "(blank)";
  });
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function buildLoanBifurcation(students: Student[]): {
  rows: DataSheetRow[];
  total: number;
  reconcileSum: number;
} {
  const requireLoan = students.filter(
    (s) => normSst(s.loanRequired) === "yes" && !isRefundCase(s),
  );
  const total = requireLoan.length;
  const ongoing = requireLoan.filter(
    (s) => loanStageLower(s) === "ongoing",
  ).length;
  const controlOngoing = requireLoan.filter(
    (s) =>
      loanStageLower(s) === "ongoing" && caseStatusLower(s) === "control",
  ).length;
  const riskOngoing = requireLoan.filter(
    (s) => loanStageLower(s) === "ongoing" && caseStatusLower(s) === "risk",
  ).length;
  const notEvenStarted = requireLoan.filter(
    (s) => loanStageLower(s) === "not even started",
  ).length;
  const controlNotStarted = requireLoan.filter(
    (s) =>
      loanStageLower(s) === "not even started" &&
      caseStatusLower(s) === "control",
  ).length;
  const riskNotStarted = requireLoan.filter(
    (s) =>
      loanStageLower(s) === "not even started" &&
      caseStatusLower(s) === "risk",
  ).length;
  const disbursed = requireLoan.filter(
    (s) => loanStageLower(s) === "disbursed",
  ).length;
  const processed = requireLoan.filter(
    (s) => loanStageLower(s) === "loan proccessed/accepted",
  ).length;
  const rejected = requireLoan.filter(
    (s) => loanStageLower(s) === "rejected",
  ).length;
  const reconcileSum = ongoing + notEvenStarted + disbursed + processed + rejected;
  const dnp = total - reconcileSum;

  const rows: DataSheetRow[] = [
    { label: "Ongoing", count: ongoing, groupHeader: true },
    { label: "Control", count: controlOngoing, indent: true },
    { label: "Risk", count: riskOngoing, indent: true },
    { label: "Not Even Started", count: notEvenStarted, groupHeader: true },
    { label: "Control", count: controlNotStarted, indent: true },
    { label: "Risk", count: riskNotStarted, indent: true },
    { label: "Loan Disbursed", count: disbursed, groupHeader: true },
    {
      label: "Loan Proccessed/Accepted",
      count: processed,
      groupHeader: true,
    },
    {
      label: "Loan Rejected and not yet asked for refund",
      count: rejected,
      groupHeader: true,
    },
    { label: "DNP", count: dnp, groupHeader: true },
  ];

  return { rows, total, reconcileSum: reconcileSum + dnp };
}

/** Distinct campus keys for filter dropdowns (display Unassigned for —). */
export function campusOptions(students: Student[]): string[] {
  const set = new Set(
    students.map((s) => {
      const c = s.campus?.trim();
      return !c || c === "—" ? "Unassigned" : c;
    }),
  );
  return ["All", ...[...set].sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  })];
}

function campusMatches(studentCampus: string, filterCampus: string): boolean {
  if (filterCampus === "All") return true;
  if (filterCampus === "Unassigned") {
    return !studentCampus || studentCampus === "—" || studentCampus === "Unassigned";
  }
  return studentCampus === filterCampus;
}

function buildReasonsNotStarted(students: Student[]): {
  fixedBuckets: DataSheetRow[];
  extraBuckets: DataSheetRow[];
  detail: DataSheetRow[];
  total: number;
} {
  const notStarted = students.filter(
    (s) =>
      normSst(s.loanRequired) === "yes" &&
      loanStageLower(s) === "not even started" &&
      !isRefundCase(s),
  );
  const total = notStarted.length;

  const bucketMap = countBy(notStarted, (s) => {
    const b = notStartedReasonBucket(s.reasonRaw);
    return b ?? "__skip__";
  });

  const sheetSet = new Set<string>(NOT_STARTED_SHEET_BUCKETS);
  const fixedBuckets = NOT_STARTED_SHEET_BUCKETS.map((label) => ({
    label,
    count: bucketMap[label] || 0,
  }));
  const extraBuckets = Object.entries(bucketMap)
    .filter(([label]) => label !== "__skip__" && !sheetSet.has(label))
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const detailMap = countBy(
    notStarted.filter((s) => s.reasonRaw.trim()),
    (s) => s.reasonRaw.trim(),
  );
  const detail = Object.entries(detailMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return { fixedBuckets, extraBuckets, detail, total };
}

function ageingBucket(days: number | null): string {
  if (days == null) return "Unknown";
  if (days <= 3) return "0–3 Days";
  if (days <= 7) return "4–7 Days";
  if (days <= 15) return "8–15 Days";
  if (days <= 30) return "16–30 Days";
  return "30+ Days";
}

function pendingDays(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Math.floor((AS_OF.getTime() - d.getTime()) / 86400000);
  return Math.max(0, diff);
}

function primaryVendor(vendors: string[], status: string): string {
  if (vendors[0]) return vendors[0];
  const W = status;
  if (/GyanDhan/i.test(W)) return "GyanDhan";
  if (/Icici/i.test(W)) return "ICICI";
  if (/Propelld/i.test(W)) return "Propelld";
  if (/vidyalakshmi/i.test(W)) return "PM Vidyalakshmi";
  return "—";
}

export function enrichStudents(raw: RawStudent[]): Student[] {
  return raw.map((r) => {
    const vendors = vendorsOf(r);
    const stage = canonicalStage(r, vendors.length);
    const criticality = trim(r.criticality);
    const needFldg = yes(r.needFldg);
    const needVidyalakshmi = yes(r.needVidyalakshmi);
    const needVishwa = yes(r.needVishwa);
    const caseStatus = trim(r.caseStatus);
    const currentCaseStatus = trim(r.currentCaseStatus);
    const critical =
      criticality.toLowerCase() === "critical" ||
      needFldg ||
      needVidyalakshmi ||
      caseStatus.toLowerCase() === "risk";

    let riskCategory = "Normal";
    if (needFldg) riskCategory = "Need FLDG";
    else if (needVidyalakshmi) riskCategory = "Need Vidyalakshmi";
    else if (needVishwa) riskCategory = "Need Review";
    else if (criticality.toLowerCase() === "critical") riskCategory = "Critical";
    else if (caseStatus.toLowerCase() === "risk") riskCategory = "Risk Case";
    else if (stage === "Refund") riskCategory = "Refund";

    const days = pendingDays(r.tentativeDate ? String(r.tentativeDate) : null);
    const loanRequired = trim(r.loanRequired);

    return {
      key: studentKey(r),
      name: trim(r.name) || "—",
      mobile: r.mobile != null ? String(r.mobile).replace(/\.0$/, "") : "",
      provisionalId: trim(r.provisionalId),
      campus: normCampus(trim(r.campus)),
      campusRaw: trim(r.campus),
      loanRequired,
      needLoanSst: trim(r.needLoanSst),
      criticality,
      scholarship: r.scholarship != null ? String(r.scholarship) : "",
      loanAmt: r.loanAmt != null ? String(r.loanAmt) : "",
      annualIncome: r.annualIncome != null ? String(r.annualIncome) : "",
      caseStatus,
      currentCaseStatus,
      loanStage: trim(r.loanStage),
      loanStatus: trim(r.loanStatus),
      vendors,
      vendorCount: vendors.length,
      duplicateVendor: vendors.length > 1,
      primaryVendor: primaryVendor(vendors, trim(r.loanStatus)),
      stage,
      approvalStatus:
        stage === "Sanctioned" || stage === "Disbursed" || stage === "Approved"
          ? "Approved"
          : stage === "Rejected"
            ? "Rejected"
            : stage === "Processing" ||
                stage === "Documents Pending" ||
                stage === "Vendor Assigned"
              ? "In Progress"
              : stage === "Need Loan"
                ? "Pending Start"
                : "—",
      disbursementStatus:
        stage === "Disbursed"
          ? "Disbursed"
          : stage === "Sanctioned"
            ? "Sanctioned - Awaiting Disbursement"
            : "Not Disbursed",
      riskCategory,
      critical,
      needFldg,
      needVidyalakshmi,
      needVishwa,
      reasonBucket: reasonBucket(trim(r.reasonNotStarted)),
      reasonRaw: trim(r.reasonNotStarted),
      isPipeline: loanRequired.toLowerCase() === "yes",
      pendingDays: days,
      ageingBucket: ageingBucket(days),
      comments: trim(r.pranjalComments),
    };
  });
}

export function applyFilters(
  students: Student[],
  f: DashboardFilters,
): Student[] {
  return students.filter((s) => {
    if (!campusMatches(s.campus, f.campus)) return false;
    if (f.vendor !== "All" && !s.vendors.includes(f.vendor)) return false;
    if (f.stage === "Not Started") {
      if (s.stage !== "Need Loan" && s.stage !== "Vendor Assigned") return false;
    } else if (f.stage !== "All" && s.stage !== f.stage) {
      return false;
    }
    if (f.critical === "Yes" && !s.critical) return false;
    if (f.critical === "No" && s.critical) return false;
    if (f.loanRequired !== "All" && s.loanRequired !== f.loanRequired)
      return false;
    if (f.duplicateVendor === "Yes" && !s.duplicateVendor) return false;
    if (f.duplicateVendor === "No" && s.duplicateVendor) return false;
    if (f.attentionFlag === "FLDG" && !s.needFldg) return false;
    if (f.attentionFlag === "Vidyalakshmi" && !s.needVidyalakshmi) return false;
    if (f.attentionFlag === "Risk" && caseStatusLower(s) !== "risk") return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const hay = `${s.name} ${s.mobile} ${s.provisionalId}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export type Analytics = ReturnType<typeof computeAnalytics>;

export function computeAnalytics(students: Student[]) {
  const total = students.length;
  const pipeline = students.filter((s) => s.isPipeline);
  const needLoan = pipeline.length;

  const byStage = countBy(students, (s) => s.stage);
  const processing = byStage["Processing"] || 0;
  const docsPending = byStage["Documents Pending"] || 0;
  const sanctioned = byStage["Sanctioned"] || 0;
  const disbursed = byStage["Disbursed"] || 0;
  const rejected = byStage["Rejected"] || 0;
  const notStarted =
    (byStage["Need Loan"] || 0) + (byStage["Vendor Assigned"] || 0);

  const needFldg = students.filter((s) => s.needFldg).length;
  const needVidyalakshmi = students.filter((s) => s.needVidyalakshmi).length;
  const critical = students.filter((s) => s.critical).length;
  const riskCases = students.filter(
    (s) => caseStatusLower(s) === "risk",
  ).length;
  const dupVendors = students.filter((s) => s.duplicateVendor).length;
  const withVendor = students.filter((s) => s.vendorCount >= 1).length;
  const totalApps = students.reduce((a, s) => a + s.vendorCount, 0);
  const avgVendors = withVendor ? totalApps / withVendor : 0;

  const funnel = [
    { stage: "Need Loan", count: needLoan },
    {
      stage: "Not Started",
      count: pipeline.filter(
        (s) => s.stage === "Need Loan" || s.stage === "Vendor Assigned",
      ).length,
    },
    {
      stage: "Processing",
      count: pipeline.filter(
        (s) => s.stage === "Processing" || s.stage === "Documents Pending",
      ).length,
    },
    {
      stage: "Sanctioned",
      count: pipeline.filter(
        (s) => s.stage === "Sanctioned" || s.stage === "Approved",
      ).length,
    },
    {
      stage: "Disbursed",
      count: pipeline.filter((s) => s.stage === "Disbursed").length,
    },
    {
      stage: "Rejected",
      count: pipeline.filter((s) => s.stage === "Rejected").length,
    },
  ].map((row, i, arr) => ({
    ...row,
    convVsNeed: needLoan ? row.count / needLoan : 0,
    stepConv: i === 0 || !arr[i - 1].count ? null : row.count / arr[i - 1].count,
  }));

  const vendorStats = VENDORS.map((vendor) => {
    const shared = students.filter((s) => s.vendors.includes(vendor));
    const applications = shared.length;
    const uniqueExclusive = students.filter(
      (s) => s.vendorCount === 1 && s.vendors[0] === vendor,
    ).length;
    const inStatus = students.filter((s) =>
      new RegExp(vendor === "ICICI" ? "Icici" : vendor.split(" ")[0], "i").test(
        s.loanStatus,
      ),
    ).length;
    const sanctionedCount = shared.filter(
      (s) =>
        s.stage === "Sanctioned" ||
        s.stage === "Disbursed" ||
        /sanctioned/i.test(s.loanStatus),
    ).length;
    const disbursedCount = shared.filter((s) => s.stage === "Disbursed").length;
    const riskCount = shared.filter(
      (s) => caseStatusLower(s) === "risk",
    ).length;
    const pending = shared.filter(
      (s) =>
        s.isPipeline &&
        !["Disbursed", "Rejected", "Refund", "Not Required"].includes(s.stage),
    ).length;
    return {
      vendor,
      uniqueExclusive,
      applications,
      multiVendorAtBank: applications - uniqueExclusive,
      inStatus,
      sanctioned: sanctionedCount,
      disbursed: disbursedCount,
      riskCases: riskCount,
      pending,
      approvalPct: applications ? sanctionedCount / applications : 0,
      disbursementPct: applications ? disbursedCount / applications : 0,
      share: totalApps ? applications / totalApps : 0,
    };
  });

  const overlap: { a: string; b: string; count: number }[] = [];
  for (let i = 0; i < OVERLAP_VENDORS.length; i++) {
    for (let j = 0; j < OVERLAP_VENDORS.length; j++) {
      if (i === j) continue;
      const va = OVERLAP_VENDORS[i];
      const vb = OVERLAP_VENDORS[j];
      const count = students.filter(
        (s) => {
          const p = participatingVendors(s);
          return p.includes(va) && p.includes(vb);
        },
      ).length;
      overlap.push({ a: va, b: vb, count });
    }
  }
  const vendorDist = [0, 1, 2, 3, 4, 5].map((n) => ({
    label: n === 5 ? "5+ Vendors" : `${n} Vendor${n === 1 ? "" : "s"}`,
    count:
      n < 5
        ? students.filter((s) => s.vendorCount === n).length
        : students.filter((s) => s.vendorCount >= 5).length,
  }));

  const campusLabels = [
    ...new Set(students.map((s) => campusDisplayLabel(s.campus))),
  ].sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });

  const campuses = campusLabels.map((label) =>
    buildCampusRow(students, label),
  );

  const risk = [
    { flag: "Need FLDG", count: needFldg },
    { flag: "Need Vidyalakshmi", count: needVidyalakshmi },
    {
      flag: "Need Vishwa Review",
      count: students.filter((s) => s.needVishwa).length,
    },
    { flag: "Critical Flag", count: critical },
    {
      flag: "Risk Case Status",
      count: students.filter((s) => s.caseStatus.toLowerCase() === "risk")
        .length,
    },
    { flag: "Refund", count: byStage["Refund"] || 0 },
    { flag: "DNP / Unreachable", count: byStage["DNP"] || 0 },
    { flag: "Rejected", count: rejected },
    { flag: "Documents Pending", count: docsPending },
    { flag: "Duplicate Vendor Cases", count: dupVendors },
  ];

  const reasons = Object.entries(countBy(students, (s) => s.reasonBucket))
    .filter(([k]) => k !== "—")
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => b.count - a.count);

  const ageingOrder = [
    "0–3 Days",
    "4–7 Days",
    "8–15 Days",
    "16–30 Days",
    "30+ Days",
    "Unknown",
  ];
  const ageing = ageingOrder.map((bucket) => ({
    bucket,
    count: students.filter((s) => s.ageingBucket === bucket).length,
  }));

  const stageDist = Object.entries(byStage)
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count);

  const topPending = students
    .filter(
      (s) =>
        s.isPipeline &&
        !["Disbursed", "Rejected", "Refund", "Not Required"].includes(s.stage),
    )
    .sort((a, b) => {
      if (a.critical !== b.critical) return a.critical ? -1 : 1;
      return (b.pendingDays ?? -1) - (a.pendingDays ?? -1);
    })
    .slice(0, 25);

  const dataSheet = {
    initialInputSst: buildInitialInputSst(students),
    latestInput: buildLatestInput(students),
    loanBifurcation: buildLoanBifurcation(students),
    reasonsNotStarted: buildReasonsNotStarted(students),
    initialCaseStatus: buildCaseStatusList(students, "caseStatus"),
    currentCaseStatus: buildCaseStatusList(students, "currentCaseStatus"),
  };

  return {
    total,
    needLoan,
    processing,
    docsPending,
    sanctioned,
    disbursed,
    rejected,
    notStarted,
    needFldg,
    needVidyalakshmi,
    critical,
    riskCases,
    dupVendors,
    withVendor,
    avgVendors,
    totalApps,
    funnel,
    vendorStats,
    overlap,
    vendorDist,
    campuses,
    risk,
    reasons,
    ageing,
    stageDist,
    topPending,
    byStage,
    dataSheet,
  };
}

function campusDisplayLabel(campus: string): string {
  if (!campus || campus === "—") return "Unassigned";
  return campus;
}

function buildCampusRow(students: Student[], campusLabel: string) {
  const rows = students.filter(
    (s) => campusDisplayLabel(s.campus) === campusLabel,
  );
  return {
    campus: campusLabel,
    total: rows.length,
    needLoan: rows.filter((s) => s.isPipeline).length,
    processing: rows.filter((s) => s.stage === "Processing").length,
    sanctioned: rows.filter((s) => s.stage === "Sanctioned").length,
    disbursed: rows.filter((s) => s.stage === "Disbursed").length,
    rejected: rows.filter((s) => s.stage === "Rejected").length,
    riskCases: rows.filter((s) => caseStatusLower(s) === "risk").length,
  };
}

const STATUS_VENDOR_PATTERNS: [RegExp, string][] = [
  [/Icici/i, "ICICI"],
  [/Propelld/i, "Propelld"],
  [/GyanDhan/i, "GyanDhan"],
  [/Study4Buddy/i, "Study4Buddy"],
  [/Poonawala/i, "Poonawala Fincorp"],
  [/vidyalakshmi/i, "PM Vidyalakshmi"],
  [/other bank/i, "Other Bank"],
  [/State Scheme/i, "State Scheme"],
];

/** All vendors a student is associated with (Shared-to + Loan Status tokens). */
export function participatingVendors(s: Student): string[] {
  const set = new Set<string>(s.vendors);
  const W = s.loanStatus;
  for (const [re, name] of STATUS_VENDOR_PATTERNS) {
    if (re.test(W)) set.add(name);
  }
  return [...set];
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = keyFn(item);
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}
