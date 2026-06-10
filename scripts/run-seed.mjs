// Aplica os arquivos de seed (seed/sql/*.sql) no D1, em ordem, via wrangler.
//
// Uso:
//   node scripts/run-seed.mjs --local
//   node scripts/run-seed.mjs --remote

import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlDir = join(__dirname, "..", "seed", "sql");

const target = process.argv[2];
if (target !== "--local" && target !== "--remote") {
    console.error("Uso: node scripts/run-seed.mjs --local|--remote");
    process.exit(1);
}

const files = readdirSync(sqlDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

for (const file of files) {
    const filePath = join(sqlDir, file);
    console.log(`Aplicando ${file} (${target})...`);
    execSync(
        `npx wrangler d1 execute fabula_ultima_db ${target} --file "${filePath}" --yes`,
        { stdio: "inherit" },
    );
}
