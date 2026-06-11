import { ValidationError } from "../domain/domain-errors";
import { ResourceNotFoundError } from "../domain/common-errors";
import type {
	CreatePcArcanaRelationInput,
	CreatePcEquipmentInput,
	CreatePCInput,
	UpdatePCInput,
	CreatePcInventoryInput,
	CreatePcMonsterSpellRelationInput,
	CreatePcSpellRelationInput,
    PcBondInput,
    PcJobRelation,
    PcPowerRelation,
} from "../domain/pc/pc";
import { PcWriterPort, PcJobWriterPort, PcPowerWriterPort, PcSpellWriterPort, PcArcanaWriterPort, PcEquipmentWriterPort, PcInventoryWriterPort, PcBondWriterPort, PcMonsterSpellWriterPort, MonsterActionValidationPort, PcExistsPort } from "./ports/pc-ports";

export class PcCommandService {
	constructor(
		private readonly pcRepository: PcWriterPort,
		private readonly pcExistsRepository: PcExistsPort,
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

	async createPc(input: CreatePCInput): Promise<number> {
		return await this.pcRepository.create(input);
	}

	async updatePc(pcId: string, input: UpdatePCInput): Promise<void> {
		await this.validatePcExists(Number(pcId));
		await this.pcRepository.update(pcId, input);
	}

	async createPcJobRelation(input: PcJobRelation): Promise<void> {
		await this.validatePcExists(input.pc_id);
		await this.validateUnmasteredJobLimit(input);
		await this.pcJobRepository.create(input);
	}

	async createPcPowerRelation(input: PcPowerRelation): Promise<void> {
		await this.validatePcExists(input.pc_id);
		await this.pcPowerRepository.create(input);
	}

	async createPcSpellRelation(input: CreatePcSpellRelationInput): Promise<void> {
		await this.validatePcExists(input.pc_id);
		await this.pcSpellRepository.create(input);
	}

	async createPcArcanaRelation(
		input: CreatePcArcanaRelationInput,
	): Promise<void> {
		await this.validatePcExists(input.pc_id);
		await this.pcArcanaRepository.create(input);
	}

	async createPcEquipment(input: CreatePcEquipmentInput): Promise<void> {
		await this.validatePcExists(input.pc_id);
		await this.pcEquipmentRepository.create(input);
	}

	async createPcInventory(input: CreatePcInventoryInput): Promise<void> {
		await this.validatePcExists(input.pc_id);
		await this.pcInventoryRepository.create(input);
	}

	async createPcBond(input: PcBondInput): Promise<void> {
		await this.validatePcExists(input.pc_id);
		await this.pcBondRepository.create(input);
	}

	async createPcMonsterSpellRelation(
		input: CreatePcMonsterSpellRelationInput,
	): Promise<void> {
		await this.validatePcExists(input.pc_id);
		await this.validatePcMonsterSpell(input);
		await this.pcMonsterSpellRepository.create(input);
	}

	private async validatePcExists(pcId: number): Promise<void> {
		const exists = await this.pcExistsRepository.exists(pcId);

		if (!exists) {
			throw new ResourceNotFoundError("PC", pcId);
		}
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

	private async validateUnmasteredJobLimit(input: PcJobRelation): Promise<void> {
		if (input.level >= MASTERED_JOB_LEVEL) {
			return;
		}

		const existingRelations = await this.pcJobRepository.findByPcId(input.pc_id);
		const unmasteredCount = existingRelations.filter(
			(relation) => relation.level < MASTERED_JOB_LEVEL,
		).length;

		if (unmasteredCount >= MAX_UNMASTERED_JOBS) {
			throw new ValidationError(
				"Um personagem não pode ter mais do que três classes não masterizadas.",
			);
		}
	}
}

const MASTERED_JOB_LEVEL = 10;
const MAX_UNMASTERED_JOBS = 3;