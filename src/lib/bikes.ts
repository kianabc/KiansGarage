import fs from "fs";
import path from "path";

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

const DATA_PATH = path.join(process.cwd(), "src/data/bikes.json");

export function getBikes(): Bike[] {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export function getBikesSorted(): Bike[] {
  const bikes = getBikes().filter((b) => b.show && !b.pending);
  return bikes.sort((a, b) => {
    if (a.sold !== b.sold) return a.sold ? 1 : -1;
    const aTime = a.statusChangedAt || "1970-01-01";
    const bTime = b.statusChangedAt || "1970-01-01";
    if (aTime !== bTime) return bTime.localeCompare(aTime);
    return a.ranking - b.ranking;
  });
}

export function getBikeBySlug(slug: string): Bike | undefined {
  return getBikes().find((b) => b.slug === slug && !b.pending);
}

export function saveBikes(bikes: Bike[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(bikes, null, 2));
}
