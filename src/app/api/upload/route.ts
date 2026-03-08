import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("photos") as File[];
  const uploadId = (formData.get("uploadId") as string) || randomUUID();

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public/images/bikes", uploadId);
  await mkdir(dir, { recursive: true });

  const paths: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `${file.name}: Only JPEG, PNG, and WebP images are allowed` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `${file.name}: File too large (max 15MB)` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = i === 0 && !paths.length ? `main.${ext}` : `${i}.${ext}`;
    const filepath = path.join(dir, filename);

    await writeFile(filepath, buffer);
    paths.push(`/images/bikes/${uploadId}/${filename}`);
  }

  return NextResponse.json({ uploadId, paths });
}
