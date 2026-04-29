import { SpellService } from "../application/spell-service";
import { D1JobSpellRepository } from "../infrastructure/d1-job-spell-repository";
import type { Env } from "../types/env";

export function createSpellService(env: Env): SpellService {
    const repository = new D1JobSpellRepository(env.fabula_ultima_db);
    return new SpellService(repository);
}