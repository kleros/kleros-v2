import fs from "fs";
import path from "path";

/** Loads web/.env.local and the university public env into process.env (without overriding existing values). Never logs values. */
export const loadEnv = () => {
  for (const name of [".env.local", ".env.devnet-university.public"]) loadFile(path.resolve(process.cwd(), name));
};

const loadFile = (file: string) => {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.replace(/^export\s+/, "").match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[m[1]] === undefined && value !== "") process.env[m[1]] = value;
  }
};

export const missingEnv = (names: string[]) => names.filter((n) => !process.env[n]);
