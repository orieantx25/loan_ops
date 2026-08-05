# Loan Operations Dashboard (Web)

The Vercel-publishable app lives in **`web/`**.

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npx vercel       # deploy
```

Scroll-section layout with sticky filters/nav, clickable KPIs, filter chips/presets, and Student 360 drawer. See `web/README.md` for the section map and metric definitions.

Refresh data (no API key):

1. **Local dev — Sync button** (header, localhost only): fetches the public Google Sheet and updates `students.json` + `dataMeta.ts`, then reloads.
2. **Excel fallback:** `python extract_json.py` from repo root.

Then commit and push to deploy updated data to Vercel.
