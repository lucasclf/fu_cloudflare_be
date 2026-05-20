import { ValidationError } from "../domain/domain-errors";
import { Arcana } from "../domain/jobs/job";
import { CreatePcArcanaRelationInput, PcBondInput, CreatePcEquipmentInput, CreatePCInput, CreatePcInventoryInput, PcJobRelation, CreatePcMonsterSpellRelationInput, PcPowerRelation, CreatePcSpellRelationInput, PcBase, PcFull, PcSummary, PcJobInfo, PcInventory, PcEquipment, PcCapacities, PcPowerInfo, PcCalculatedStats, BondTargetSummary, PcBond, TargetType } from "../domain/pc/pc";
import { PcBondResolver } from "../domain/pc/pc-bond-resolver";
import { PcStatsCalculator } from "../domain/pc/pc-stats-calculator";
import { MonsterSpell, Spell } from "../domain/spells/spells";
import { D1ArcanaRepository } from "../infrastructure/repository/d1-arcana-repository";
import { D1ItemRepository } from "../infrastructure/repository/d1-item-repository";
import { D1JobPowerRepository } from "../infrastructure/repository/d1-job-power-repository";
import { D1JobRepository } from "../infrastructure/repository/d1-job-repository";
import { D1JobSpellRepository } from "../infrastructure/repository/d1-job-spell-repository";
import { D1MonsterActionRepository } from "../infrastructure/repository/d1-monster-action-repository";
import { D1MonsterRepository } from "../infrastructure/repository/d1-monster-repository";
import { D1MonsterSpellRepository } from "../infrastructure/repository/d1-monster-spell-repository";
import { D1NpcRepository } from "../infrastructure/repository/d1-npc-repository";
import { D1PCArcanaRepository } from "../infrastructure/repository/d1-pc-arcana-repository";
import { D1PCBondRepository } from "../infrastructure/repository/d1-pc-bond-repository";
import { D1PCEquipmentRepository } from "../infrastructure/repository/d1-pc-equipment-repository";
import { D1PCInventoryRepository } from "../infrastructure/repository/d1-pc-inventory-repository";
import { D1PCJobRepository } from "../infrastructure/repository/d1-pc-job-repository";
import { D1PCMonsterSpellRepository } from "../infrastructure/repository/d1-pc-monster-spell-repository";
import { D1PCPowerRepository } from "../infrastructure/repository/d1-pc-power-repository";
import { D1PCRepository } from "../infrastructure/repository/d1-pc-repository";
import { D1PCSpellRepository } from "../infrastructure/repository/d1-pc-spell-repository";
import { PcFullAssembler } from "./pc-full-assembler.ts";

export class PCService {
    constructor(
        private readonly pcRepository: D1PCRepository,
        private readonly pcJobRepository: D1PCJobRepository,
        private readonly pcPowerRepository: D1PCPowerRepository,
        private readonly pcSpellRepository: D1PCSpellRepository,
        private readonly pcArcanaRepository: D1PCArcanaRepository,
        private readonly pcEquipmentRepository: D1PCEquipmentRepository,
        private readonly pcInventoryRepository: D1PCInventoryRepository,
        private readonly pcBondRepository: D1PCBondRepository,
        private readonly pcMonsterSpellRepository: D1PCMonsterSpellRepository,
        private readonly monsterActionRepository: D1MonsterActionRepository,
        private readonly pcFullAssembler: PcFullAssembler,
    ){}

    async createPc(input: CreatePCInput): Promise<void> {
        await this.pcRepository.create(input)
    }

    async createPcJobRelation(input: PcJobRelation): Promise<void> {
        await this.pcJobRepository.create(input)
    }

    async createPcPowerRelation(input: PcPowerRelation): Promise<void> {
        await this.pcPowerRepository.create(input)
    }

    async createPcSpellRelation(input: CreatePcSpellRelationInput): Promise<void> {
        await this.pcSpellRepository.create(input)
    }

    async createPcArcanaRelation(input: CreatePcArcanaRelationInput): Promise<void> {
        await this.pcArcanaRepository.create(input)
    }

    async createPcEquipment(input: CreatePcEquipmentInput): Promise<void> {
        await this.pcEquipmentRepository.create(input)
    }

    async createPcInventory(input: CreatePcInventoryInput): Promise<void> {
        await this.pcInventoryRepository.create(input)
    }

    async createPcBond(input: PcBondInput): Promise<void> {
        await this.pcBondRepository.create(input)
    }

    async createPcMonsterSpellRelation(input: CreatePcMonsterSpellRelationInput): Promise<void> {
        await this.validatePcMonsterSpell(input);

        await this.pcMonsterSpellRepository.create(input)
    }

    async findAllSummary(): Promise<PcSummary[]> {
        return await this.pcRepository.findAllSummary();
    }

    async findById(pcId: string): Promise<PcFull | null> {
        const pcBase =  await this.pcRepository.findById(pcId)
        if(pcBase == null) {
            return null
        }

        return this.pcFullAssembler.assemble(pcBase);
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
