import { NextResponse } from "next/server";
import { syncFromGoogleSheet } from "@/lib/syncDataFiles";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  const result = await syncFromGoogleSheet();
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
