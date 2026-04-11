import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-session";
import { createUser, getUserByUsername, toPublicUser } from "@/lib/user-store";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3-24 chars (letters, numbers, underscore)." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
    }

    const user = await createUser({ username, passwordHash: hashPassword(password) });
    const token = createSessionToken(user.id);

    const res = NextResponse.json({ ok: true, user: toPublicUser(user) });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Registration failed." }, { status: 500 });
  }
}
