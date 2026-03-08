import fs from "fs";
import path from "path";

interface Config {
  adminPassword: string;
}

const CONFIG_PATH = path.join(process.cwd(), "src/data/config.json");

export function getConfig(): Config {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || getConfig().adminPassword;
}

export function setAdminPassword(newPassword: string): void {
  const config = getConfig();
  config.adminPassword = newPassword;
  saveConfig(config);
}
