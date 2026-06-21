import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it, vi } from "vitest";
import app from "../../src/index";
import { signJwt } from "../../src/utils/jwt";

// Cobre os 4 middlewares responsáveis pelo isolamento entre tenants/usuários
// (userAuthMiddleware, campaignMemberMiddleware, pcOwnerMiddleware) — incluindo
// o cenário exato do bug de IDOR corrigido em campaign-routes.ts (PUT de PC
// não validava que o pcId pertencia ao campaignId da URL).

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
	await db
		.prepare("INSERT INTO campaign_members (campaign_id, user_id, role) VALUES (?, ?, ?)")
		.bind(campaignId, userId, role)
		.run();
}

async function createPc(db: D1Database, name: string, userId: number): Promise<number> {
	const row = await db
		.prepare(`
			INSERT INTO pcs (
				name, description, pronouns, origin, identity, theme,
				dexterity_die, insight_die, might_die, willpower_die,
				tagline, money, img_key, user_id
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			RETURNING id
		`)
		.bind(name, "desc", null, "origin", "identity", "theme", "d8", "d8", "d8", "d8", null, 0, null, userId)
		.first<{ id: number }>();
	return row!.id;
}

function pcUpdateBody(name: string) {
	return JSON.stringify({
		name,
		description: "desc",
		pronouns: null,
		origin: "origin",
		identity: "identity",
		theme: "theme",
		dexterity_die: "d8",
		insight_die: "d8",
		might_die: "d8",
		willpower_die: "d8",
		tagline: null,
		money: 0,
		img_key: null,
	});
}

function authHeaders(token: string) {
	return { "content-type": "application/json", Authorization: `Bearer ${token}` };
}

describe("Middlewares de autorização — isolamento entre tenants (integration)", () => {
	const db = env.fabula_ultima_db;

	let masterAId: number;
	let masterBId: number;
	let outsiderId: number;
	let campaignAId: number;
	let campaignBId: number;
	let pcInCampaignBId: number;

	let tokenMasterA: string;
	let tokenMasterB: string;
	let tokenOutsider: string;

	beforeAll(async () => {
		masterAId = await createUser(db, "master-a@auth-test.com", "auth_master_a");
		masterBId = await createUser(db, "master-b@auth-test.com", "auth_master_b");
		outsiderId = await createUser(db, "outsider@auth-test.com", "auth_outsider");

		campaignAId = await createCampaign(db, "Campanha A (auth-test)");
		campaignBId = await createCampaign(db, "Campanha B (auth-test)");

		await addMember(db, campaignAId, masterAId, "master");
		await addMember(db, campaignBId, masterBId, "master");

		pcInCampaignBId = await createPc(db, "PC da Campanha B", masterBId);
		await db.prepare("INSERT INTO campaign_pcs (campaign_id, pc_id) VALUES (?, ?)").bind(campaignBId, pcInCampaignBId).run();

		tokenMasterA = await signJwt({ sub: masterAId, email: "master-a@auth-test.com", is_super_user: false }, env.JWT_SECRET);
		tokenMasterB = await signJwt({ sub: masterBId, email: "master-b@auth-test.com", is_super_user: false }, env.JWT_SECRET);
		tokenOutsider = await signJwt({ sub: outsiderId, email: "outsider@auth-test.com", is_super_user: false }, env.JWT_SECRET);
	});

	describe("userAuthMiddleware", () => {
		it("rejeita requisição sem token com 401", async () => {
			const res = await app.request(
				`/v1/campaigns/${campaignBId}/pcs/${pcInCampaignBId}`,
				{ method: "PUT", headers: { "content-type": "application/json" }, body: pcUpdateBody("Hackeado") },
				env,
			);

			expect(res.status).toBe(401);
		});

		it("rejeita requisição com token inválido com 401", async () => {
			const res = await app.request(
				`/v1/campaigns/${campaignBId}/pcs/${pcInCampaignBId}`,
				{ method: "PUT", headers: authHeaders("token.invalido.assinatura"), body: pcUpdateBody("Hackeado") },
				env,
			);

			expect(res.status).toBe(401);
		});
	});

	describe("campaignMemberMiddleware", () => {
		it("rejeita usuário que não é membro da campanha com 403 e loga a negação", async () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const res = await app.request(
				`/v1/campaigns/${campaignBId}/pcs/${pcInCampaignBId}`,
				{ method: "PUT", headers: authHeaders(tokenOutsider), body: pcUpdateBody("Hackeado") },
				env,
			);

			expect(res.status).toBe(403);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.objectContaining({ event: "authorization_denied", userId: outsiderId, campaignId: campaignBId, reason: "not_a_member" }),
			);

			warnSpy.mockRestore();
		});
	});

	describe("IDOR — PUT /v1/campaigns/:campaignId/pcs/:pcId (regressão)", () => {
		it("master de outra campanha não pode editar PC vinculado apenas à campanha B (404, sem alterar dados, com log da negação)", async () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const res = await app.request(
				`/v1/campaigns/${campaignAId}/pcs/${pcInCampaignBId}`,
				{ method: "PUT", headers: authHeaders(tokenMasterA), body: pcUpdateBody("Editado pelo master errado") },
				env,
			);

			expect(res.status).toBe(404);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.objectContaining({ event: "authorization_denied", userId: masterAId, campaignId: campaignAId, pcId: pcInCampaignBId, reason: "pc_not_in_campaign" }),
			);

			const pc = await db.prepare("SELECT name FROM pcs WHERE id = ?").bind(pcInCampaignBId).first<{ name: string }>();
			expect(pc!.name).toBe("PC da Campanha B");

			warnSpy.mockRestore();
		});

		it("master da própria campanha pode editar o PC vinculado a ela (200)", async () => {
			const res = await app.request(
				`/v1/campaigns/${campaignBId}/pcs/${pcInCampaignBId}`,
				{ method: "PUT", headers: authHeaders(tokenMasterB), body: pcUpdateBody("PC editado pelo master correto") },
				env,
			);

			expect(res.status).toBe(200);

			const pc = await db.prepare("SELECT name FROM pcs WHERE id = ?").bind(pcInCampaignBId).first<{ name: string }>();
			expect(pc!.name).toBe("PC editado pelo master correto");
		});
	});

	describe("pcOwnerMiddleware — rotas /v1/pcs/:pcId/*", () => {
		it("rejeita usuário que não é dono do PC com 403 e loga a negação", async () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const res = await app.request(
				`/v1/pcs/${pcInCampaignBId}/bonds`,
				{
					method: "POST",
					headers: authHeaders(tokenMasterA),
					body: JSON.stringify({ target_type: "freeform", target_name: "Vínculo indevido", admiration_axis: "admiration" }),
				},
				env,
			);

			expect(res.status).toBe(403);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.objectContaining({ event: "authorization_denied", userId: masterAId, pcId: pcInCampaignBId, reason: "not_pc_owner" }),
			);

			warnSpy.mockRestore();
		});

		it("permite que o dono do PC crie um vínculo (201)", async () => {
			const res = await app.request(
				`/v1/pcs/${pcInCampaignBId}/bonds`,
				{
					method: "POST",
					headers: authHeaders(tokenMasterB),
					body: JSON.stringify({ target_type: "freeform", target_name: "Vínculo do dono", admiration_axis: "admiration" }),
				},
				env,
			);

			expect(res.status).toBe(201);
		});
	});
});
