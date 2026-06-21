import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../../src/index";
import { signJwt } from "../../src/utils/jwt";

// Cobre a Fase 4 do plano de correções: o endpoint de assinatura de upload
// (POST /v1/campaigns/:campaignId/uploads/signature) é aberto a qualquer
// membro da campanha e cada assinatura permite um upload real ao Cloudinary,
// mesmo sem vincular a entidade — sem limite, isso permitia esgotar a cota
// gratuita gerando assinaturas em loop. Limite configurado: 10 por minuto
// por usuário (vitest.integration.config.ts espelha wrangler.jsonc).

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

describe("Rate limit do endpoint de assinatura de upload (integration)", () => {
	const db = env.fabula_ultima_db;

	let memberId: number;
	let campaignId: number;
	let token: string;

	beforeAll(async () => {
		memberId = await createUser(db, "member@ratelimit-test.com", "ratelimit_member");
		campaignId = await createCampaign(db, "Campanha (ratelimit-test)");
		await addMember(db, campaignId, memberId, "player");
		token = await signJwt({ sub: memberId, email: "member@ratelimit-test.com", is_super_user: false }, env.JWT_SECRET);
	});

	it("permite até 10 assinaturas por minuto e bloqueia a 11ª com 429", async () => {
		for (let i = 0; i < 10; i++) {
			const res = await app.request(
				`/v1/campaigns/${campaignId}/uploads/signature?entity_type=npc`,
				{ method: "POST", headers: authHeaders(token) },
				env,
			);
			expect(res.status).toBe(200);
		}

		const res = await app.request(
			`/v1/campaigns/${campaignId}/uploads/signature?entity_type=npc`,
			{ method: "POST", headers: authHeaders(token) },
			env,
		);

		expect(res.status).toBe(429);
		const body = await res.json();
		expect(body).toMatchObject({ success: false, error: { code: "TOO_MANY_REQUESTS" } });
	});

	it("não bloqueia um usuário diferente mesmo após o primeiro esgotar o limite", async () => {
		const otherUserId = await createUser(db, "other@ratelimit-test.com", "ratelimit_other");
		await addMember(db, campaignId, otherUserId, "player");
		const otherToken = await signJwt({ sub: otherUserId, email: "other@ratelimit-test.com", is_super_user: false }, env.JWT_SECRET);

		const res = await app.request(
			`/v1/campaigns/${campaignId}/uploads/signature?entity_type=npc`,
			{ method: "POST", headers: authHeaders(otherToken) },
			env,
		);

		expect(res.status).toBe(200);
	});
});
