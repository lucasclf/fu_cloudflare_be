import { D1FactionRepository } from "../infrastructure/d1-faction-repository";
import type { Env } from "../types/env";
import { FactionService } from "../application/faction-service";
import { D1FactionLocationRepository } from "../infrastructure/d1-faction-location-repository";

export function createFactionService(env: Env): FactionService {
    const relationRepository = new D1FactionLocationRepository(env.fabula_ultima_db);
    const factionRepository = new D1FactionRepository(env.fabula_ultima_db);
    return new FactionService(relationRepository, factionRepository);
}