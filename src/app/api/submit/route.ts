import { NextRequest, NextResponse } from "next/server";
import { getBikes, saveBikes } from "@/lib/bikes";
import type { Bike } from "@/lib/bikes";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title || !body.ownerName || !body.description || !body.price) {
    return NextResponse.json(
      { error: "Title, your name, description, and price are required" },
      { status: 400 }
    );
  }

  const bikes = getBikes();

  const newBike: Bike = {
    id: randomUUID(),
    show: false,
    sold: false,
    pending: true,
    ownerName: body.ownerName,
    ownerPhone: body.ownerPhone || "",
    ranking: Math.max(...bikes.map((b) => b.ranking), 0) + 1,
    statusChangedAt: new Date().toISOString(),
    title: body.title,
    description: body.description,
    specs: body.specs || [],
    originalPrice: body.originalPrice || "",
    price: body.price,
    year: body.year || "",
    mainImage: body.mainImage || "",
    gallery: body.gallery || [],
    slug: body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    background: "",
    foreground: "",
  };

  bikes.push(newBike);
  saveBikes(bikes);

  return NextResponse.json({ success: true, id: newBike.id }, { status: 201 });
}
