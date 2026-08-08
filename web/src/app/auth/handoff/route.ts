import { NextRequest, NextResponse } from "next/server";
import {
  LOAN_OPS_SESSION_COOKIE,
  SESSION_MAX_AGE,
  createLoanOpsSessionToken,
  getPortalLoginUrl,
  hasPortalSecret,
  isPortalAuthEnabled,
  verifyHandoffToken,
} from "@/lib/portal-auth";

/**
 * GET /auth/handoff?token=<jwt>
 * Accepts a short-lived portal handoff JWT, sets loan_ops_session, redirects to /.
 */
export async function GET(request: NextRequest) {
  const loginUrl = getPortalLoginUrl();

  if (!isPortalAuthEnabled() || !hasPortalSecret()) {
    const dest = new URL(loginUrl);
    dest.searchParams.set("return", "loans");
    dest.searchParams.set("error", "misconfigured");
    return NextResponse.redirect(dest);
  }

  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    const dest = new URL(loginUrl);
    dest.searchParams.set("return", "loans");
    dest.searchParams.set("error", "missing_token");
    return NextResponse.redirect(dest);
  }

  const session = await verifyHandoffToken(token);
  if (!session) {
    const dest = new URL(loginUrl);
    dest.searchParams.set("return", "loans");
    dest.searchParams.set("error", "invalid_token");
    return NextResponse.redirect(dest);
  }

  const sessionJwt = await createLoanOpsSessionToken(session.email);
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(LOAN_OPS_SESSION_COOKIE, sessionJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
