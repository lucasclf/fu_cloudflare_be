import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export async function applyMigrations(db: D1Database): Promise<void> {
	const migrationsDir = join(process.cwd(), "migrations");

	const files = readdirSync(migrationsDir)
		.filter((f) => f.endsWith(".sql"))
		.sort();

	for (const file of files) {
		const sql = readFileSync(join(migrationsDir, file), "utf-8");
		await db.exec(sql);
	}
}
