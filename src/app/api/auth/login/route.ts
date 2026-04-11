import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-session";
import { createUser, getUserByUsername, toPublicUser } from "@/lib/user-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawUsername = String(body?.minecraftUsername || body?.username || "").trim();

    if (!/^[a-zA-Z0-9_]{3,16}$/.test(rawUsername)) {
      return NextResponse.json({ error: "Minecraft username must be 3-16 chars (letters, numbers, underscore)." }, { status: 400 });
    }

    let user = await getUserByUsername(rawUsername);
    let firstLogin = false;

    if (!user) {
      firstLogin = true;
      try {
        user = await createUser({ username: rawUsername });
      } catch {
        // Handles race conditions where multiple requests create same user.
        user = await getUserByUsername(rawUsername);
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Could not login right now. Try again." }, { status: 500 });
    }

    const token = createSessionToken(user.id);
    const res = NextResponse.json({ ok: true, firstLogin, user: toPublicUser(user) });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed." }, { status: 500 });
  }
}
