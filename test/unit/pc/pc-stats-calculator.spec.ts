import { describe, expect, it } from "vitest";
import { PcStatsCalculator } from "../../../src/domain/pc/pc-stats-calculator";
import type {
	PcBase,
	PcEquipment,
	PcJobInfo,
} from "../../../src/domain/pc/pc";
import type { Item } from "../../../src/domain/items/item";

function makePcBase(overrides: Partial<PcBase> = {}): PcBase {
	const base: PcBase = {
		id: 1,
		name: "Herói Teste",
		description: "Descrição",
		tagline: null,
		img_key: null,

		dexterity_die: "d8",
		insight_die: "d10",
		might_die: "d8",
		willpower_die: "d6",

		hp: null,
		mp: null,
		initiative: null,
		defense: null,
		magic_defense: null,

		pronouns: null,
		origin: "Origem",
		identity: "Identidade",
		theme: "Tema",
		money: 0,

		created_at: "2026-01-01 00:00:00",
		updated_at: null,
	};

	return {
		...base,
		...overrides,

		// Garante que campos obrigatórios nullable nunca virem undefined.
		hp: overrides.hp ?? base.hp,
		mp: overrides.mp ?? base.mp,
		initiative: overrides.initiative ?? base.initiative,
		defense: overrides.defense ?? base.defense,
		magic_defense: overrides.magic_defense ?? base.magic_defense,
		created_at: overrides.created_at ?? base.created_at,
		updated_at: overrides.updated_at ?? base.updated_at,
	};
}

function makeJob(overrides: Partial<PcJobInfo> = {}): PcJobInfo {
	return {
		id: 1,
		name: "Classe Teste",
		tagline: "Classe",
		img_key: null,

		level: 1,

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

		...overrides,
	};
}

function makeItem(overrides: Partial<Item> = {}): Item {
	return {
		id: 1,
		name: "Item Teste",
		item_type: "acessorio",
		description: null,
		img_key: null,
		cost: null,

		weapon_category: null,
		accuracy: null,
		damage: null,
		damage_type: null,
		grip: null,
		distance: null,

		defense_dice: null,
		defense_bonus: null,
		magic_defense_dice: null,
		magic_defense_bonus: null,

		initiative: null,
		is_martial: null,

		created_at: "2026-01-01 00:00:00",
		updated_at: null,

		...overrides,
	};
}

describe("PcStatsCalculator", () => {
	it("calcula capacidades somando bônus e combinando permissões das jobs", () => {
		const calculator = new PcStatsCalculator();

		const jobs: PcJobInfo[] = [
			makeJob({
				level: 2,
				hp_bonus: 5,
				allows_arcane: true,
			}),
			makeJob({
				id: 2,
				level: 3,
				mp_bonus: 5,
				ip_bonus: 2,
				allows_martial_shield: true,
			}),
		];

		const capacities = calculator.calculateCapacities(jobs);

		expect(capacities.hp_bonus).toBe(5);
		expect(capacities.mp_bonus).toBe(5);
		expect(capacities.ip_bonus).toBe(2);
		expect(capacities.allows_arcane).toBe(true);
		expect(capacities.allows_martial_shield).toBe(true);
		expect(capacities.allows_rituals).toBe(false);
	});

	it("calcula status básicos sem equipamento", () => {
		const calculator = new PcStatsCalculator();

		const pcBase = makePcBase({
			might_die: "d8",
			willpower_die: "d6",
			dexterity_die: "d8",
			insight_die: "d10",
		});

		const jobs: PcJobInfo[] = [
			makeJob({
				level: 2,
				hp_bonus: 5,
				mp_bonus: 0,
				ip_bonus: 1,
			}),
			makeJob({
				id: 2,
				level: 3,
				hp_bonus: 0,
				mp_bonus: 5,
				ip_bonus: 1,
			}),
		];

		const capacities = calculator.calculateCapacities(jobs);

		const stats = calculator.calculateStats(
			pcBase,
			jobs,
			undefined,
			capacities,
		);

		expect(stats.level).toBe(5);
		expect(stats.hp).toBe(5 + 5 * 8 + 5);
		expect(stats.mp).toBe(5 + 5 * 6 + 5);
		expect(stats.ip).toBe(6 + 2);
		expect(stats.initiative).toBe(0);
		expect(stats.defense).toBe(8);
		expect(stats.magic_defense).toBe(10);
	});

	it("calcula iniciativa, defesa e defesa mágica com armadura, escudo e acessório", () => {
		const calculator = new PcStatsCalculator();

		const pcBase = makePcBase({
			dexterity_die: "d8",
			insight_die: "d10",
			might_die: "d8",
			willpower_die: "d6",
		});

		const armor = makeItem({
			id: 10,
			item_type: "armadura",
			defense_dice: "DES",
			defense_bonus: 1,
			magic_defense_dice: "AST",
			magic_defense_bonus: 1,
			initiative: "-1",
		});

		const shield = makeItem({
			id: 11,
			item_type: "escudo",
			defense_bonus: 1,
			magic_defense_bonus: 1,
			initiative: "-1",
		});

		const accessory = makeItem({
			id: 12,
			item_type: "acessorio",
			defense_bonus: 1,
			magic_defense_bonus: 0,
		});

		const equipment: PcEquipment = {
			pc_id: 1,
			main_hand: null,
			off_hand: shield,
			armor,
			accessory,
		};

		const jobs = [makeJob({ level: 5 })];
		const capacities = calculator.calculateCapacities(jobs);

		const stats = calculator.calculateStats(
			pcBase,
			jobs,
			equipment,
			capacities,
		);

		expect(stats.initiative).toBe(-2);
		expect(stats.defense).toBe(8 + 1 + 1 + 1);
		expect(stats.magic_defense).toBe(10 + 1 + 1 + 0);
	});
});