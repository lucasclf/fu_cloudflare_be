import { PCService } from "../application/pc-service";
import { D1ArcanaRepository } from "../infrastructure/d1-arcana-repository";
import { D1ItemRepository } from "../infrastructure/d1-item-repository";
import { D1JobPowerRepository } from "../infrastructure/d1-job-power-repository";
import { D1JobRepository } from "../infrastructure/d1-job-repository";
import { D1JobSpellRepository } from "../infrastructure/d1-job-spell-repository";
import { D1MonsterActionRepository } from "../infrastructure/d1-monster-action-repository";
import { D1MonsterSpellRepository } from "../infrastructure/d1-monster-spell-repository";
import { D1PCArcanaRepository } from "../infrastructure/d1-pc-arcana-repository";
import { D1PCBondRepository } from "../infrastructure/d1-pc-bond-repository";
import { D1PCEquipmentRepository } from "../infrastructure/d1-pc-equipment-repository";
import { D1PCInventoryRepository } from "../infrastructure/d1-pc-inventory-repository";
import { D1PCJobRepository } from "../infrastructure/d1-pc-job-repository";
import { D1PCMonsterSpellRepository } from "../infrastructure/d1-pc-monster-spell-repository";
import { D1PCPowerRepository } from "../infrastructure/d1-pc-power-repository";
import { D1PCRepository } from "../infrastructure/d1-pc-repository";
import { D1PCSpellRepository } from "../infrastructure/d1-pc-spell-repository";
import type { Env } from "../types/env";

export function createPcService(env: Env): PCService {
    const pcRepository = new D1PCRepository(env.fabula_ultima_db)
    const pcJobRepository = new D1PCJobRepository(env.fabula_ultima_db)
    const pcPowerRepository = new D1PCPowerRepository(env.fabula_ultima_db)
    const pcSpellRepository = new D1PCSpellRepository(env.fabula_ultima_db)
    const pcArcanaRepository = new D1PCArcanaRepository(env.fabula_ultima_db)
    const pcEquipmentRepository = new D1PCEquipmentRepository(env.fabula_ultima_db)
    const pcInventoryRepository = new D1PCInventoryRepository(env.fabula_ultima_db)
    const pcBondRepository = new D1PCBondRepository(env.fabula_ultima_db)
    const pcMonsterSpellRepository = new D1PCMonsterSpellRepository(env.fabula_ultima_db)
    const monsterActionRepository = new D1MonsterActionRepository(env.fabula_ultima_db)
    const jobRepository = new D1JobRepository(env.fabula_ultima_db)
    const jobPowerRepository = new D1JobPowerRepository(env.fabula_ultima_db)
    const jobSpellRepository = new D1JobSpellRepository(env.fabula_ultima_db)
    const arcanaRepository = new D1ArcanaRepository(env.fabula_ultima_db)
    const itemRepository = new D1ItemRepository(env.fabula_ultima_db)
    const monsterSpellRepository = new D1MonsterSpellRepository(env.fabula_ultima_db)

    return new PCService(
        pcRepository, 
        pcJobRepository, 
        pcPowerRepository, 
        pcSpellRepository,
        pcArcanaRepository,
        pcEquipmentRepository,
        pcInventoryRepository,
        pcBondRepository,
        pcMonsterSpellRepository,
        monsterActionRepository,
        jobRepository,
        jobPowerRepository,
        jobSpellRepository,
        arcanaRepository,
        itemRepository,
        monsterSpellRepository,
    )
}