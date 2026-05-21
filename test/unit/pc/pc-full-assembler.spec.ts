import { describe, it, expect } from "vitest";
import { PcBondResolver } from "../../../src/application/pc-bond-resolver";
import { PcFullAssembler } from "../../../src/application/pc-full-assembler.ts";
import { Item } from "../../../src/domain/items/item";
import { ResumeJob, JobPower, Arcana } from "../../../src/domain/jobs/job";
import { PcBase, BondTargetSummary, PcJobRelation, PcPowerRelation, CreatePcSpellRelationInput, CreatePcArcanaRelationInput, CreatePcMonsterSpellRelationInput, CreatePcEquipmentInput, CreatePcInventoryInput, PcBond } from "../../../src/domain/pc/pc";
import { PcStatsCalculator } from "../../../src/domain/pc/pc-stats-calculator";
import { JobSpell, MonsterSpell } from "../../../src/domain/spells/spells";

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
		hp: overrides.hp ?? base.hp,
		mp: overrides.mp ?? base.mp,
		initiative: overrides.initiative ?? base.initiative,
		defense: overrides.defense ?? base.defense,
		magic_defense: overrides.magic_defense ?? base.magic_defense,
		created_at: overrides.created_at ?? base.created_at,
		updated_at: overrides.updated_at ?? base.updated_at,
	};
}

function makeResumeJob(overrides: Partial<ResumeJob> = {}): ResumeJob {
	return {
		id: 1,
		name: "Guardião",
		tagline: "Protetor",
		img_key: "guardiao",

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

		...overrides,
	};
}

function makeJobPower(overrides: Partial<JobPower> = {}): JobPower {
	return {
		id: 10,
		name: "Defesa Firme",
		description: "Aumenta sua defesa.",
		type: "common",
		max_level: 5,
		is_global: false,

		...overrides,
	};
}

function makeJobSpell(overrides: Partial<JobSpell> = {}): JobSpell {
	return {
		id: 20,
		job_id: 1,
		name: "Luz",
		description: "Cria luz.",
		is_offensive: false,
		cost: "1 PM",
		target: "Cena",
		duration: "Cena",
		nature: "job",

		...overrides,
	};
}

function makeMonsterSpell(
	overrides: Partial<MonsterSpell> = {},
): MonsterSpell {
	return {
		id: 30,
		name: "Sopro Sombrio",
		description: "Ataque sombrio.",
		is_offensive: true,
		cost: "2 PM",
		target: "Um inimigo",
		duration: "Instantânea",
		nature: "monster",

		...overrides,
	};
}

function makeArcana(overrides: Partial<Arcana> = {}): Arcana {
	return {
		id: 40,
		name: "A Torre",
		domain: "Ruína",
		merge_effect: null,
		dismiss_effect: null,
		special_rule: null,

		...overrides,
	};
}

function makeItem(overrides: Partial<Item> = {}): Item {
	return {
		id: 50,
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

function makeBondTarget(
	overrides: Partial<BondTargetSummary> = {},
): BondTargetSummary {
	return {
		id: 2,
		name: "Cid",
		img_key: "cid",

		...overrides,
	};
}

function makeAssembler() {
	const pcJobRelations: PcJobRelation[] = [
		{
			pc_id: 1,
			job_id: 1,
			level: 5,
		},
	];

	const pcPowerRelations: PcPowerRelation[] = [
		{
			pc_id: 1,
			power_id: 10,
			level: 2,
		},
	];

	const pcSpellRelations: CreatePcSpellRelationInput[] = [
		{
			pc_id: 1,
			spell_id: 20,
		},
	];

	const pcArcanaRelations: CreatePcArcanaRelationInput[] = [
		{
			pc_id: 1,
			arcana_id: 40,
			description: "Arcana vinculado.",
		},
	];

	const pcMonsterSpellRelations: CreatePcMonsterSpellRelationInput[] = [
		{
			pc_id: 1,
			monster_action_id: 30,
		},
	];

	const armor = makeItem({
		id: 50,
		name: "Armadura",
		item_type: "armadura",
		defense_dice: "DES",
		defense_bonus: 1,
		magic_defense_dice: "AST",
		magic_defense_bonus: 1,
		initiative: "-1",
	});

	const shield = makeItem({
		id: 51,
		name: "Escudo",
		item_type: "escudo",
		defense_bonus: 1,
		magic_defense_bonus: 1,
		initiative: "-1",
	});

	const potion = makeItem({
		id: 52,
		name: "Poção",
		item_type: "outros",
	});

	const pcEquipment: CreatePcEquipmentInput = {
		pc_id: 1,
		main_hand: null,
		off_hand: 51,
		armor: 50,
		accessory: null,
	};

	const pcInventories: CreatePcInventoryInput[] = [
		{
			pc_id: 1,
			item_id: 52,
			quantity: 3,
		},
	];

	const pcBonds: PcBond[] = [
		{
			id: 1,
			pc_id: 1,
			target_type: "npc",
			target_id: 2,
			target_name: null,
			img_key: null,
			admiration_axis: "admiration",
			loyalty_axis: null,
			affection_axis: null,
			description: null,
		},
	];

	const job = makeResumeJob({ id: 1 });
	const power = makeJobPower({ id: 10 });
	const spell = makeJobSpell({ id: 20 });
	const monsterSpell = makeMonsterSpell({ id: 30 });
	const arcana = makeArcana({ id: 40 });

	const itemsById = new Map<number, Item>([
		[50, armor],
		[51, shield],
		[52, potion],
	]);

	const pcRepository = {
		async findBondTargetsByIds() {
			return new Map<number, BondTargetSummary>();
		},
	};

	const npcRepository = {
		async findBondTargetsByIds() {
			return new Map<number, BondTargetSummary>([
				[2, makeBondTarget({ id: 2, name: "Cid", img_key: "cid" })],
			]);
		},
	};

	const monsterRepository = {
		async findBondTargetsByIds() {
			return new Map<number, BondTargetSummary>();
		},
	};

	const pcBondResolver = new PcBondResolver(
		pcRepository,
		npcRepository,
		monsterRepository,
	);

	const assembler = new PcFullAssembler(
		{
			async findByPcId() {
				return pcJobRelations;
			},
		},
		{
			async findByPcId() {
				return pcPowerRelations;
			},
		},
		{
			async findByPcId() {
				return pcSpellRelations;
			},
		},
		{
			async findByPcId() {
				return pcArcanaRelations;
			},
		},
		{
			async findByPcId() {
				return pcEquipment;
			},
		},
		{
			async findByPcId() {
				return pcInventories;
			},
		},
		{
			async findByPcId() {
				return pcBonds;
			},
		},
		{
			async findByPcId() {
				return pcMonsterSpellRelations;
			},
		},

		{
			async findSummaryByIds() {
				return new Map([[1, job]]);
			},
		},
		{
			async findByIds() {
				return new Map([[10, power]]);
			},
		},
		{
			async findByIds() {
				return new Map([[20, spell]]);
			},
		},
		{
			async findByIds() {
				return new Map([[40, arcana]]);
			},
		},
		{
			async findByIds() {
				return itemsById;
			},
		},
		{
			async findByIds() {
				return new Map([[30, monsterSpell]]);
			},
		},

		new PcStatsCalculator(),
		pcBondResolver,
	);

	return {
		assembler,
		fixtures: {
			armor,
			shield,
			potion,
			job,
			power,
			spell,
			monsterSpell,
			arcana,
		},
	};
}

describe("PcFullAssembler", () => {
	it("monta PcFull completo com relações enriquecidas, capacidades e stats", async () => {
		const { assembler } = makeAssembler();

		const pc = await assembler.assemble(makePcBase());

		expect(pc.id).toBe(1);
		expect(pc.name).toBe("Herói Teste");

		expect(pc.jobs).toHaveLength(1);
		expect(pc.jobs?.[0]).toMatchObject({
			id: 1,
			name: "Guardião",
			level: 5,
		});

		expect(pc.powers).toHaveLength(1);
		expect(pc.powers?.[0]).toMatchObject({
			id: 10,
			name: "Defesa Firme",
			level: 2,
		});

		expect(pc.spells).toHaveLength(1);
		expect(pc.spells?.[0]).toMatchObject({
			id: 20,
			name: "Luz",
			nature: "job",
		});

		expect(pc.monsterSpells).toHaveLength(1);
		expect(pc.monsterSpells?.[0]).toMatchObject({
			id: 30,
			name: "Sopro Sombrio",
			nature: "monster",
		});

		expect(pc.arcanas).toHaveLength(1);
		expect(pc.arcanas?.[0]).toMatchObject({
			id: 40,
			name: "A Torre",
		});

		expect(pc.equipment).toMatchObject({
			pc_id: 1,
			main_hand: null,
			off_hand: {
				id: 51,
				name: "Escudo",
			},
			armor: {
				id: 50,
				name: "Armadura",
			},
			accessory: null,
		});

		expect(pc.inventories).toHaveLength(1);
		expect(pc.inventories?.[0]).toMatchObject({
			pc_id: 1,
			quantity: 3,
			item: {
				id: 52,
				name: "Poção",
			},
		});

		expect(pc.bonds).toHaveLength(1);
		expect(pc.bonds?.[0]).toMatchObject({
			target_type: "npc",
			target_id: 2,
			target_name: "Cid",
			img_key: "cid",
		});

		expect(pc.pc_capacities).toMatchObject({
			hp_bonus: 5,
			mp_bonus: 0,
			ip_bonus: 1,
			allows_martial_armor: true,
			allows_martial_shield: true,
			allows_martial_melee_weapon: true,
		});

		expect(pc.stats).toMatchObject({
			level: 5,
			hp: 5 + 5 * 8 + 5,
			mp: 5 + 5 * 6 + 0,
			ip: 7,
			initiative: -2,
			defense: 8 + 1 + 1,
			magic_defense: 10 + 1 + 1,
		});
	});
});