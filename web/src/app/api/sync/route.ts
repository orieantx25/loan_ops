import { NextResponse } from "next/server";
import { syncFromGoogleSheet } from "@/lib/syncDataFiles";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { ok: false, message: "Sync is only available in local development." },
      { status: 403 },
    );
  }

  const result = await syncFromGoogleSheet();
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
