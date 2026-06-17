import { CreateNpcEquipmentInput, CreateNpcInput, CreateNpcInventoryInput, CreateSpecialRulesInput, Npc, NpcFull, NpcSummary } from "../domain/npc/npc";
import { D1ItemRepository } from "../infrastructure/repository/d1-item-repository";
import { D1NpcEquipmentRepository } from "../infrastructure/repository/d1-npc-equipment-repository";
import { D1NpcInventoryRepository } from "../infrastructure/repository/d1-npc-inventory-repository";
import { D1NpcRepository } from "../infrastructure/repository/d1-npc-repository";
import { D1NpcSpecialRulesRepository } from "../infrastructure/repository/d1-npc-special-rules-repository";
import { NpcRepositoryPort, NpcSpecialRuleRepositoryPort, NpcInventoryRepositoryPort, NpcEquipmentRepositoryPort, NpcItemLookupPort } from "./ports/npc-ports";

export class NpcService{
    constructor(
        private readonly npcRepository: NpcRepositoryPort,
		private readonly npcSpecialRulesRepository: NpcSpecialRuleRepositoryPort,
		private readonly npcInventoryRepository: NpcInventoryRepositoryPort,
		private readonly npcEquipmentRepository: NpcEquipmentRepositoryPort,
		private readonly itemRepository: NpcItemLookupPort,
    ){}

    async createNpc(input: CreateNpcInput): Promise<number> {
        return await this.npcRepository.create(input)
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

    async updateNpc(
        id: number,
        input: CreateNpcInput,
        specialRules: CreateSpecialRulesInput[],
        inventory: CreateNpcInventoryInput[],
        equipment: CreateNpcEquipmentInput | null,
    ): Promise<void> {
        await this.npcRepository.update(id, input);
        await this.npcSpecialRulesRepository.deleteByNpcId(id);
        for (const rule of specialRules) {
            await this.npcSpecialRulesRepository.create(rule);
        }
        await this.npcInventoryRepository.deleteByNpcId(id);
        for (const item of inventory) {
            await this.npcInventoryRepository.create(item);
        }
        await this.npcEquipmentRepository.deleteByNpcId(id);
        if (equipment) {
            await this.npcEquipmentRepository.create(equipment);
        }
    }

    async findAll(): Promise<Npc[]> {
        return await this.npcRepository.findAll();
    }

    async findAllSummary(globalOnly?: boolean): Promise<NpcSummary[]> {
        return await this.npcRepository.findAllSummary(globalOnly);
    }

    async findById(
        npcId: string,
        includes: string[],
    ): Promise<NpcFull | null> {
        const npc = await this.npcRepository.findById(npcId);

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
                await this.npcSpecialRulesRepository.findByNpcsIds(npcIds);

            for (const npc of npcsFull) {
                npc.specialRules = rulesByNpcId.get(npc.id) ?? [];
            }
        }

        if (includes.includes("inventories")) {
            const inventoriesByNpcId =
                await this.npcInventoryRepository.findByNpcsIds(npcIds);

            const allInventories = [...inventoriesByNpcId.values()].flat();
            const itemIds = allInventories.map((inventory) => inventory.item_id);

            const itemsById = await this.itemRepository.findByIds(itemIds);

            for (const npc of npcsFull) {
                const inventoryRelations = inventoriesByNpcId.get(npc.id) ?? [];

                npc.inventory = inventoryRelations.map((relation) => {
                    const item = itemsById.get(relation.item_id);

                    if (!item) {
                        throw new Error(
                            `Item não encontrado para item_id=${relation.item_id}`,
                        );
                    }

                    return {
                        npc_id: relation.npc_id,
                        item,
                        relation_type: relation.relation_type,
                        quantity: relation.quantity,
                    };
                });
            }
        }

        if (includes.includes("equipments")) {
            const equipmentByNpcId =
                await this.npcEquipmentRepository.findByNpcsIds(npcIds);

            const itemIds = [...new Set(
                [...equipmentByNpcId.values()].flatMap((equipment) =>
                    [equipment.main_hand, equipment.off_hand, equipment.armor, equipment.accessory]
                        .filter((id): id is number => id !== null),
                ),
            )];

            const itemsById = await this.itemRepository.findByIds(itemIds);

            for (const npc of npcsFull) {
                const equipmentRelation = equipmentByNpcId.get(npc.id);

                npc.equipment = equipmentRelation
                    ? {
                            npc_id: equipmentRelation.npc_id,
                            main_hand: equipmentRelation.main_hand
                                ? itemsById.get(equipmentRelation.main_hand) ?? null
                                : null,
                            off_hand: equipmentRelation.off_hand
                                ? itemsById.get(equipmentRelation.off_hand) ?? null
                                : null,
                            armor: equipmentRelation.armor
                                ? itemsById.get(equipmentRelation.armor) ?? null
                                : null,
                            accessory: equipmentRelation.accessory
                                ? itemsById.get(equipmentRelation.accessory) ?? null
                                : null,
                        }
                    : undefined;
            }
        }

        return npcsFull;
    }
}