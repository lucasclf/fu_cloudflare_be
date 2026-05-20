import { ValidationError } from "../domain/domain-errors";
import type {
	CreatePcArcanaRelationInput,
	CreatePcEquipmentInput,
	CreatePCInput,
	CreatePcInventoryInput,
	CreatePcMonsterSpellRelationInput,
	CreatePcSpellRelationInput,
    PcBondInput,
    PcJobRelation,
    PcPowerRelation,
} from "../domain/pc/pc";
import { PcWriterPort, PcJobWriterPort, PcPowerWriterPort, PcSpellWriterPort, PcArcanaWriterPort, PcEquipmentWriterPort, PcInventoryWriterPort, PcBondWriterPort, PcMonsterSpellWriterPort, MonsterActionValidationPort } from "./ports/pc-ports";

export class PcCommandService {
	constructor(
		private readonly pcRepository: PcWriterPort,
		private readonly pcJobRepository: PcJobWriterPort,
		private readonly pcPowerRepository: PcPowerWriterPort,
		private readonly pcSpellRepository: PcSpellWriterPort,
		private readonly pcArcanaRepository: PcArcanaWriterPort,
		private readonly pcEquipmentRepository: PcEquipmentWriterPort,
		private readonly pcInventoryRepository: PcInventoryWriterPort,
		private readonly pcBondRepository: PcBondWriterPort,
		private readonly pcMonsterSpellRepository: PcMonsterSpellWriterPort,
		private readonly monsterActionRepository: MonsterActionValidationPort,
	) {}

	async createPc(input: CreatePCInput): Promise<void> {
		await this.pcRepository.create(input);
	}

	async createPcJobRelation(input: PcJobRelation): Promise<void> {
		await this.pcJobRepository.create(input);
	}

	async createPcPowerRelation(input: PcPowerRelation): Promise<void> {
		await this.pcPowerRepository.create(input);
	}

	async createPcSpellRelation(input: CreatePcSpellRelationInput): Promise<void> {
		await this.pcSpellRepository.create(input);
	}

	async createPcArcanaRelation(
		input: CreatePcArcanaRelationInput,
	): Promise<void> {
		await this.pcArcanaRepository.create(input);
	}

	async createPcEquipment(input: CreatePcEquipmentInput): Promise<void> {
		await this.pcEquipmentRepository.create(input);
	}

	async createPcInventory(input: CreatePcInventoryInput): Promise<void> {
		await this.pcInventoryRepository.create(input);
	}

	async createPcBond(input: PcBondInput): Promise<void> {
		await this.pcBondRepository.create(input);
	}

	async createPcMonsterSpellRelation(
		input: CreatePcMonsterSpellRelationInput,
	): Promise<void> {
		await this.validatePcMonsterSpell(input);

		await this.pcMonsterSpellRepository.create(input);
	}

	private async validatePcMonsterSpell(
		input: CreatePcMonsterSpellRelationInput,
	): Promise<void> {
		const isMonsterSpell = await this.monsterActionRepository.isMonsterSpell(
			input.monster_action_id,
		);

		if (!isMonsterSpell) {
			throw new ValidationError(
				"monster_action_id must reference a monster action with action_type = spell",
			);
		}
	}
}