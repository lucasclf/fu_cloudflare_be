import { SpellService } from "../application/spell-service";
import { D1JobSpellRepository } from "../infrastructure/d1-job-spell-repository";
import { D1MonsterActionRepository } from "../infrastructure/d1-monster-spell-repository";
import type { Env } from "../types/env";

export function createSpellService(env: Env): SpellService {
    const jobSpellRepository = new D1JobSpellRepository(env.fabula_ultima_db);
    const   monsterSpellRepository = new D1MonsterActionRepository(env.fabula_ultima_db);
    return new SpellService(jobSpellRepository, monsterSpellRepository);
}