import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../../src/index";
import { signJwt } from "../../src/utils/jwt";

// Cobre a Fase 4 do plano de correções: convites pendentes não tinham TTL e
// ficavam "zumbis" para sempre, bloqueando o reenvio de um convite corrigido
// (ver migrations/0034_add_invitation_expiry.sql).

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

describe("TTL de convites de campanha (integration)", () => {
	const db = env.fabula_ultima_db;

	let masterId: number;
	let inviteeId: number;
	let campaignId: number;
	let masterToken: string;
	let inviteeToken: string;
	let invitationId: number;

	beforeAll(async () => {
		masterId = await createUser(db, "master@ttl-test.com", "ttl_master");
		inviteeId = await createUser(db, "invitee@ttl-test.com", "ttl_invitee");
		campaignId = await createCampaign(db, "Campanha (ttl-test)");
		await addMember(db, campaignId, masterId, "master");

		masterToken = await signJwt({ sub: masterId, email: "master@ttl-test.com", is_super_user: false }, env.JWT_SECRET);
		inviteeToken = await signJwt({ sub: inviteeId, email: "invitee@ttl-test.com", is_super_user: false }, env.JWT_SECRET);

		const sendRes = await app.request(
			`/v1/campaigns/${campaignId}/invitations`,
			{ method: "POST", headers: authHeaders(masterToken), body: JSON.stringify({ invitee_nickname: "ttl_invitee" }) },
			env,
		);
		expect(sendRes.status).toBe(201);

		const row = await db
			.prepare("SELECT id FROM campaign_invitations WHERE campaign_id = ? AND invitee_id = ?")
			.bind(campaignId, inviteeId)
			.first<{ id: number }>();
		invitationId = row!.id;

		// Simula o convite já expirado (criado há mais de 7 dias).
		await db
			.prepare("UPDATE campaign_invitations SET expires_at = datetime('now', '-1 hour') WHERE id = ?")
			.bind(invitationId)
			.run();
	});

	it("não aparece na lista de convites pendentes do convidado depois de expirado", async () => {
		const res = await app.request("/v1/invitations", { method: "GET", headers: authHeaders(inviteeToken) }, env);
		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.data).toEqual([]);
	});

	it("rejeita aceitar um convite expirado (400)", async () => {
		const res = await app.request(
			`/v1/invitations/${invitationId}/accept`,
			{ method: "POST", headers: authHeaders(inviteeToken) },
			env,
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body).toMatchObject({ success: false, error: { code: "BAD_REQUEST" } });

		const member = await db.prepare("SELECT 1 FROM campaign_members WHERE campaign_id = ? AND user_id = ?").bind(campaignId, inviteeId).first();
		expect(member).toBeNull();
	});

	it("rejeita recusar um convite expirado (400)", async () => {
		const res = await app.request(
			`/v1/invitations/${invitationId}/decline`,
			{ method: "POST", headers: authHeaders(inviteeToken) },
			env,
		);

		expect(res.status).toBe(400);
	});

	it("permite o master reenviar o convite mesmo com o antigo (expirado) ainda pendente", async () => {
		const res = await app.request(
			`/v1/campaigns/${campaignId}/invitations`,
			{ method: "POST", headers: authHeaders(masterToken), body: JSON.stringify({ invitee_nickname: "ttl_invitee" }) },
			env,
		);

		expect(res.status).toBe(201);

		const { results } = await db
			.prepare("SELECT id, expires_at FROM campaign_invitations WHERE campaign_id = ? AND invitee_id = ? ORDER BY id")
			.bind(campaignId, inviteeId)
			.all<{ id: number; expires_at: string }>();
		expect(results).toHaveLength(2);
	});
});
