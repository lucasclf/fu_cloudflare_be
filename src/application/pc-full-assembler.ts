import { Arcana } from "../domain/jobs/job";
import { InternalAppError } from "../domain/app-error";
import type { PcBase, PcEquipment, PcFull, PcInventory, PcJobInfo, PcPowerInfo } from "../domain/pc/pc";
import { PcStatsCalculator } from "../domain/pc/pc-stats-calculator";
import { Spell, MonsterSpell } from "../domain/spells/spells";
import { PcBondResolver } from "./pc-bond-resolver";
import { PcJobRelationReaderPort, PcPowerRelationReaderPort, PcSpellRelationReaderPort, PcArcanaRelationReaderPort, PcEquipmentRelationReaderPort, PcInventoryRelationReaderPort, PcBondRelationReaderPort, PcMonsterSpellRelationReaderPort, JobLookupPort, JobPowerLookupPort, JobSpellLookupPort, ArcanaLookupPort, ItemLookupPort, MonsterSpellLookupPort } from "./ports/pc-ports";

export class PcFullAssembler {
	constructor(
		private readonly pcJobRepository: PcJobRelationReaderPort,
		private readonly pcPowerRepository: PcPowerRelationReaderPort,
		private readonly pcSpellRepository: PcSpellRelationReaderPort,
		private readonly pcArcanaRepository: PcArcanaRelationReaderPort,
		private readonly pcEquipmentRepository: PcEquipmentRelationReaderPort,
		private readonly pcInventoryRepository: PcInventoryRelationReaderPort,
		private readonly pcBondRepository: PcBondRelationReaderPort,
		private readonly pcMonsterSpellRepository: PcMonsterSpellRelationReaderPort,

		private readonly jobRepository: JobLookupPort,
		private readonly jobPowerRepository: JobPowerLookupPort,
		private readonly jobSpellRepository: JobSpellLookupPort,
		private readonly arcanaRepository: ArcanaLookupPort,
		private readonly itemRepository: ItemLookupPort,
		private readonly monsterSpellRepository: MonsterSpellLookupPort,

		private readonly pcStatsCalculator: PcStatsCalculator,
		private readonly pcBondResolver: PcBondResolver,
	) {}

	async assemble(pcBase: PcBase): Promise<PcFull> {
		const pcId = pcBase.id;

		const [
			pcJobRelations,
			pcPowerRelations,
			pcSpellRelations,
			pcArcanaRelations,
			pcEquipmentRelation,
			pcInventoryRelations,
			pcBonds,
			pcMonsterSpellRelations,
		] = await Promise.all([
			this.pcJobRepository.findByPcId(pcId),
			this.pcPowerRepository.findByPcId(pcId),
			this.pcSpellRepository.findByPcId(pcId),
			this.pcArcanaRepository.findByPcId(pcId),
			this.pcEquipmentRepository.findByPcId(pcId),
			this.pcInventoryRepository.findByPcId(pcId),
			this.pcBondRepository.findByPcId(pcId),
			this.pcMonsterSpellRepository.findByPcId(pcId),
		]);

		const jobIds = pcJobRelations.map((relation) => relation.job_id);
		const powerIds = pcPowerRelations.map((relation) => relation.power_id);
		const spellIds = pcSpellRelations.map((relation) => relation.spell_id);
		const arcanaIds = pcArcanaRelations.map((relation) => relation.arcana_id);

		const monsterActionIds = pcMonsterSpellRelations.map(
			(relation) => relation.monster_action_id,
		);

		const equipmentItemIds = pcEquipmentRelation
			? [
					pcEquipmentRelation.main_hand,
					pcEquipmentRelation.off_hand,
					pcEquipmentRelation.armor,
					pcEquipmentRelation.accessory,
				].filter((id): id is number => id !== null)
			: [];

		const inventoryItemIds = pcInventoryRelations.map(
			(relation) => relation.item_id,
		);

		const itemIds = [...new Set([
			...equipmentItemIds,
			...inventoryItemIds,
		])];

		const [
			jobsById,
			powersById,
			spellsById,
			arcanasById,
			monsterSpellsById,
			itemsById,
		] = await Promise.all([
			this.jobRepository.findSummaryByIds(jobIds),
			this.jobPowerRepository.findByIds(powerIds),
			this.jobSpellRepository.findByIds(spellIds),
			this.arcanaRepository.findByIds(arcanaIds),
			this.monsterSpellRepository.findByIds(monsterActionIds),
			this.itemRepository.findByIds(itemIds),
		]);

		const jobs: PcJobInfo[] = pcJobRelations.map((relation) => {
			const job = jobsById.get(relation.job_id);

			if (!job) {
				console.error(`Data integrity: job not found for pc_id=${pcId} job_id=${relation.job_id}`);
				throw new InternalAppError();
			}

			return {
				...job,
				level: relation.level,
				ignore_hp_bonus: relation.ignore_hp_bonus,
				ignore_mp_bonus: relation.ignore_mp_bonus,
				hp_bonus: relation.ignore_hp_bonus ? 0 : job.hp_bonus,
				mp_bonus: relation.ignore_mp_bonus ? 0 : job.mp_bonus,
			};
		});

		const powers: PcPowerInfo[] = pcPowerRelations.map((relation) => {
			const power = powersById.get(relation.power_id);

			if (!power) {
				console.error(`Data integrity: power not found for pc_id=${pcId} power_id=${relation.power_id}`);
				throw new InternalAppError();
			}

			return {
				...power,
				level: relation.level,
			};
		});

		const spells: Spell[] = pcSpellRelations.map((relation) => {
			const spell = spellsById.get(relation.spell_id);

			if (!spell) {
				console.error(`Data integrity: spell not found for pc_id=${pcId} spell_id=${relation.spell_id}`);
				throw new InternalAppError();
			}

			return spell;
		});

		const monsterSpells: MonsterSpell[] = pcMonsterSpellRelations.map((relation) => {
			const monsterSpell = monsterSpellsById.get(relation.monster_action_id);

			if (!monsterSpell) {
				console.error(`Data integrity: monster spell not found for pc_id=${pcId} monster_action_id=${relation.monster_action_id}`);
				throw new InternalAppError();
			}

			return monsterSpell;
		});

		const arcanas: Arcana[] = pcArcanaRelations.map((relation) => {
			const arcana = arcanasById.get(relation.arcana_id);

			if (!arcana) {
				console.error(`Data integrity: arcana not found for pc_id=${pcId} arcana_id=${relation.arcana_id}`);
				throw new InternalAppError();
			}

			return arcana;
		});

		const equipment: PcEquipment | undefined = pcEquipmentRelation
			? {
					pc_id: pcEquipmentRelation.pc_id,
					main_hand: pcEquipmentRelation.main_hand
						? itemsById.get(pcEquipmentRelation.main_hand) ?? null
						: null,
					off_hand: pcEquipmentRelation.off_hand
						? itemsById.get(pcEquipmentRelation.off_hand) ?? null
						: null,
					armor: pcEquipmentRelation.armor
						? itemsById.get(pcEquipmentRelation.armor) ?? null
						: null,
					accessory: pcEquipmentRelation.accessory
						? itemsById.get(pcEquipmentRelation.accessory) ?? null
						: null,
				}
			: undefined;

		const inventories: PcInventory[] = pcInventoryRelations.map((relation) => {
			const item = itemsById.get(relation.item_id);

			if (!item) {
				console.error(`Data integrity: item not found for pc_id=${pcId} item_id=${relation.item_id}`);
				throw new InternalAppError();
			}

			return {
				pc_id: relation.pc_id,
				item,
				quantity: relation.quantity,
			};
		});

		const pcCapacities = this.pcStatsCalculator.calculateCapacities(jobs);

		const stats = this.pcStatsCalculator.calculateStats(
			pcBase,
			jobs,
			equipment,
			pcCapacities,
		);

		const bonds = await this.pcBondResolver.resolve(pcBonds);

		return {
			...pcBase,
			stats,
			pc_capacities: pcCapacities,
			jobs,
			powers,
			spells,
			monsterSpells,
			arcanas,
			equipment,
			inventories,
			bonds,
		};
	}
}
