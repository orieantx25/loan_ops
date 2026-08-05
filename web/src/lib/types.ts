export type RawStudent = {
  sno: number | null;
  name: string | null;
  mobile: number | string | null;
  provisionalId: string | null;
  campus: string | null;
  needLoanSst: string | null;
  criticality: string | null;
  scholarship: number | string | null;
  loanAmt: number | string | null;
  annualIncome: number | string | null;
  incomeProof: string | null;
  sstRemarks: string | null;
  pranjalComments: string | null;
  loanRequired: string | null;
  sharedIcici: string | null;
  sharedPropelld: string | null;
  sharedStudy4Buddy: string | null;
  sharedPoonawala: string | null;
  sharedGyandhan: string | null;
  caseStatus: string | null;
  currentCaseStatus: string | null;
  tentativeDate: string | null;
  loanStage: string | null;
  loanStatus: string | null;
  needFldg: string | null;
  needVishwa: string | null;
  needVidyalakshmi: string | null;
  reasonNotStarted: string | null;
};

export type CanonicalStage =
  | "Need Loan"
  | "Interested"
  | "Loan Started"
  | "Documents Pending"
  | "Vendor Assigned"
  | "Processing"
  | "Approved"
  | "Sanctioned"
  | "Disbursed"
  | "Completed"
  | "Rejected"
  | "Refund"
  | "DNP"
  | "Not Required"
  | "Unclassified";

export type Student = {
  key: string;
  name: string;
  mobile: string;
  provisionalId: string;
  campus: string;
  campusRaw: string;
  loanRequired: string;
  needLoanSst: string;
  criticality: string;
  scholarship: string;
  loanAmt: string;
  annualIncome: string;
  caseStatus: string;
  currentCaseStatus: string;
  loanStage: string;
  loanStatus: string;
  vendors: string[];
  vendorCount: number;
  duplicateVendor: boolean;
  primaryVendor: string;
  stage: CanonicalStage;
  approvalStatus: string;
  disbursementStatus: string;
  riskCategory: string;
  critical: boolean;
  needFldg: boolean;
  needVidyalakshmi: boolean;
  needVishwa: boolean;
  reasonBucket: string;
  reasonRaw: string;
  isPipeline: boolean;
  pendingDays: number | null;
  ageingBucket: string;
  comments: string;
};

export type DashboardFilters = {
  campus: string;
  vendor: string;
  stage: string;
  critical: string;
  loanRequired: string;
  duplicateVendor: string;
  search: string;
  /** KPI / preset attention flag */
  attentionFlag: "All" | "FLDG" | "Vidyalakshmi" | "Risk";
};

export const DEFAULT_FILTERS: DashboardFilters = {
  campus: "All",
  vendor: "All",
  stage: "All",
  critical: "All",
  loanRequired: "All",
  duplicateVendor: "All",
  search: "",
  attentionFlag: "All",
};

export const VENDORS = [
  "ICICI",
  "Propelld",
  "Study4Buddy",
  "Poonawala Fincorp",
  "GyanDhan",
] as const;

/** Vendors used in overlap matrix + pair table (shared flags + status tokens). */
export const OVERLAP_VENDORS = [
  "ICICI",
  "Propelld",
  "Study4Buddy",
  "Poonawala Fincorp",
  "GyanDhan",
  "PM Vidyalakshmi",
  "Other Bank",
  "State Scheme",
] as const;

export const FUNNEL_STAGES = [
  "Need Loan",
  "Not Started",
  "Processing",
  "Sanctioned",
  "Disbursed",
  "Rejected",
] as const;
