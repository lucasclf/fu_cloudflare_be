import { MonsterService } from "../application/monster-service";
import { D1MonsterRepository } from "../infrastructure/d1-monster-repository";
import { D1MonsterTraitRepository } from "../infrastructure/d1-monster-trait-repository";
import type { Env } from "../types/env";

export function createMonsterService(env: Env): MonsterService {
    const monsterRepository = new D1MonsterRepository(env.fabula_ultima_db);
    const monsterTraitRepository = new D1MonsterTraitRepository(env.fabula_ultima_db);

    return new MonsterService(monsterRepository, monsterTraitRepository);
}
