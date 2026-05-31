import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { D1PCRepository } from "../../src/infrastructure/repository/d1-pc-repository";
import { D1PCBondRepository } from "../../src/infrastructure/repository/d1-pc-bond-repository";
import { applyMigrations } from "./setup";

describe("D1PCBondRepository (integration)", () => {
	let pcRepo: D1PCRepository;
	let bondRepo: D1PCBondRepository;
	let pcId: number;

	beforeAll(async () => {
		await applyMigrations(env.fabula_ultima_db);
		pcRepo = new D1PCRepository(env.fabula_ultima_db);
		bondRepo = new D1PCBondRepository(env.fabula_ultima_db);

		await pcRepo.create({
			name: "Herói Teste",
			description: "PC para testes de bond",
			tagline: null,
			pronouns: null,
			origin: "Uma cidade distante",
			identity: "O herói",
			theme: "Redenção",
			dexterity_die: "d8",
			insight_die: "d10",
			might_die: "d8",
			willpower_die: "d6",
			money: 100,
			img_key: null,
		});

		const pc = await env.fabula_ultima_db
			.prepare("SELECT id FROM pcs WHERE name = ? LIMIT 1")
			.bind("Herói Teste")
			.first<{ id: number }>();

		pcId = pc!.id;
	});

	it("findByPcId retorna lista vazia quando não há bonds", async () => {
		const bonds = await bondRepo.findByPcId(pcId);
		expect(bonds).toEqual([]);
	});

	it("create e findByPcId retornam bond com id e img_key preenchidos", async () => {
		await bondRepo.create({
			pc_id: pcId,
			target_type: "freeform",
			target_id: null,
			target_name: "Aldeões do vilarejo",
			admiration_axis: "admiration",
			loyalty_axis: null,
			affection_axis: null,
			description: null,
		});

		const bonds = await bondRepo.findByPcId(pcId);

		expect(bonds).toHaveLength(1);

		const bond = bonds[0];
		expect(bond.id).toBeDefined();
		expect(typeof bond.id).toBe("number");
		expect(bond.target_type).toBe("freeform");
		expect(bond.target_name).toBe("Aldeões do vilarejo");
		expect(bond.admiration_axis).toBe("admiration");
	});
});
