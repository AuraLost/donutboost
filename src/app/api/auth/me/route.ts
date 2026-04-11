import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session-user";
import { getUserById, toPublicUser } from "@/lib/user-store";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ user: null }, { status: 401 });

    const user = await getUserById(userId);
    if (!user) return NextResponse.json({ user: null }, { status: 401 });

    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load session." }, { status: 500 });
  }
}
