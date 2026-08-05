const DEFAULT_SHEET_ID = "1SO9nc0jSN4ifviovO3IezRshTCbj66IIn38NT5J4yhI";
const DEFAULT_TAB = "Master data";

export type FetchCsvResult =
  | { ok: true; csv: string }
  | { ok: false; message: string };

export async function fetchSheetCsv(): Promise<FetchCsvResult> {
  const sheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
  const tab = process.env.SHEET_TAB_NAME || DEFAULT_TAB;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return {
        ok: false,
        message: `Sheet export failed (${res.status}). Check that the sheet is link-viewable and the tab name is correct.`,
      };
    }

    const csv = await res.text();
    if (!csv.trim()) {
      return { ok: false, message: "Sheet returned empty data." };
    }

    // Google sometimes returns an HTML login page instead of CSV
    if (csv.trimStart().startsWith("<!DOCTYPE") || csv.includes("<html")) {
      return {
        ok: false,
        message:
          "Could not read sheet — ensure it is shared as “Anyone with the link can view”.",
      };
    }

    return { ok: true, csv };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error fetching sheet.",
    };
  }
}
