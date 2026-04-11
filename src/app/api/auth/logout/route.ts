import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptionsForHost } from "@/lib/auth-session";

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  res.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptionsForHost(host),
    maxAge: 0,
  });
  return res;
}
