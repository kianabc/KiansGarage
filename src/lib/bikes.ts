import fs from "fs";
import path from "path";

export interface Bike {
  id: string;
  show: boolean;
  sold: boolean;
  ranking: number;
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
  const bikes = getBikes().filter((b) => b.show);
  return bikes.sort((a, b) => {
    // Unsold first, then by ranking ascending
    if (a.sold !== b.sold) return a.sold ? 1 : -1;
    return a.ranking - b.ranking;
  });
}

export function getBikeBySlug(slug: string): Bike | undefined {
  return getBikes().find((b) => b.slug === slug);
}

export function saveBikes(bikes: Bike[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(bikes, null, 2));
}
