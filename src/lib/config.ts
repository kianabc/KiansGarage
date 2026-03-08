import { db } from "./db";

export async function getAdminPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const result = await db.execute({
    sql: "SELECT value FROM config WHERE key = ?",
    args: ["adminPassword"],
  });
  return (result.rows[0]?.value as string) || "";
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  await db.execute({
    sql: "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
    args: ["adminPassword", newPassword],
  });
}
