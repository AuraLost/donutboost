import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Signup is disabled. Use login with your Minecraft username." },
    { status: 410 }
  );
}
