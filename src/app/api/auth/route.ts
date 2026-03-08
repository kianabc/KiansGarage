import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword, setAdminPassword } from "@/lib/config";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === (await getAdminPassword())) {
    return NextResponse.json({ token: password });
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function PUT(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${await getAdminPassword()}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newPassword } = await request.json();

  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters" },
      { status: 400 }
    );
  }

  await setAdminPassword(newPassword);
  return NextResponse.json({ token: newPassword });
}
