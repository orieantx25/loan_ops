export const SESSION_COOKIE = "loan_ops_auth";
const SESSION_PAYLOAD = "loan-ops-session-v1";

async function hmacToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SESSION_PAYLOAD));
  return bufferToBase64Url(sig);
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createSessionToken(authSecret: string): Promise<string> {
  return hmacToken(authSecret);
}

export async function verifySessionToken(
  token: string | undefined,
  authSecret: string,
): Promise<boolean> {
  if (!token || !authSecret) return false;
  const expected = await hmacToken(authSecret);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function isAuthEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.SITE_PASSWORD?.trim()) &&
    Boolean(process.env.AUTH_SECRET?.trim())
  );
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
