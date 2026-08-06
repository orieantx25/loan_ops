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

1. **Sync & deploy** (header, localhost): syncs sheet → git push → Vercel deploy
2. **CLI:** `npm run sync:push` from repo root
3. **Excel fallback:** `python extract_json.py` then `npm run sync:push`
