/** Parse RFC-style CSV (handles quoted fields and newlines inside quotes). */
export function parseCsvToRows(text: string): unknown[][] {
  const rows: unknown[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r" && next === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      i++;
    } else if (c === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.map((r) =>
    r.map((cell) => {
      const s = String(cell).trim();
      if (s === "") return null;
      const n = Number(s);
      if (!Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(s)) return n;
      return s;
    }),
  );
}
