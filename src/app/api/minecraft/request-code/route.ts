import { NextResponse } from "next/server";
import { createVerificationCode } from "@/lib/minecraft-verification";
import { getSessionPayload } from "@/lib/session-user";

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(req: Request) {
  try {
    const session = await getSessionPayload();
    if (!session?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const webUserId = clean(body?.webUserId);
    const requestedUsername = clean(body?.requestedUsername) || null;

    if (!webUserId || webUserId.length < 6 || webUserId.length > 128) {
      return NextResponse.json({ error: "Invalid web user id." }, { status: 400 });
    }
    if (webUserId !== session.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { code, expiresAt } = await createVerificationCode(webUserId, requestedUsername);
    return NextResponse.json({ code, expiresAt });
  } catch {
    return NextResponse.json({ error: "Failed to create verification code." }, { status: 500 });
  }
}
