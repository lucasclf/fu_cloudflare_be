import { NpcService } from "../application/npc-service";
import { D1ItemRepository } from "../infrastructure/repository/d1-item-repository";
import { D1NpcEquipmentRepository } from "../infrastructure/repository/d1-npc-equipment-repository";
import { D1NpcInventoryRepository } from "../infrastructure/repository/d1-npc-inventory-repository";
import { D1NpcRepository } from "../infrastructure/repository/d1-npc-repository";
import { D1NpcSpecialRulesRepository } from "../infrastructure/repository/d1-npc-special-rules-repository";
import type { Env } from "../types/env";

export function createNpcService(env: Env): NpcService {
    const npcRepository = new D1NpcRepository(env.fabula_ultima_db)
    const rulesRepository = new  D1NpcSpecialRulesRepository(env.fabula_ultima_db)
    const inventoryRepository = new  D1NpcInventoryRepository(env.fabula_ultima_db)
    const equipmentRepository = new  D1NpcEquipmentRepository(env.fabula_ultima_db)
    const itemRepository = new D1ItemRepository(env.fabula_ultima_db)

    return new NpcService(npcRepository, rulesRepository, inventoryRepository, equipmentRepository, itemRepository)
}
