import { applyD1Migrations, env } from "cloudflare:test";

await applyD1Migrations(env.fabula_ultima_db, env.TEST_MIGRATIONS);
