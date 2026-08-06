import { DATA_SYNCED_AT } from "./syncTimestamp";

export const DATA_CYCLE = "2026 Cycle";

const AS_OF_OPTS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function formatAsOfDisplay(iso: string = DATA_SYNCED_AT): string {
  try {
    return new Date(iso).toLocaleString("en-IN", AS_OF_OPTS);
  } catch {
    return iso;
  }
}

export function formatAsOfParts(iso: string = DATA_SYNCED_AT): {
  date: string;
  time: string;
} {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

/** @deprecated Use formatAsOfDisplay() for date + time */
export const DATA_AS_OF = formatAsOfDisplay();
