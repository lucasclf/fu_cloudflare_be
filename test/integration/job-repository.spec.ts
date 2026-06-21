import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { D1JobRepository } from "../../src/infrastructure/repository/d1-job-repository";

describe("D1JobRepository (integration)", () => {
	let repo: D1JobRepository;

	beforeAll(() => {
		repo = new D1JobRepository(env.fabula_ultima_db);
	});

	it("findAll retorna lista vazia antes de qualquer inserção", async () => {
		const jobs = await repo.findAll();
		expect(jobs).toEqual([]);
	});

	it("create e findAll retornam o job criado com campos corretos", async () => {
		await repo.create({
			name: "Guardião",
			tagline: "Protetor das fronteiras",
			description: "Especialista em defesa e proteção.",
			img_key: null,
			hp_bonus: 5,
			mp_bonus: 0,
			ip_bonus: 1,
			allows_martial_armor: true,
			allows_martial_shield: true,
			allows_martial_ranged_weapon: false,
			allows_martial_melee_weapon: true,
			allows_arcane: false,
			allows_rituals: false,
			allows_monster_spells: false,
			can_start_projects: false,
			can_cooking: false,
		});

		const jobs = await repo.findAll();

		expect(jobs).toHaveLength(1);
		expect(jobs[0]).toMatchObject({
			name: "Guardião",
			hp_bonus: 5,
			allows_martial_armor: true,
			allows_arcane: false,
			can_cooking: false,
		});
	});

	it("findSummaryByIds retorna can_cooking corretamente", async () => {
		const all = await repo.findAll();
		const ids = all.map((j) => j.id);

		const byId = await repo.findSummaryByIds(ids);

		for (const job of all) {
			const summary = byId.get(job.id);
			expect(summary).toBeDefined();
			expect(summary?.can_cooking).toBe(job.can_cooking);
		}
	});

	it("create lança ConflictAppError ao inserir job duplicado", async () => {
		await expect(
			repo.create({
				name: "Guardião",
				tagline: "Duplicado",
				description: "Não deve ser criado.",
				img_key: null,
				hp_bonus: 0,
				mp_bonus: 0,
				ip_bonus: 0,
				allows_martial_armor: false,
				allows_martial_shield: false,
				allows_martial_ranged_weapon: false,
				allows_martial_melee_weapon: false,
				allows_arcane: false,
				allows_rituals: false,
				allows_monster_spells: false,
				can_start_projects: false,
				can_cooking: false,
			}),
		).rejects.toThrow();
	});
});
