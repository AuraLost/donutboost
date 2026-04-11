import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session-user";
import { syncEconomy, toPublicUser } from "@/lib/user-store";

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const payload = {
      balance: Number(body?.balance ?? 0),
      totalWins: Number(body?.totalWins ?? 0),
      totalLosses: Number(body?.totalLosses ?? 0),
      totalWagered: Number(body?.totalWagered ?? 0),
      totalPayout: Number(body?.totalPayout ?? 0),
    };

    if (Object.values(payload).some((v) => !Number.isFinite(v))) {
      return NextResponse.json({ error: "Invalid numeric payload." }, { status: 400 });
    }

    const updated = await syncEconomy(userId, payload);
    return NextResponse.json({ ok: true, user: toPublicUser(updated) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed." }, { status: 500 });
  }
}
