import { CreateNpcEquipmentInput, CreateNpcInput, CreateNpcInventoryInput, CreateSpecialRulesInput, Npc, NpcFull, NpcSummary } from "../domain/npc/npc";
import { D1NpcEquipmentRepository } from "../infrastructure/d1-npc-equipment-repository";
import { D1NpcInventoryRepository } from "../infrastructure/d1-npc-inventory-repository";
import { D1NpcRepository } from "../infrastructure/d1-npc-repository";
import { D1NpcSpecialRulesRepository } from "../infrastructure/d1-npc-special-rules-repository";

export class NpcService{
    constructor(
        private readonly npcRepository: D1NpcRepository,
        private readonly npcSpecialRulesRepository: D1NpcSpecialRulesRepository,
        private readonly npcInventoryRepository: D1NpcInventoryRepository,
        private readonly npcEquipmentRepository: D1NpcEquipmentRepository
    ){}

    async createNpc(input: CreateNpcInput) {
        await this.npcRepository.create(input)
    }

    async createNpcSpecialRules(input: CreateSpecialRulesInput) {
        await this.npcSpecialRulesRepository.create(input)
    }

    async createNpcInventoryRepository(input: CreateNpcInventoryInput) {
        await this.npcInventoryRepository.create(input)
    }

    async createNpcEquipmentRepository(input: CreateNpcEquipmentInput) {
        await this.npcEquipmentRepository.create(input)
    }

    async findAll(): Promise<Npc[]> {
        return await this.npcRepository.findAll();
    }

    async findAllSummary(): Promise<NpcSummary[]> {
        return await this.npcRepository.findAllSummary();
    }

    async findById(
        npcId: string,
        includes: string[],
    ): Promise<NpcFull | null> {
        const npc = await this.npcRepository.finById(npcId);

        if (!npc) {
			return null;
		}

        const [npcFull] = await this.enrichNpcs([npc], includes);

		return npcFull;
    }

    private async enrichNpcs(
        npcs: Npc[],
        includes: string[],
    ): Promise<NpcFull[]> {
        const npcIds = npcs.map((npc) => npc.id);

        const npcsFull: NpcFull[] = npcs.map((npc) => ({
            ...npc,
        }));

        if (includes.includes("rules")) {
            const rulesByNpcId = 
                await this.npcSpecialRulesRepository.findByNpcsIds(npcIds)
            
            for (const npc of npcsFull) {
                npc.specialRules = rulesByNpcId.get(npc.id) ?? [];
            }
        }

        if (includes.includes("inventories")) {
            const inventoriesByNpcId = 
                await this.npcInventoryRepository.findByNpcsIds(npcIds)

            for (const npc of npcsFull) {
                npc.inventory = inventoriesByNpcId.get(npc.id) ?? [];
            }
        }

        if (includes.includes("equipments")) {
            const equipmentsByNpcId = 
                await this.npcEquipmentRepository.findByNpcsIds(npcIds)

            for (const npc of npcsFull) {
                npc.equipment = equipmentsByNpcId.get(npc.id) ?? [];
            }
        }

        return npcsFull;
    }
}