import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../../src/index";
import { signJwt } from "../../src/utils/jwt";

// Cobre a Fase 2 do plano de correções: operações multi-tabela que antes
// podiam deixar dado parcial/órfão em caso de falha no meio do processo
// (criação de PC com relações, update de monstro com traits/affinities/actions).

async function createUser(db: D1Database, email: string, nickname: string): Promise<number> {
	const row = await db
		.prepare("INSERT INTO users (email, name, nickname, password_hash) VALUES (?, ?, ?, ?) RETURNING id")
		.bind(email, nickname, nickname, "hash")
		.first<{ id: number }>();
	return row!.id;
}

async function createCampaign(db: D1Database, name: string): Promise<number> {
	const row = await db
		.prepare("INSERT INTO campaigns (name) VALUES (?) RETURNING id")
		.bind(name)
		.first<{ id: number }>();
	return row!.id;
}

async function addMember(db: D1Database, campaignId: number, userId: number, role: "master" | "player"): Promise<void> {
	await db.prepare("INSERT INTO campaign_members (campaign_id, user_id, role) VALUES (?, ?, ?)").bind(campaignId, userId, role).run();
}

function authHeaders(token: string) {
	return { "content-type": "application/json", Authorization: `Bearer ${token}` };
}

describe("Atomicidade de operações multi-tabela (integration)", () => {
	const db = env.fabula_ultima_db;

	let masterId: number;
	let campaignId: number;
	let token: string;

	beforeAll(async () => {
		masterId = await createUser(db, "master@atomic-test.com", "atomic_master");
		campaignId = await createCampaign(db, "Campanha (atomic-test)");
		await addMember(db, campaignId, masterId, "master");
		token = await signJwt({ sub: masterId, email: "master@atomic-test.com", is_super_user: false }, env.JWT_SECRET);
	});

	describe("POST /v1/campaigns/:campaignId/pcs — criação de PC com relações", () => {
		it("reverte a criação do PC quando uma relação falha por FK inexistente (sem PC órfão)", async () => {
			const pcName = "PC Órfão — não deve existir";

			const res = await app.request(
				`/v1/campaigns/${campaignId}/pcs`,
				{
					method: "POST",
					headers: authHeaders(token),
					body: JSON.stringify({
						name: pcName,
						description: "desc",
						origin: "origin",
						identity: "identity",
						theme: "theme",
						dexterity_die: "d8",
						insight_die: "d8",
						might_die: "d8",
						willpower_die: "d8",
						jobs: [{ job_id: 999999, level: 1 }],
					}),
				},
				env,
			);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body).toMatchObject({ success: false, error: { code: "BAD_REQUEST" } });

			const pc = await db.prepare("SELECT id FROM pcs WHERE name = ?").bind(pcName).first();
			expect(pc).toBeNull();
		});

		it("cria o PC e todas as relações quando os dados são válidos", async () => {
			const pcName = "PC Válido (atomic-test)";

			const res = await app.request(
				`/v1/campaigns/${campaignId}/pcs`,
				{
					method: "POST",
					headers: authHeaders(token),
					body: JSON.stringify({
						name: pcName,
						description: "desc",
						origin: "origin",
						identity: "identity",
						theme: "theme",
						dexterity_die: "d8",
						insight_die: "d8",
						might_die: "d8",
						willpower_die: "d8",
						bonds: [{ target_type: "freeform", target_name: "Vínculo válido", admiration_axis: "admiration" }],
					}),
				},
				env,
			);

			expect(res.status).toBe(201);

			const pc = await db.prepare("SELECT id FROM pcs WHERE name = ?").bind(pcName).first<{ id: number }>();
			expect(pc).not.toBeNull();

			const bond = await db.prepare("SELECT target_name FROM pc_bonds WHERE pc_id = ?").bind(pc!.id).first<{ target_name: string }>();
			expect(bond?.target_name).toBe("Vínculo válido");
		});
	});

	describe("PATCH /v1/campaigns/:campaignId/monsters/:monsterId — update atômico de relações", () => {
		let monsterId: number;

		beforeAll(async () => {
			const createRes = await app.request(
				`/v1/campaigns/${campaignId}/monsters`,
				{
					method: "POST",
					headers: authHeaders(token),
					body: JSON.stringify({
						name: "Monstro de teste (atomic-test)",
						description: "desc",
						monster_type: "beast",
						level: 1,
						dexterity_die: "d8",
						insight_die: "d8",
						might_die: "d8",
						willpower_die: "d8",
						hp: 10,
						mp: 0,
						initiative: 0,
						defense: 0,
						magic_defense: 0,
						traits: [{ trait: "Voador" }, { trait: "Resistente" }],
					}),
				},
				env,
			);
			expect(createRes.status).toBe(201);

			const monster = await db
				.prepare("SELECT id FROM monsters WHERE name = ?")
				.bind("Monstro de teste (atomic-test)")
				.first<{ id: number }>();
			monsterId = monster!.id;
		});

		it("não apaga os traits antigos quando o update falha por trait duplicada no payload", async () => {
			const res = await app.request(
				`/v1/campaigns/${campaignId}/monsters/${monsterId}`,
				{
					method: "PATCH",
					headers: authHeaders(token),
					body: JSON.stringify({
						name: "Monstro de teste (atomic-test)",
						description: "desc",
						monster_type: "beast",
						level: 1,
						dexterity_die: "d8",
						insight_die: "d8",
						might_die: "d8",
						willpower_die: "d8",
						hp: 10,
						mp: 0,
						initiative: 0,
						defense: 0,
						magic_defense: 0,
						traits: [{ trait: "Duplicada" }, { trait: "Duplicada" }],
					}),
				},
				env,
			);

			expect(res.status).toBe(409);

			const { results } = await db.prepare("SELECT trait FROM monster_traits WHERE monster_id = ? ORDER BY trait").bind(monsterId).all<{ trait: string }>();
			expect(results.map((r) => r.trait)).toEqual(["Resistente", "Voador"]);
		});

		it("atualiza os traits normalmente quando o payload é válido", async () => {
			const res = await app.request(
				`/v1/campaigns/${campaignId}/monsters/${monsterId}`,
				{
					method: "PATCH",
					headers: authHeaders(token),
					body: JSON.stringify({
						name: "Monstro de teste (atomic-test)",
						description: "desc",
						monster_type: "beast",
						level: 1,
						dexterity_die: "d8",
						insight_die: "d8",
						might_die: "d8",
						willpower_die: "d8",
						hp: 10,
						mp: 0,
						initiative: 0,
						defense: 0,
						magic_defense: 0,
						traits: [{ trait: "Furtivo" }],
					}),
				},
				env,
			);

			expect(res.status).toBe(200);

			const { results } = await db.prepare("SELECT trait FROM monster_traits WHERE monster_id = ?").bind(monsterId).all<{ trait: string }>();
			expect(results.map((r) => r.trait)).toEqual(["Furtivo"]);
		});
	});
});
