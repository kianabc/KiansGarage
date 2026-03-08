import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kians-garage-2024";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ token: ADMIN_PASSWORD });
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
