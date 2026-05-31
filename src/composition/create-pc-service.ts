import { PcBondResolver } from "../application/pc-bond-resolver.js";
import { PcCommandService } from "../application/pc-command-service.js";
import { PcFullAssembler } from "../application/pc-full-assembler";
import { PcQueryService } from "../application/pc-query-service.js";
import { PCService } from "../application/pc-service";
import { PcStatsCalculator } from "../domain/pc/pc-stats-calculator";
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
    const npcRepository = new D1NpcRepository(env.fabula_ultima_db)
    const monsterRepository = new D1MonsterRepository(env.fabula_ultima_db)
    const pcStatsCalculator = new PcStatsCalculator()
    const pcBondResolver = new PcBondResolver(
        pcRepository,
        npcRepository,
        monsterRepository,
    );
    const pcFullAssembler = new PcFullAssembler(
        pcJobRepository,
        pcPowerRepository,
        pcSpellRepository,
        pcArcanaRepository,
        pcEquipmentRepository,
        pcInventoryRepository,
        pcBondRepository,
        pcMonsterSpellRepository,
        jobRepository,
        jobPowerRepository,
        jobSpellRepository,
        arcanaRepository,
        itemRepository,
        monsterSpellRepository,
        pcStatsCalculator,
        pcBondResolver,
    )
    const pcQueryService = new PcQueryService(
        pcRepository,
        pcFullAssembler,
    );
    const pcCommandService = new PcCommandService(
        pcRepository,
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
    )
    
    return new PCService(
        pcQueryService,
        pcCommandService,
    )
}