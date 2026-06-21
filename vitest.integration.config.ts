import { join } from "node:path";
import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

// readD1Migrations roda em Node real (fora do sandbox workerd), evitando o
// acesso a node:fs de dentro do worker — caminhos absolutos do Windows (ex.:
// "G:\...") não são resolvíveis pelo shim de fs do workerd usado nos testes.
const migrationsPath = join(__dirname, "migrations");

export default defineWorkersConfig(async () => {
	const migrations = await readD1Migrations(migrationsPath);

	return {
		test: {
			include: ["test/integration/**/*.spec.ts"],
			setupFiles: ["./test/integration/apply-migrations.ts"],
			poolOptions: {
				workers: {
					// isolatedStorage: false — os specs existentes (e os novos de
					// autorização) aplicam migrations/fixtures uma vez em beforeAll e
					// esperam que esse estado persista entre os `it()` do mesmo describe.
					// Com o isolamento padrão (storage resetado por teste), esses dados
					// somem entre testes — mascarando bugs reais (ex.: violação de UNIQUE
					// nunca era de fato exercitada, e listagens com dados de outro teste
					// passavam vazias e sem checar nada).
					isolatedStorage: false,
					wrangler: { configPath: "./wrangler.jsonc" },
					miniflare: {
						d1Databases: ["fabula_ultima_db"],
						bindings: { TEST_MIGRATIONS: migrations },
						ratelimits: {
							UPLOAD_RATE_LIMITER: { simple: { limit: 10, period: 60 } },
						},
					},
				},
			},
		},
	};
});
