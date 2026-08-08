import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/** Must match portal handoff audience (`createHandoffToken`). */
const HANDOFF_AUD = "loan-ops";
/** Long-lived session cookie audience on this app. */
const SESSION_AUD = "loan-ops-app";

export const LOAN_OPS_SESSION_COOKIE = "loan_ops_session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function getPortalSecret(): Uint8Array | null {
  const raw = process.env.PORTAL_AUTH_SECRET?.trim();
  if (!raw) return null;
  return new TextEncoder().encode(raw);
}

export function hasPortalSecret(): boolean {
  return Boolean(process.env.PORTAL_AUTH_SECRET?.trim());
}

/** Production always requires portal auth; dev only when secret is set. */
export function isPortalAuthEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  return hasPortalSecret();
}

export function getPortalLoginUrl(): string {
  const raw = process.env.PORTAL_LOGIN_URL?.trim();
  if (raw) return raw;
  return "https://ops-digial-partner-dashboard.vercel.app/login";
}

function requirePortalSecret(): Uint8Array {
  const secret = getPortalSecret();
  if (!secret) {
    throw new Error("PORTAL_AUTH_SECRET is not configured");
  }
  return secret;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

interface TokenPayload extends JWTPayload {
  email?: string;
}

/** Verify short-lived handoff JWT from the reports portal. */
export async function verifyHandoffToken(
  token: string,
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, requirePortalSecret(), {
      audience: HANDOFF_AUD,
    });
    const email = (payload as TokenPayload).email ?? payload.sub;
    if (!email) return null;
    return { email: normalizeEmail(String(email)) };
  } catch {
    return null;
  }
}

/** Create long-lived loan-ops session JWT after a successful handoff. */
export async function createLoanOpsSessionToken(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  return new SignJWT({ email: normalized })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(normalized)
    .setIssuedAt()
    .setExpirationTime("30d")
    .setAudience(SESSION_AUD)
    .sign(requirePortalSecret());
}

export async function verifyLoanOpsSessionToken(
  token: string | undefined,
): Promise<{ email: string } | null> {
  if (!token || !hasPortalSecret()) return null;
  try {
    const { payload } = await jwtVerify(token, requirePortalSecret(), {
      audience: SESSION_AUD,
    });
    const email = (payload as TokenPayload).email ?? payload.sub;
    if (!email) return null;
    return { email: normalizeEmail(String(email)) };
  } catch {
    return null;
  }
}
