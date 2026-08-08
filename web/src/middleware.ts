import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isAuthEnabled, verifySessionToken } from "@/lib/auth";
import {
  LOAN_OPS_SESSION_COOKIE,
  getPortalLoginUrl,
  hasPortalSecret,
  isPortalAuthEnabled,
  verifyLoanOpsSessionToken,
} from "@/lib/portal-auth";

const BLOCKED_BOTS =
  /bot|crawl|spider|scrape|curl|wget|python-requests|httpx|scrapy|headless|phantom|selenium|puppeteer|playwright|bytespider|ahrefs|semrush|petalbot/i;

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/auth/handoff",
  "/robots.txt",
  "/favicon.ico",
];

function isPublicAsset(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/ugsot-logo")) return true;
  if (/\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/i.test(pathname)) return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function securityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );
  return response;
}

function redirectToPortalLogin(
  request: NextRequest,
  extra?: Record<string, string>,
): NextResponse {
  const dest = new URL(getPortalLoginUrl());
  dest.searchParams.set("return", "loans");
  dest.searchParams.set("from", request.nextUrl.pathname);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      dest.searchParams.set(k, v);
    }
  }
  return securityHeaders(NextResponse.redirect(dest));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProd = process.env.NODE_ENV === "production";

  // Keep sync/admin APIs off the public production surface.
  // Portal handoff lives at /auth/handoff (not under /api).
  if (isProd && pathname.startsWith("/api/")) {
    return securityHeaders(new NextResponse("Not Found", { status: 404 }));
  }

  if (isProd && !isPublicAsset(pathname)) {
    const ua = request.headers.get("user-agent") ?? "";
    if (BLOCKED_BOTS.test(ua)) {
      return securityHeaders(new NextResponse("Forbidden", { status: 403 }));
    }
  }

  // Portal SSO — always enforced in production (fail closed)
  if (isPortalAuthEnabled() && !isPublicAsset(pathname)) {
    if (!hasPortalSecret()) {
      if (pathname.startsWith("/api/")) {
        return securityHeaders(
          new NextResponse(JSON.stringify({ error: "Service misconfigured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      return redirectToPortalLogin(request, { error: "misconfigured" });
    }

    const portalToken = request.cookies.get(LOAN_OPS_SESSION_COOKIE)?.value;
    const portalSession = await verifyLoanOpsSessionToken(portalToken);
    if (!portalSession) {
      if (pathname.startsWith("/api/")) {
        return securityHeaders(
          new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      return redirectToPortalLogin(request);
    }
    return securityHeaders(NextResponse.next());
  }

  // Legacy password gate (optional / currently disabled via isAuthEnabled)
  if (isAuthEnabled() && !isPublicAsset(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const valid = await verifySessionToken(
      token,
      process.env.AUTH_SECRET!.trim(),
    );
    if (!valid) {
      if (pathname.startsWith("/api/")) {
        return securityHeaders(
          new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      const login = new URL("/login", request.url);
      login.searchParams.set("from", pathname);
      return securityHeaders(NextResponse.redirect(login));
    }
  }

  return securityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
