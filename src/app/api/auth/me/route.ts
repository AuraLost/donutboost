import { NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/session-user";
import { getUserById, toPublicUser } from "@/lib/user-store";

export async function GET() {
  try {
    const session = await getSessionPayload();
    if (!session?.uid) return NextResponse.json({ user: null }, { status: 401 });

    const user = await getUserById(session.uid);
    if (!user) return NextResponse.json({ user: null }, { status: 401 });

    return NextResponse.json({ user: toPublicUser(user), verified: Boolean(session.verified) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load session." }, { status: 500 });
  }
}
