# Loan Operations Workbook — Phase 1 Audit & Architecture Recommendation

**Date:** 3 Aug 2026  
**Source files:** `Master sheet - Loans .xlsx` + `Product Requirements Document (PRD).md`  
**Status:** Audit complete. Rebuild delivered in `uGSOT_Loan_Operations_System.xlsx` (defaults D1–D10 approved). See `GO_LIVE_GUIDE.md`.

---

## 1. Executive Verdict

The current workbook is an **operational scratchpad**, not a BI system. It has **~492 student records**, **18 sheets**, mixed raw data + reports, and **inflates vendor metrics by summing multi-status tags** (Pivot grand total ≈ 130 status occurrences from only **126 students with a Loan Status**, of which **32 have multi-vendor status strings**).

Master Data is already close to **one row = one student** (489 unique mobiles / 489 unique Provisional IDs; only 2 duplicate mobiles). The PRD’s “duplicate student counting” problem is therefore **not** primarily duplicate rows — it is **how vendor/status metrics are aggregated** (comma-separated `Loan Status` + summing Shared-to-Yes flags without unique-student context).

---

## 2. Sheet-by-Sheet Audit

### 2.1 `Master data` (Table1: A1:AQ984)

| Attribute | Finding |
|-----------|---------|
| **Purpose** | Primary operational dataset (SST + loan team) |
| **Rows** | 492 populated student rows; table pre-sized to ~984 |
| **Columns** | 43 headers (A–AQ); 4 unused (`Column 37/39/40/41`); `Banker Status` 100% blank |
| **Inputs** | Manual entry / SST form import |
| **Outputs** | Source for all COUNTIFS / FILTER / QUERY sheets |
| **Dependencies** | None (root). Referenced by almost everything |
| **Formulas present** | `A` auto-serial `=IF($B3="","",A2+1)`; `AB` mirrors `AA` (`=AA2`). **Violates PRD “no formulas on Master Data”** |
| **Manual work** | High — status, vendor shares, comments, flags all hand-maintained |
| **Data quality** | Campus typos (`SSAHE` 217 / `SSHAE` 62 / case variants); Yes/No case inconsistency; Scholarship mixed decimal vs %; Loan Amt free-text; Occupation free-text |
| **Missing vs PRD** | No Email, No Course, No Admission Cycle, No Application Month, No reliable Pending-Since date |
| **Scalability** | Wide table OK to ~50k rows; unbounded COUNTIFS ranges (`$2:$986`) will break as data grows |

**Key columns (business-critical):**

| Col | Header | Role |
|-----|--------|------|
| C | Mobile Number | Best student key (489 unique) |
| D | Provisional ID | Fallback key (489 unique, 0 dups) |
| E | Campus | SSAHE / ADYPU / SSHAE (normalize) |
| F | Need Loan (SST) | Initial intent |
| U | Loan required (Latest) | Current intent (Yes/No/Refund/DNP/Not sure) |
| V–Z | Shared to {ICICI, Propelld, Study4Buddy, Poonawala, GyanDhan} | Vendor application flags |
| AA/AB | Initial / Current Case Status | Control / Risk / Refund / DNP / Not required / Not Sure |
| AG | Loan Stage | Coarse stage (6 values) |
| AH | Loan Status | Fine status; **often multi-vendor CSV** |
| AI–AK | FLDG / Vishwa / Vidyalakshmi flags | Risk / attention |
| AL | Reason if not started | Free text → needs bucketing |
| G | Criticality | Critical / Non Critical / … |

---

### 2.2 `Data ` (ops dashboard fragment)

| Attribute | Finding |
|-----------|---------|
| **Purpose** | Partial KPI board: SST vs Latest intent, stage bifurcate, vendor counts, not-started reasons |
| **Inputs** | `Table1` structured refs + hardcoded reason buckets |
| **Outputs** | Counts for leadership glance |
| **Manual work** | Vendor Bifurcation counts (N3:N11) and many reason counts are **hardcoded numbers**, not formulas |
| **Formula complexity** | Medium COUNTIFS; broken Google Sheets ARRAYFORMULA stubs (`__xludf.DUMMYFUNCTION`) after Excel export |
| **Issues** | Mixed live formulas + static numbers; poor layout; duplicate of Data Summary |

---

### 2.3 `Data Summary`

| Attribute | Finding |
|-----------|---------|
| **Purpose** | Main leadership summary (closest thing to a dashboard) |
| **Inputs** | Hard ranges on Master data (`U2:U986`, etc.) |
| **Outputs** | Intent funnel, Ongoing/Control/Risk, Disbursed, Rejected; bank breakdown; not-started reasons |
| **Manual work** | Bank Breakdown F3:F11 largely **static**; reason buckets static |
| **Bugs** | Inconsistent ranges (`U7:U991` on Risk row vs `$U$2:$U$992` elsewhere); Refund Case vs Refund case case-sensitivity risk; Total formula subtracts 1 arbitrarily |
| **Formula complexity** | Medium; FILTER/SORT unique status lists from Google Sheets broken in Excel |

---

### 2.4 `Pivot Table 2`

| Attribute | Finding |
|-----------|---------|
| **Purpose** | Loan Status bank segregation + not-started reason taxonomy |
| **Critical flaw** | Bank Segregation sums **status token occurrences** (Grand Total **130**). A student with `Processing by Icici, Processing by GyanDhan` contributes **2**. This is the core “3 vendors = 3 students” illusion |
| **Manual work** | Pivot + manually typed reason buckets — violates PRD non-goals |

---

### 2.5 Attention / Ops filter sheets

| Sheet | Purpose | Mechanism | Issues |
|-------|---------|-----------|--------|
| `Need FLDG attention` | FLDG = Yes list + Merit join | FILTER on Table1 + XLOOKUP-style Merit | Pre-expanded to 1000×115; heavy; broken ARRAYFORMULA in Excel |
| `Need Vidyalakshmi Attention` | Vidyalakshmi flag list | Same pattern | Same |
| `Student deferring loan requirem` | Deferred / deferring cases | Filter view | Sparse; unclear criteria |
| `Specific need students` | Meritorious + loan difficulty | Manual curation feel | Not formula-driven |
| `Students who want loan from nex` | Empty placeholder | — | Dead sheet |

---

### 2.6 `SummaryView`

| Attribute | Finding |
|-----------|---------|
| **Purpose** | Flat operational list from Master (FILTER ARRAYFORMULA) |
| **Issues** | ~795 formulas sampled; Google→Excel conversion left DUMMYFUNCTION wrappers; hard to maintain |

---

### 2.7 Campus slices `ADYPU `, `SSHAE`

| Attribute | Finding |
|-----------|---------|
| **Purpose** | `QUERY(... WHERE E='ADYPU'|'SSAHE')` campus extracts |
| **Issues** | Misses `SSAHE` typo variants for SSHAE sheet; ADYPU has 2300+ formula cells; should be filter views or one Campus Analytics sheet |

---

### 2.8 `Phase 2`, `Sheet13`, `Sheet18`

| Sheet | Finding |
|-------|---------|
| `Phase 2` | Alternate/older master (Table2); overlapping schema; risk of dual source of truth |
| `Sheet13` | Mentors + Email + Status=DNR style extract — **only place near Master with Email** |
| `Sheet18` | Orphan / unclear (~632 values, 0 formulas) |

---

### 2.9 `Refund Mapping`

| Attribute | Finding |
|-----------|---------|
| **Purpose** | Finance refund tracker via `IMPORTRANGE` |
| **Inputs** | External Google Sheet |
| **Keep?** | Yes as integration surface, but isolate; do not mix into Master |

---

### 2.10 `Merit data`

| Attribute | Finding |
|-----------|---------|
| **Purpose** | Scholarship / UGNET / academic merit (~100+ columns) |
| **Join key** | Provisional ID / Phone / Email |
| **Role in redesign** | Optional enricher for scholarship %, scores; **not** loan pipeline source |

---

### 2.11 `Dropdowns`

Only Loan Stage list (6 values). Incomplete vs actual `Loan Status` / Case Status vocabularies.

---

## 3. Data Flow (Current)

```
Master data (Table1)
    ├── Data / Data Summary (COUNTIFS + hardcoded vendor totals)
    ├── Pivot Table 2 (status token inflation)
    ├── SummaryView (FILTER list)
    ├── ADYPU / SSHAE (QUERY by campus)
    ├── Need FLDG / Vidyalakshmi / Specific need (FILTER + Merit)
    ├── Phase 2 / Sheet13 (parallel/legacy masters)
    └── Refund Mapping ← IMPORTRANGE (external)
         Merit data ← join on Provisional ID
```

**Bottlenecks:** Hardcoded vendor counts; status CSV inflation; broken Google formulas in Excel; dual masters; no Student 360; no normalized stage funnel; no ageing engine.

---

## 4. Duplicate / Multi-Vendor Reality Check

### What the data actually looks like

| Metric | Value |
|--------|------:|
| Student rows | 492 |
| Unique mobiles | 489 |
| Unique Provisional IDs | 489 |
| Duplicate mobiles | 2 |
| Students with ≥1 Shared-to-Yes | 103 |
| Shared to 1 / 2 / 3 / 4 / 5 vendors | 41 / 35 / 24 / 2 / 1 |
| Students with multi-part Loan Status | 32 |
| Status token occurrences (sum) | 162 |
| Students with any Loan Status | 126 |

### Shared-to Yes counts (applications, not unique students)

| Vendor | Shared Yes |
|--------|----------:|
| GyanDhan | 63 |
| Propelld | 60 |
| ICICI | 59 |
| Study4Buddy | 9 |
| Poonawala | 5 |

### Root cause of miscount

1. **Pivot / Bank Breakdown** counts each token in `Loan Status` separately and often **sums across vendors** → inflated “students”.  
2. Leadership may mentally sum Shared-to-Yes columns (196) vs unique students needing loan (**159** with Latest=Yes).  
3. There is **no** Unique Students vs Applications split anywhere today.

---

## 5. Stage Model Gap (Current vs PRD)

**Current `Loan Stage` (actual):**  
`Not required` | `Not even started` | `Ongoing` | `Loan Proccessed/Accepted` | `Disbursed` | `Rejected`

**PRD journey:**  
Need Loan → Counselled → Interested → Loan Started → Documents Pending → Vendor Assigned → Under Processing → Approved → Sanctioned → Disbursed → Completed

**Recommendation:** Keep Master Stage/Status fields untouched. Derive a **Canonical Stage** in Helper via mapping rules (Configuration sheet), using:

1. `Loan required (Latest)` for top of funnel  
2. `Loan Stage` as primary  
3. `Loan Status` tokens for Docs Pending / Sanctioned / Processing / Disbursed refinement  
4. Case Status for Refund / DNP exit ramps  

Every student gets **exactly one** Canonical Stage.

---

## 6. Open Decisions (Need Confirmation Before Rebuild)

| # | Decision | Proposed default |
|---|----------|------------------|
| D1 | **Email / Course missing** from Master | Student Key = Mobile → Provisional ID. Email/Course via optional `XLOOKUP` to Merit/Sheet13; blank if missing |
| D2 | **Campus typos** | Normalize `SSHAE`/`ssHAE`/`ssahe` → `SSAHE` in Helper only; leave Master raw |
| D3 | **Pending Days / Ageing** | No clean date field. Use `Tentative Loan Date` when present; else leave blank / use “Unknown” bucket until ops adds `Last Status Change Date` column to Master |
| D4 | **Vendors Auxilo / InCred** in PRD | Include in Configuration as inactive; activate when Shared-to columns appear |
| D5 | **Admission Cycle / Month filters** | Derive Month from Tentative Loan Date if present; Cycle as Config-driven label (manual Config cell) until Master has a Cycle column |
| D6 | **Phase 2 / Sheet13 / Sheet18** | Archive/hide; single Master only |
| D7 | **Refund Mapping IMPORTRANGE** | Keep as separate `Integrations_Refund` sheet; not required for core dashboard v1 |
| D8 | **Master formulas (serial + AB=AA)** | Strip on migration copy; serial via Helper; Current Case Status becomes ops-owned field or stays mirrored in Helper |
| D9 | **Google Sheets vs Excel delivery** | Build as `.xlsx` with Google-Sheets-compatible formulas (`ARRAYFORMULA`, `MAP`, `BYROW`, `FILTER`, `QUERY`, `LAMBDA`) ready to upload to Google Sheets |
| D10 | **Reason taxonomy** | Map free-text `Reason if not started` → Config reason buckets via keyword rules in Helper |

---

## 7. Recommended Architecture (Phase 2)

```
01_Master_Data          ← paste/import only (no formulas)
02_Configuration        ← vendors, stages, campus map, status→stage map, reasons, colors
03_Helper               ← row-aligned engine (Student Key, Vendor Count, Canonical Stage, Flags, Ageing…)
04_Student_360          ← UNIQUE students (one row / student)
05_Vendor_Analytics     ← one row / vendor
06_Stage_Analytics      ← funnel counts + conversion %
07_Risk_Analytics       ← FLDG, Vidyalakshmi, Critical, Deferred, Refund…
08_Dashboard_Tables     ← all chart/KPI source tables (filter-aware)
09_Dashboard            ← executive UI only (references 08)
10_Ops_Views            ← Top Pending, FLDG list, Vidyalakshmi list (formula FILTER)
11_Documentation        ← data dictionary, stage map, how to refresh
Archive_*               ← old Phase 2 / pivots (hidden)
```

### Principles

1. **Master Data untouched** after migration strip of serial/AB formulas.  
2. **All KPIs** read from `08_Dashboard_Tables`, never recalculate on Dashboard.  
3. **One calculation path:** Master → Helper → Analytics → Dashboard Tables → Dashboard.  
4. **Unique vs Applications** always shown as a pair.  
5. **Vendor Overlap Matrix** from Student_360 vendor sets.  
6. **Performance:** Helper columns once; analytics use `COUNTIFS`/`QUERY` on Helper/Student_360, not raw Master repeatedly. Pre-size ranges with dynamic named ranges or `TOCOL`+open-ended columns carefully.

---

## 8. Formula Strategy (High Level)

| Layer | Approach |
|-------|----------|
| Helper | `ARRAYFORMULA` / `MAP`/`BYROW` over Master columns for Key, Normalize Campus, VendorCount, DuplicateFlag, CanonicalStage, RiskCategory, CriticalFlag |
| Student 360 | `UNIQUE` on Student Key from Helper where Key<>""; attributes via `XLOOKUP` / `BYROW` aggregation |
| Vendor Analytics | Config vendor list × `COUNTIFS` on Helper flags / parsed vendor participation |
| Overlap Matrix | For vendors i,j: count students where both vendor flags true |
| Funnel | Stage Analytics ordered by Config StageOrder; conversion = stage_n / stage_1 or stage_n / stage_(n-1) |
| Dashboard filters | Filter cells on Dashboard → `08_Dashboard_Tables` uses `FILTER`/`QUERY` with criteria (All = wildcard) |
| Avoid | Volatile `INDIRECT`/`OFFSET`/`NOW` in mass rows; per-cell copied COUNTIFS over 50k rows |

### Student Key (Google Sheets)

```
=ARRAYFORMULA(IF(C2:C="",
   IF(D2:D="","",
     "PID|"&TRIM(D2:D)),
   "MOB|"&TEXT(C2:C,"0")))
```

### Vendor Count (example)

```
=ARRAYFORMULA(
  (LOWER(TRIM(V2:V))="yes")
+ (LOWER(TRIM(W2:W))="yes")
+ (LOWER(TRIM(X2:X))="yes")
+ (LOWER(TRIM(Y2:Y))="yes")
+ (LOWER(TRIM(Z2:Z))="yes")
)
```

### Duplicate Vendor Flag

`=ARRAYFORMULA(IF(VendorCount>1,"Yes","No"))`

---

## 9. Canonical Stage Mapping (Proposed)

| Priority | Condition | Canonical Stage |
|----------|-----------|-----------------|
| 1 | Latest Loan Required ∈ {No} AND Case ≠ Refund | Not Required |
| 2 | Case Status = Refund case / Latest = Refund | Refund |
| 3 | Latest ∈ {DNP} OR Case = DNP | DNP / Unreachable |
| 4 | Loan Stage = Disbursed OR Status contains Disbursed | Disbursed |
| 5 | Loan Stage = Loan Proccessed/Accepted OR Status contains sanctioned | Sanctioned |
| 6 | Loan Stage = Rejected OR Status contains Not eligbile | Rejected |
| 7 | Status contains Docs Pending | Documents Pending |
| 8 | Loan Stage = Ongoing AND any Shared-to Yes / Processing token | Processing |
| 9 | Loan Stage = Not even started AND Latest = Yes | Need Loan / Not Started |
| 10 | Latest = Yes (fallback) | Need Loan |
| 11 | Latest = Not sure | Interested / Undecided |
| 12 | Else | Unclassified |

*(Exact labels aligned to PRD funnel in Configuration; adjustable without rewriting formulas.)*

---

## 10. Performance Recommendations

1. Compute once in Helper; never repeat 10× COUNTIFS on Master for the same predicate.  
2. Cap analytics to Student_360 (~unique students), not application explosions.  
3. Use Config-driven vendor list so new vendors don’t require formula rewrites — add column mapping row in Config.  
4. Replace Pivot Tables with formula tables.  
5. Hide Helper / raw analytics from daily users; land on Dashboard.  
6. For 50k–100k rows: prefer `MAP`/`BYROW` single-pass Helper; avoid whole-column volatile UDFs; consider splitting archive cycles into separate Master tabs by Admission Cycle later.

---

## 11. UI/UX Recommendations (Dashboard)

- Brand: upGrad SoT — Primary `#E31C24`, Black `#111111`, BG `#F6F6F6`, Cards `#FFFFFF`, Border `#E5E5E5`  
- Top strip: 12–14 KPI cards in 2 rows  
- Funnel with conversion % between stages  
- Vendor scorecards (not a dense grid dump)  
- Campus ranking table  
- Risk strip  
- Overlap heatmap  
- Ageing bars  
- Top 20 pending students  
- Filters pinned under header  
- Dashboard contains **no** heavy formulas — only cell references to `08_Dashboard_Tables`

---

## 12. Migration Strategy

1. Freeze current workbook as `Archive_Legacy_Loans.xlsx`.  
2. Create new workbook `uGSOT_Loan_Operations_System.xlsx`.  
3. Copy Master values only (paste values) into `01_Master_Data`; remove serial/AB formulas; keep validations optionally.  
4. Build Configuration from observed enums + PRD stages/vendors.  
5. Build Helper → Student_360 → Vendor/Stage/Risk → Dashboard Tables → Dashboard.  
6. Validate KPI parity vs Data Summary for: Latest Yes, Ongoing, Not started, Disbursed, Rejected, FLDG Yes, Vidyalakshmi Yes.  
7. Validate Unique Students ≤ Applications for every vendor.  
8. Upload to Google Sheets; replace Excel-only bits; reconnect Refund IMPORTRANGE if needed.  
9. Train ops: edit **only** Master + Config; never type numbers on Dashboard.

---

## 13. What Will Be Deprecated

| Legacy sheet | Action |
|--------------|--------|
| Data / Data Summary | Replaced by Dashboard + Dashboard Tables |
| Pivot Table 2 | Replaced by formula Vendor/Stage analytics |
| SummaryView | Replaced by Student_360 + Ops_Views |
| ADYPU / SSHAE | Replaced by Campus filter / Campus Analytics |
| Phase 2 / Sheet13 / Sheet18 | Archive |
| Hardcoded vendor counts | Eliminated |
| Attention sheets | Recreated as lightweight FILTER views |

**Preserved business logic:** Latest Loan Required as intent source; Loan Stage vocabulary; Case Status Control/Risk/Refund/DNP; Shared-to vendor flags; FLDG / Vidyalakshmi / Critical flags; Merit as enrichment; Refund external link.

---

## 14. Success Checks (Post-Build)

- [ ] Unique students needing loan = COUNT of distinct keys where Latest=Yes (≈159 today)  
- [ ] Sum of vendor Unique Students ≥ unique multi-vendor students but Applications = sum of shares  
- [ ] Overlap(ICICI, GyanDhan) = students with both Shared Yes  
- [ ] Every student has exactly one Canonical Stage  
- [ ] Changing one Master cell updates Dashboard with zero manual edits  
- [ ] No Pivot / no hardcoded KPI numbers  

---

## 15. Next Step

**Await confirmation on Open Decisions D1–D10** (defaults above are recommended).  
On approval, proceed to Phase 2–7: build the production formula-driven workbook.
