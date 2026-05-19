import { ValidationError } from "../domain/domain-errors";
import { Arcana } from "../domain/jobs/job";
import { CreatePcArcanaRelationInput, PcBondInput, CreatePcEquipmentInput, CreatePCInput, CreatePcInventoryInput, PcJobRelation, CreatePcMonsterSpellRelationInput, PcPowerRelation, CreatePcSpellRelationInput, PcBase, PcFull, PcSummary, PcJobInfo, PcInventory, PcEquipment, PcCapacities, PcPowerInfo, PcCalculatedStats, BondTargetSummary, PcBond, TargetType } from "../domain/pc/pc";
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
        private readonly jobRepository: D1JobRepository,
        private readonly jobPowerRepository: D1JobPowerRepository,
        private readonly jobSpellRepository: D1JobSpellRepository,
        private readonly arcanaRepository: D1ArcanaRepository,
        private readonly itemRepository: D1ItemRepository,
        private readonly monsterSpellRepository: D1MonsterSpellRepository,
        private readonly npcRepository: D1NpcRepository,
        private readonly monsterRepository: D1MonsterRepository,
        private readonly pcStatsCalculator: PcStatsCalculator
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

        return await this.mountPcFull(pcBase)
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

    private async mountPcFull(pcBase: PcBase): Promise<PcFull | null> {
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
            this.jobRepository.findResumeByIds(jobIds),
            this.jobPowerRepository.findByIds(powerIds),
            this.jobSpellRepository.findByIds(spellIds),
            this.arcanaRepository.findByIds(arcanaIds),
            this.monsterSpellRepository.findByIds(monsterActionIds),
            this.itemRepository.findByIds(itemIds),
        ]);

        const jobs: PcJobInfo[] = pcJobRelations.map((relation) => {
            const job = jobsById.get(relation.job_id);

            if (!job) {
                throw new Error(`Job não encontrada para id=${relation.job_id}`);
            }

            return {
                ...job,
                level: relation.level,
            };
        });

        const powers: PcPowerInfo[] = pcPowerRelations.map((relation) => {
            const power = powersById.get(relation.power_id);

            if (!power) {
                throw new Error(`Power não encontrado para id=${relation.power_id}`);
            }

            return {
                ...power,
                level: relation.level
            }
        });

        const spells: Spell[] = pcSpellRelations.map((relation) => {
            const spell = spellsById.get(relation.spell_id);

            if (!spell) {
                throw new Error(`Spell não encontrada para id=${relation.spell_id}`);
            }

            return spell;
        });

        const monsterSpells: MonsterSpell[] = pcMonsterSpellRelations.map((relation) => {
            const monsterSpell = monsterSpellsById.get(relation.monster_action_id);

            if (!monsterSpell) {
                throw new Error(
                    `Monster spell não encontrada para id=${relation.monster_action_id}`,
                );
            }

            return monsterSpell;
        });

        const arcanas: Arcana[] = pcArcanaRelations.map((relation) => {
            const arcana = arcanasById.get(relation.arcana_id);

            if (!arcana) {
                throw new Error(`Arcana não encontrada para id=${relation.arcana_id}`);
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
                throw new Error(`Item não encontrado para id=${relation.item_id}`);
            }

            return {
                pc_id: relation.pc_id,
                item,
                quantity: relation.quantity,
            };
        });

        const pcCapacities =
            this.pcStatsCalculator.calculateCapacities(jobs);

        const stats = this.pcStatsCalculator.calculateStats(
            pcBase,
            jobs,
            equipment,
            pcCapacities,
        );

        const bonds = await this.enrichPcBonds(pcBonds);

        return {
            ...pcBase,
            stats: stats,
            pc_capacities: this.pcStatsCalculator.calculateCapacities(jobs),
            jobs,
            powers,
            spells,
            monsterSpells,
            arcanas,
            equipment,
            inventories,
            bonds: bonds,
        };
    }
    
    private async enrichPcBonds(
        bonds: PcBond[],
    ): Promise<PcBond[]> {
        if (bonds.length === 0) {
            return [];
        }

        const pcTargetIds = bonds
            .filter((bond) => bond.target_type === "pc" && bond.target_id !== null)
            .map((bond) => bond.target_id as number);

        const npcTargetIds = bonds
            .filter((bond) => bond.target_type === "npc" && bond.target_id !== null)
            .map((bond) => bond.target_id as number);

        const monsterTargetIds = bonds
            .filter((bond) => bond.target_type === "monster" && bond.target_id !== null)
            .map((bond) => bond.target_id as number);

        const [pcsById, npcsById, monstersById] = await Promise.all([
            this.pcRepository.findBondTargetsByIds(pcTargetIds),
            this.npcRepository.findBondTargetsByIds(npcTargetIds),
            this.monsterRepository.findBondTargetsByIds(monsterTargetIds),
        ]);

        return bonds.map((bond) => {
            if (bond.target_type === "freeform") {
                if (!bond.target_name) {
                    throw new ValidationError(
                        "target_name is required when target_type is freeform",
                    );
                }

                return {
                    ...bond,
                    target_name: bond.target_name,
                    img_key: this.normalizeImgKey(bond.target_name),
                };
            }

            if (bond.target_id === null) {
                throw new ValidationError(
                    `target_id is required when target_type is ${bond.target_type}`,
                );
            }

            const target = this.findBondTarget(
                bond.target_type,
                bond.target_id,
                pcsById,
                npcsById,
                monstersById,
            );

            return {
                ...bond,
                target_name: target.name,
                img_key: target.img_key,
            };
        });
    }

    private findBondTarget(
        targetType: TargetType,
        targetId: number,
        pcsById: Map<number, BondTargetSummary>,
        npcsById: Map<number, BondTargetSummary>,
        monstersById: Map<number, BondTargetSummary>,
    ): BondTargetSummary {
        switch (targetType) {
            case "pc": {
                const target = pcsById.get(targetId);

                if (!target) {
                    throw new Error(`PC target not found for id=${targetId}`);
                }

                return target;
            }

            case "npc": {
                const target = npcsById.get(targetId);

                if (!target) {
                    throw new Error(`NPC target not found for id=${targetId}`);
                }

                return target;
            }

            case "monster": {
                const target = monstersById.get(targetId);

                if (!target) {
                    throw new Error(`Monster target not found for id=${targetId}`);
                }

                return target;
            }

            default:
                throw new ValidationError(`Invalid bond target_type: ${targetType}`);
        }
    }

    private normalizeImgKey(value: string): string {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    }
}
