import { db } from "./db";
import type { Row } from "@libsql/client";

export interface Bike {
  id: string;
  show: boolean;
  sold: boolean;
  pending: boolean;
  ownerName: string;
  ownerPhone: string;
  ranking: number;
  statusChangedAt: string;
  title: string;
  description: string;
  specs: { label: string; value: string }[];
  originalPrice: string;
  price: string;
  year: string;
  mainImage: string;
  gallery: string[];
  slug: string;
  background: string;
  foreground: string;
}

function rowToBike(row: Row): Bike {
  return {
    id: row.id as string,
    show: row.show === 1,
    sold: row.sold === 1,
    pending: row.pending === 1,
    ownerName: row.owner_name as string,
    ownerPhone: row.owner_phone as string,
    ranking: row.ranking as number,
    statusChangedAt: row.status_changed_at as string,
    title: row.title as string,
    description: row.description as string,
    specs: JSON.parse((row.specs as string) || "[]"),
    originalPrice: row.original_price as string,
    price: row.price as string,
    year: row.year as string,
    mainImage: row.main_image as string,
    gallery: JSON.parse((row.gallery as string) || "[]"),
    slug: row.slug as string,
    background: row.background as string,
    foreground: row.foreground as string,
  };
}

export async function getBikes(): Promise<Bike[]> {
  const result = await db.execute("SELECT * FROM bikes");
  return result.rows.map(rowToBike);
}

export async function getBikesSorted(): Promise<Bike[]> {
  const result = await db.execute(
    `SELECT * FROM bikes WHERE show = 1 AND pending = 0
     ORDER BY sold ASC,
       CASE WHEN status_changed_at = '' THEN '1970-01-01' ELSE status_changed_at END DESC,
       ranking ASC`
  );
  return result.rows.map(rowToBike);
}

export async function getBikeBySlug(slug: string): Promise<Bike | undefined> {
  const result = await db.execute({
    sql: "SELECT * FROM bikes WHERE slug = ? AND pending = 0 LIMIT 1",
    args: [slug],
  });
  return result.rows.length > 0 ? rowToBike(result.rows[0]) : undefined;
}

export async function saveBike(bike: Bike): Promise<void> {
  await db.execute({
    sql: `INSERT OR REPLACE INTO bikes (id, show, sold, pending, owner_name, owner_phone, ranking, status_changed_at, title, description, specs, original_price, price, year, main_image, gallery, slug, background, foreground)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      bike.id,
      bike.show ? 1 : 0,
      bike.sold ? 1 : 0,
      bike.pending ? 1 : 0,
      bike.ownerName,
      bike.ownerPhone,
      bike.ranking,
      bike.statusChangedAt,
      bike.title,
      bike.description,
      JSON.stringify(bike.specs),
      bike.originalPrice,
      bike.price,
      bike.year,
      bike.mainImage,
      JSON.stringify(bike.gallery),
      bike.slug,
      bike.background,
      bike.foreground,
    ],
  });
}

export async function deleteBikeById(id: string): Promise<boolean> {
  const result = await db.execute({
    sql: "DELETE FROM bikes WHERE id = ?",
    args: [id],
  });
  return result.rowsAffected > 0;
}

export async function getBikeById(id: string): Promise<Bike | undefined> {
  const result = await db.execute({
    sql: "SELECT * FROM bikes WHERE id = ? LIMIT 1",
    args: [id],
  });
  return result.rows.length > 0 ? rowToBike(result.rows[0]) : undefined;
}

export async function getMaxRanking(): Promise<number> {
  const result = await db.execute("SELECT MAX(ranking) as max_rank FROM bikes");
  return (result.rows[0]?.max_rank as number) || 0;
}
