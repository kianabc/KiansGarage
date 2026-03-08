import { NextRequest, NextResponse } from "next/server";
import { getBikes, saveBikes } from "@/lib/bikes";
import type { Bike } from "@/lib/bikes";
import { randomUUID } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kians-garage-2024";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${ADMIN_PASSWORD}`;
}

export async function GET() {
  const bikes = getBikes();
  // Sort: unsold first, then by ranking
  bikes.sort((a, b) => {
    if (a.sold !== b.sold) return a.sold ? 1 : -1;
    return a.ranking - b.ranking;
  });
  return NextResponse.json(bikes);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const bikes = getBikes();

  const newBike: Bike = {
    id: randomUUID(),
    show: true,
    sold: false,
    ranking: body.ranking || Math.max(...bikes.map((b) => b.ranking), 0) + 1,
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

  bikes.push(newBike);
  saveBikes(bikes);

  return NextResponse.json(newBike, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const bikes = getBikes();
  const index = bikes.findIndex((b) => b.id === body.id);

  if (index === -1) {
    return NextResponse.json({ error: "Bike not found" }, { status: 404 });
  }

  bikes[index] = { ...bikes[index], ...body };
  saveBikes(bikes);

  return NextResponse.json(bikes[index]);
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const bikes = getBikes();
  const filtered = bikes.filter((b) => b.id !== id);

  if (filtered.length === bikes.length) {
    return NextResponse.json({ error: "Bike not found" }, { status: 404 });
  }

  saveBikes(filtered);
  return NextResponse.json({ success: true });
}
