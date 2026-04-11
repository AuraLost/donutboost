import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "donutboost_session";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_TTL_MS = 30 * ONE_DAY_MS;

type SessionPayload = {
  uid: string;
  exp: number;
};

const base64UrlEncode = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const base64UrlDecode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const getSecret = () => {
  const secret = (process.env.AUTH_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!secret) throw new Error("Missing AUTH_SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY fallback).");
  return secret;
};

const sign = (data: string) => createHmac("sha256", getSecret()).update(data).digest("base64url");

export const createSessionToken = (uid: string) => {
  const payload: SessionPayload = { uid, exp: Date.now() + SESSION_TTL_MS };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
};

export const verifySessionToken = (token: string | undefined | null): SessionPayload | null => {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    if (!payload?.uid || typeof payload.exp !== "number") return null;
    if (payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

const resolveCookieDomain = (host: string | null) => {
  const fromEnv = (process.env.SESSION_COOKIE_DOMAIN || "").trim();
  if (fromEnv) return fromEnv;
  if (!host) return undefined;
  const clean = host.split(":")[0].toLowerCase();
  if (clean === "localhost" || clean === "127.0.0.1") return undefined;
  if (clean === "donutboost.lol" || clean.endsWith(".donutboost.lol")) return ".donutboost.lol";
  return undefined;
};

export const sessionCookieOptionsForHost = (host: string | null) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
  domain: resolveCookieDomain(host),
});
