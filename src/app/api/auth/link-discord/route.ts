import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session-user";
import { linkDiscordAndAward, toPublicUser } from "@/lib/user-store";

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const discordUsername = String(body?.discordUsername || "").trim();

    if (discordUsername.length < 2 || discordUsername.length > 64) {
      return NextResponse.json({ error: "Invalid Discord username." }, { status: 400 });
    }

    const user = await linkDiscordAndAward(userId, discordUsername);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    return NextResponse.json({ ok: true, user: toPublicUser(user) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to link Discord." }, { status: 500 });
  }
}
