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

The repo root includes `vercel.json` so GitHub deploys build from the `web/` folder automatically.

1. Import [orieantx25/loan_ops](https://github.com/orieantx25/loan_ops) on [vercel.com/new](https://vercel.com/new)
2. **Root Directory:** leave as `.` (repo root) — `vercel.json` handles the `web/` subfolder
3. No env vars required for static data workflow

Or set **Root Directory = `web`** in Vercel project settings (either approach works).

## Refresh data

**Option A — Sync & deploy (localhost, one click)**

1. Run `npm run dev` in `web/`
2. Click **Sync & deploy** in the header (dev only)
3. This syncs the sheet, commits `students.json` + `syncTimestamp.ts`, pushes to GitHub, and Vercel auto-deploys

**Option B — CLI**

```bash
# from repo root — sync + commit + push
npm run sync:push

# or from web/ only
cd web && npm run sync:push
```

**Option C — Sync only (no deploy)**

Click **Sync** in the header, or run `cd web && npm run sync`.

Sheet must be link-viewable: [Master data tab](https://docs.google.com/spreadsheets/d/1SO9nc0jSN4ifviovO3IezRshTCbj66IIn38NT5J4yhI)

**Option D — Excel extract**

```bash
python extract_json.py
```

Then run `npm run sync:push` or commit manually.

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
