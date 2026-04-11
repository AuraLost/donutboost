import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-session";

const PUBLIC_PATHS = ["/", "/landing"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api/auth/") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = verifySessionToken(token);

  if (!valid) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Must complete Minecraft verification before accessing games.
  if (pathname.startsWith("/games/") && !valid.verified) {
    const verifyUrl = new URL("/", request.url);
    return NextResponse.redirect(verifyUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/games/:path*",
    "/daily/:path*",
    "/livebets/:path*",
    "/provably-fair/:path*",
    "/referrals/:path*",
    "/api/economy/:path*",
    "/api/minecraft/:path*",
  ],
};
