import { NextResponse } from "next/server";
import { getVerificationStatus } from "@/lib/minecraft-verification";

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

    return NextResponse.json({
      status: row.status,
      code: row.code,
      expiresAt: row.expires_at,
      minecraftUsername: row.minecraft_username,
      verifiedAt: row.verified_at,
      attempts: row.attempts,
    });
  } catch {
    return NextResponse.json({ error: "Failed to read verification status." }, { status: 500 });
  }
}
