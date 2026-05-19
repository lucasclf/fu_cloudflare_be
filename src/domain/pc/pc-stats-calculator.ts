import type { AttributeDie } from "../domain-types";
import type { Item } from "../items/item";
import type {
	PcBase,
	PcCalculatedStats,
	PcCapacities,
	PcEquipment,
	PcJobInfo,
} from "./pc";

export class PcStatsCalculator {
	calculateCapacities(jobs: PcJobInfo[]): PcCapacities {
		return jobs.reduce<PcCapacities>(
			(total, job) => ({
				hp_bonus: total.hp_bonus + job.hp_bonus,
				mp_bonus: total.mp_bonus + job.mp_bonus,
				ip_bonus: total.ip_bonus + job.ip_bonus,

				allows_martial_armor:
					total.allows_martial_armor || job.allows_martial_armor,
				allows_martial_shield:
					total.allows_martial_shield || job.allows_martial_shield,
				allows_martial_ranged_weapon:
					total.allows_martial_ranged_weapon ||
					job.allows_martial_ranged_weapon,
				allows_martial_melee_weapon:
					total.allows_martial_melee_weapon ||
					job.allows_martial_melee_weapon,

				allows_arcane: total.allows_arcane || job.allows_arcane,
				allows_rituals: total.allows_rituals || job.allows_rituals,
				allows_monster_spells:
					total.allows_monster_spells || job.allows_monster_spells,
				can_start_projects:
					total.can_start_projects || job.can_start_projects,
			}),
			{
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
			},
		);
	}

	calculateStats(
		pcBase: PcBase,
		jobs: PcJobInfo[],
		equipment: PcEquipment | undefined,
		capacities: PcCapacities,
	): PcCalculatedStats {
		const level = jobs.reduce((total, job) => total + job.level, 0);

		const mightValue = this.attributeDieValue(pcBase.might_die);
		const willpowerValue = this.attributeDieValue(pcBase.willpower_die);

		const equippedItems = this.getEquippedItems(equipment);

		const armor = equipment?.armor ?? null;

		const shield =
			equipment?.off_hand?.item_type === "escudo"
				? equipment.off_hand
				: null;

		const initiative =
			this.parseModifier(armor?.initiative) +
			this.parseModifier(shield?.initiative);

		const armorDefenseBase = armor
			? this.resolveDefenseDiceValue(armor.defense_dice, pcBase)
			: this.attributeDieValue(pcBase.dexterity_die);

		const armorMagicDefenseBase = armor
			? this.resolveDefenseDiceValue(armor.magic_defense_dice, pcBase)
			: this.attributeDieValue(pcBase.insight_die);

		const defenseBonus = equippedItems.reduce(
			(total, item) => total + (item.defense_bonus ?? 0),
			0,
		);

		const magicDefenseBonus = equippedItems.reduce(
			(total, item) => total + (item.magic_defense_bonus ?? 0),
			0,
		);

		return {
			level,
			hp: level + 5 * mightValue + capacities.hp_bonus,
			mp: level + 5 * willpowerValue + capacities.mp_bonus,
			initiative,
			ip: 6 + capacities.ip_bonus,
			defense: armorDefenseBase + defenseBonus,
			magic_defense: armorMagicDefenseBase + magicDefenseBonus,
		};
	}

	private getEquippedItems(equipment: PcEquipment | undefined): Item[] {
		if (!equipment) {
			return [];
		}

		return [
			equipment.main_hand,
			equipment.off_hand,
			equipment.armor,
			equipment.accessory,
		].filter((item): item is Item => item !== null);
	}

	private attributeDieValue(die: AttributeDie | null): number {
		switch (die) {
			case "d6":
				return 6;
			case "d8":
				return 8;
			case "d10":
				return 10;
			case "d12":
				return 12;
			case null:
				return 0;
		}
	}

	private resolveDefenseDiceValue(
		defenseDice: string | null,
		pcBase: PcBase,
	): number {
		if (defenseDice === null) {
			return 0;
		}

		const normalized = defenseDice.trim().toUpperCase();

		switch (normalized) {
			case "DES":
				return this.attributeDieValue(pcBase.dexterity_die);
			case "AST":
				return this.attributeDieValue(pcBase.insight_die);
			case "VIG":
				return this.attributeDieValue(pcBase.might_die);
			case "VON":
				return this.attributeDieValue(pcBase.willpower_die);

			case "D6":
				return 6;
			case "D8":
				return 8;
			case "D10":
				return 10;
			case "D12":
				return 12;

			default: {
				const numericValue = Number(normalized);

				if (Number.isFinite(numericValue)) {
					return numericValue;
				}

				throw new Error(`Invalid defense dice value: ${defenseDice}`);
			}
		}
	}

	private parseModifier(value: string | number | null | undefined): number {
		if (value === null || value === undefined) {
			return 0;
		}

		if (typeof value === "number") {
			return value;
		}

		const normalized = value.trim();

		if (normalized.length === 0) {
			return 0;
		}

		const parsed = Number(normalized.replace("+", ""));

		if (!Number.isFinite(parsed)) {
			throw new Error(`Invalid modifier value: ${value}`);
		}

		return parsed;
	}
}