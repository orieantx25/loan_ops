const DEFAULT_SHEET_ID = "1SO9nc0jSN4ifviovO3IezRshTCbj66IIn38NT5J4yhI";
const DEFAULT_TAB = "Master data";

export type FetchSheetResult =
  | { ok: true; values: unknown[][] }
  | { ok: false; code: string; message: string };

export async function fetchGoogleSheetValues(): Promise<FetchSheetResult> {
  const sheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
  const tab = process.env.SHEET_TAB_NAME || DEFAULT_TAB;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      code: "API_ERROR",
      message: "GOOGLE_API_KEY is not configured.",
    };
  }

  const range = encodeURIComponent(`${tab}!A:AQ`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.status === 404) {
      return {
        ok: false,
        code: "SHEET_NOT_FOUND",
        message: "Spreadsheet not found or not accessible.",
      };
    }
    if (res.status === 400) {
      return {
        ok: false,
        code: "TAB_NOT_FOUND",
        message: `Tab "${tab}" not found. Check SHEET_TAB_NAME.`,
      };
    }
    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        code: "API_ERROR",
        message: `Google Sheets API error ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as { values?: unknown[][] };
    const values = data.values ?? [];
    if (!values.length) {
      return {
        ok: false,
        code: "TAB_NOT_FOUND",
        message: `Tab "${tab}" returned no data.`,
      };
    }

    return { ok: true, values };
  } catch (e) {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: e instanceof Error ? e.message : "Network error fetching sheet.",
    };
  }
}
