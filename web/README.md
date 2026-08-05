# uGSOT Loan Operations Dashboard

Vercel-ready Next.js executive dashboard for upGrad School of Technology loan operations.

## Local

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

**Option A — CLI**

```bash
cd web
npx vercel
```

**Option B — GitHub**

1. Push the `web` folder (or monorepo root with Root Directory = `web`)
2. Import project in [vercel.com/new](https://vercel.com/new)
3. Framework: Next.js · Build: `next build` · Output: default

## Refresh data

**Option A — Sync button (localhost, no API key)**

1. Run `npm run dev` locally
2. Click **Sync sheet** in the header (dev only)
3. Sheet must be link-viewable: [Master data tab](https://docs.google.com/spreadsheets/d/1SO9nc0jSN4ifviovO3IezRshTCbj66IIn38NT5J4yhI)
4. Commit `src/data/students.json` and `src/lib/dataMeta.ts`, then push to deploy

Optional env in `.env.local` (defaults work out of the box):

```env
GOOGLE_SHEET_ID=1SO9nc0jSN4ifviovO3IezRshTCbj66IIn38NT5J4yhI
SHEET_TAB_NAME=Master data
```

**Option B — Excel extract**

```bash
# from repo root
python extract_json.py
```

Then commit updated `src/data/students.json` and `src/lib/dataMeta.ts`.

## Layout (scroll sections)

Sticky filters + section nav: **Summary → Pipeline → Intake → Vendors → Campus → Risk → Students**

| Zone | Content |
|------|---------|
| Summary | Pipeline health KPIs (Need Loan hero + Processing / Sanctioned / Disbursed / Rejected) and Attention KPIs. Click a KPI to filter; click again to clear. |
| Pipeline | Funnel + stage distribution (stage-colored bars) |
| Intake | SST input, require-loan bifurcation, not-started reasons |
| Vendors | Sortable vendor cards (Applications vs Unique only bars) |
| Campus | Campus table with Need Loan heat |
| Risk | Risk / ageing / drop-off bars |
| Students | Top pending, FLDG, Vidyalakshmi, critical, multi-vendor + overlap matrix. Row click opens Student 360 drawer. Export CSV per table. |

Filter presets: **Need attention**, **Not started**, **Multi-vendor**. Active filters show as removable chips.

## Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS 4
- Client-side analytics (same business rules as the Sheets workbook)
- SoT brand: `#E31C24` / `#111111` / `#F6F6F6`

## Metric definitions

| Metric | Definition |
|--------|------------|
| **Need Loan** | `Loan required (Latest)` = Yes — same on KPI cards, funnel, and campus totals |
| **Applications** (per vendor) | All students with Shared-to = Yes for that bank |
| **Unique only** (per vendor) | Students with only that bank partner (`vendorCount === 1`) |
| **Campus Total** | Footer row sums all campuses including **Unassigned** |
| **Not Started** (KPI / filter) | Canonical stage Need Loan or Vendor Assigned |

Campus Need Loan total must equal funnel Need Loan and the top KPI card.
