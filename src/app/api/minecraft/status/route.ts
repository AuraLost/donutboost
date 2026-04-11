import { NextResponse } from "next/server";
import { getVerificationStatus } from "@/lib/minecraft-verification";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptionsForHost } from "@/lib/auth-session";
import { getSessionPayload } from "@/lib/session-user";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const webUserId = searchParams.get("webUserId")?.trim() || "";
    if (!webUserId) {
      return NextResponse.json({ error: "Missing web user id." }, { status: 400 });
    }

    const row = await getVerificationStatus(webUserId);
    if (!row) {
      return NextResponse.json({ status: "none" });
    }

    const res = NextResponse.json({
      status: row.status,
      code: row.code,
      expiresAt: row.expires_at,
      minecraftUsername: row.minecraft_username,
      verifiedAt: row.verified_at,
      attempts: row.attempts,
    });

    // If this request is from the same logged-in user and verification is complete, upgrade session.
    if (row.status === "verified") {
      const session = await getSessionPayload();
      if (session?.uid && session.uid === webUserId && !session.verified) {
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
        res.cookies.set(SESSION_COOKIE, createSessionToken(session.uid, true), sessionCookieOptionsForHost(host));
      }
    }

    return res;
  } catch {
    return NextResponse.json({ error: "Failed to read verification status." }, { status: 500 });
  }
}
