import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  constantTimeEqual,
  createSessionToken,
  isAuthEnabled,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = body.password ?? "";
  const expected = process.env.SITE_PASSWORD!.trim();

  // Small delay to slow brute force
  await new Promise((r) => setTimeout(r, 400));

  if (!constantTimeEqual(password, expected)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createSessionToken(process.env.AUTH_SECRET!.trim());
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
