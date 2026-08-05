# uGSOT Loan Operations Management System — Go-Live Guide

**Workbook:** `uGSOT_Loan_Operations_System.xlsx`  
**Platform:** Google Sheets (primary) · Excel 365 (compatible for most formulas)  
**Brand:** upGrad School of Technology

---

## Open in Google Sheets (recommended)

1. Upload `uGSOT_Loan_Operations_System.xlsx` to Google Drive.
2. Open with **Google Sheets**.
3. Allow recalculation (may take 10–30s on first open).
4. Confirm `09_Dashboard` KPIs:
   - Need Loan ≈ **159**
   - Dup Vendors ≈ **62**
   - Need FLDG ≈ **21**
   - Need Vidyalakshmi ≈ **24**
   - Disbursed ≈ **4**
5. Open `10_Ops_Views` — FILTER formulas should spill lists.
6. Hide (optional): `03_Helper`, `08_Dashboard_Tables` from casual users via Protect + Hide.

---

## Daily usage

| Role | Where | What |
|------|-------|------|
| Leadership | `09_Dashboard` | Read KPIs, funnel, vendors, campus, risk |
| Operations | `10_Ops_Views` | Pending / FLDG / Vidyalakshmi / Dup / Critical |
| Operations | `04_Student_360` | AutoFilter / Ctrl+F student search |
| Data entry | `01_Master_Data` | Paste/append rows only |
| Admin | `02_Configuration` | Vendors, stages, campus map, cycle label |

**Never type KPI numbers onto the Dashboard.**

---

## Adding new students

1. Append a row on `01_Master_Data` (same columns).
2. Copy the last formula row on `03_Helper` down one row.
3. Copy the last formula row on `04_Student_360` down one row.
4. Dashboard COUNTIFs update automatically.

---

## Architecture

```
01_Master_Data → 03_Helper → Analytics (04–07) → 08_Dashboard_Tables → 09_Dashboard
                      ↘ 10_Ops_Views (FILTER)
02_Configuration → maps used by Helper
```

---

## Multi-vendor rule (critical)

- **Unique Students** ≠ sum of status tokens  
- **Applications** = Shared-to Yes flags  
- **Duplicate** = VendorCount ≥ 2  
- Overlap matrix = students shared to both vendors  

See `05_Vendor_Analytics`.

---

## Legacy workbook

Keep `Master sheet - Loans .xlsx` as archive. Do not dual-edit.  
Full audit: `PHASE1_AUDIT_AND_ARCHITECTURE.md`.

---

## Known limits (v1)

- No Email/Course/Admission Cycle column in Master → filters reserved; cycle is a Config label.
- Ageing uses `Tentative Loan Date` when present; else **Unknown**.
- Auxilo / InCred are Config placeholders (Active=No).
- Refund IMPORTRANGE / Merit join not re-wired in v1 (can add as integration sheets).
