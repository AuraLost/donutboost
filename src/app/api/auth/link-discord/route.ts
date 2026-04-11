import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session-user";
import { linkDiscordAndAward, toPublicUser } from "@/lib/user-store";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1491214914075889664";
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "https://www.donutboost.lol/";

type DiscordOAuthResponse = {
  access_token?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type DiscordUserResponse = {
  id?: string;
  username?: string;
  global_name?: string | null;
  email?: string | null;
};

const exchangeDiscordCode = async (code: string) => {
  const clientSecret = (process.env.DISCORD_CLIENT_SECRET || "").trim();
  if (!clientSecret) {
    throw new Error("Missing DISCORD_CLIENT_SECRET on server.");
  }

  const body = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: DISCORD_REDIRECT_URI,
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const tokenData = (await tokenRes.json()) as DiscordOAuthResponse;
  if (!tokenRes.ok || !tokenData?.access_token) {
    const reason = tokenData?.error_description || tokenData?.error || "Token exchange failed.";
    throw new Error(`Discord OAuth failed: ${reason}`);
  }

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    cache: "no-store",
  });

  const userData = (await userRes.json()) as DiscordUserResponse;
  if (!userRes.ok || !userData?.id || !userData?.username) {
    throw new Error("Could not fetch Discord profile.");
  }

  const discordHandle = userData.global_name?.trim() || userData.username.trim();
  return {
    handle: discordHandle,
    id: userData.id,
    email: userData.email || null,
  };
};

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const oauthCode = String(body?.code || "").trim();

    let discordUsername = String(body?.discordUsername || "").trim();
    if (oauthCode) {
      const profile = await exchangeDiscordCode(oauthCode);
      discordUsername = profile.handle;
    }

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
