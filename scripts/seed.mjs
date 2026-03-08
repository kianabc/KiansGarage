import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const bikes = JSON.parse(readFileSync("src/data/bikes.json", "utf-8"));
const config = JSON.parse(readFileSync("src/data/config.json", "utf-8"));

// Seed config
await db.execute({
  sql: "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
  args: ["adminPassword", config.adminPassword],
});
console.log("Seeded config");

// Seed bikes
for (const b of bikes) {
  await db.execute({
    sql: `INSERT OR REPLACE INTO bikes (id, show, sold, pending, owner_name, owner_phone, ranking, status_changed_at, title, description, specs, original_price, price, year, main_image, gallery, slug, background, foreground)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      b.id,
      b.show ? 1 : 0,
      b.sold ? 1 : 0,
      b.pending ? 1 : 0,
      b.ownerName || "",
      b.ownerPhone || "",
      b.ranking,
      b.statusChangedAt || "",
      b.title,
      b.description,
      JSON.stringify(b.specs),
      b.originalPrice,
      b.price,
      b.year,
      b.mainImage,
      JSON.stringify(b.gallery),
      b.slug,
      b.background || "",
      b.foreground || "",
    ],
  });
  console.log(`Seeded: ${b.title}`);
}

console.log(`Done! Seeded ${bikes.length} bikes.`);
