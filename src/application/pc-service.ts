import { ValidationError } from "../domain/domain-errors";
import { CreatePcArcanaRelationInput, PcBondInput, CreatePcEquipmentInput, CreatePCInput, CreatePcInventoryInput, PcJobRelation, CreatePcMonsterSpellRelationInput, PcPowerRelation, CreatePcSpellRelationInput, PcFull, PcSummary } from "../domain/pc/pc";
import { D1MonsterActionRepository } from "../infrastructure/repository/d1-monster-action-repository";
import { D1PCArcanaRepository } from "../infrastructure/repository/d1-pc-arcana-repository";
import { D1PCBondRepository } from "../infrastructure/repository/d1-pc-bond-repository";
import { D1PCEquipmentRepository } from "../infrastructure/repository/d1-pc-equipment-repository";
import { D1PCInventoryRepository } from "../infrastructure/repository/d1-pc-inventory-repository";
import { D1PCJobRepository } from "../infrastructure/repository/d1-pc-job-repository";
import { D1PCMonsterSpellRepository } from "../infrastructure/repository/d1-pc-monster-spell-repository";
import { D1PCPowerRepository } from "../infrastructure/repository/d1-pc-power-repository";
import { D1PCRepository } from "../infrastructure/repository/d1-pc-repository";
import { D1PCSpellRepository } from "../infrastructure/repository/d1-pc-spell-repository";
import { PcCommandService } from "./pc-command-service";
import { PcQueryService } from "./pc-query-service";

export class PCService {
    constructor(
        private readonly pcQueryService: PcQueryService,
        private readonly pcCommandService: PcCommandService,
    ){}

    async createPc(input: CreatePCInput): Promise<void> {
        await this.pcCommandService.createPc(input);
    }

    async createPcJobRelation(input: PcJobRelation): Promise<void> {
        await this.pcCommandService.createPcJobRelation(input);
    }

    async createPcPowerRelation(input: PcPowerRelation): Promise<void> {
        await this.pcCommandService.createPcPowerRelation(input);
    }

    async createPcSpellRelation(input: CreatePcSpellRelationInput): Promise<void> {
        await this.pcCommandService.createPcSpellRelation(input);
    }

    async createPcArcanaRelation(input: CreatePcArcanaRelationInput): Promise<void> {
        await this.pcCommandService.createPcArcanaRelation(input);
    }

    async createPcEquipment(input: CreatePcEquipmentInput): Promise<void> {
        await this.pcCommandService.createPcEquipment(input);
    }

    async createPcInventory(input: CreatePcInventoryInput): Promise<void> {
        await this.pcCommandService.createPcInventory(input);
    }

    async createPcBond(input: PcBondInput): Promise<void> {
        await this.pcCommandService.createPcBond(input);
    }

    async createPcMonsterSpellRelation(input: CreatePcMonsterSpellRelationInput): Promise<void> {
        await this.pcCommandService.createPcMonsterSpellRelation(input);
    }

    async findAllSummary(): Promise<PcSummary[]> {
        return await this.pcQueryService.findAllSummary();
    }

    async findById(pcId: string): Promise<PcFull | null> {
        return await this.pcQueryService.findById(pcId);
    }
}
