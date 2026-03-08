import { NextRequest, NextResponse } from "next/server";
import { getBikes, saveBike, deleteBikeById, getBikeById, getMaxRanking } from "@/lib/bikes";
import type { Bike } from "@/lib/bikes";
import { getAdminPassword } from "@/lib/config";
import { randomUUID } from "crypto";

async function checkAuth(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${await getAdminPassword()}`;
}

export async function GET() {
  const bikes = await getBikes();
  // Pending first, then unsold, then sold
  bikes.sort((a, b) => {
    if (a.pending !== b.pending) return a.pending ? -1 : 1;
    if (a.sold !== b.sold) return a.sold ? 1 : -1;
    const aTime = a.statusChangedAt || "1970-01-01";
    const bTime = b.statusChangedAt || "1970-01-01";
    if (aTime !== bTime) return bTime.localeCompare(aTime);
    return a.ranking - b.ranking;
  });
  return NextResponse.json(bikes);
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const maxRanking = await getMaxRanking();

  const newBike: Bike = {
    id: randomUUID(),
    show: true,
    sold: false,
    pending: false,
    ownerName: body.ownerName || "",
    ownerPhone: body.ownerPhone || "",
    ranking: body.ranking || maxRanking + 1,
    statusChangedAt: new Date().toISOString(),
    title: body.title || "",
    description: body.description || "",
    specs: body.specs || [],
    originalPrice: body.originalPrice || "",
    price: body.price || "",
    year: body.year || "",
    mainImage: body.mainImage || "",
    gallery: body.gallery || [],
    slug:
      body.slug ||
      body.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") ||
      "",
    background: body.background || "",
    foreground: body.foreground || "",
  };

  await saveBike(newBike);

  return NextResponse.json(newBike, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const existing = await getBikeById(body.id);

  if (!existing) {
    return NextResponse.json({ error: "Bike not found" }, { status: 404 });
  }

  // Track when sold status changes
  if ("sold" in body && body.sold !== existing.sold) {
    body.statusChangedAt = new Date().toISOString();
  }

  const updated = { ...existing, ...body };
  await saveBike(updated);

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const deleted = await deleteBikeById(id);

  if (!deleted) {
    return NextResponse.json({ error: "Bike not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
