import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-session";
import { getUserByUsername, toPublicUser } from "@/lib/user-store";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password." }, { status: 400 });
    }

    const user = await getUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const token = createSessionToken(user.id);
    const res = NextResponse.json({ ok: true, user: toPublicUser(user) });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed." }, { status: 500 });
  }
}
