import { ScenarioService } from "../application/scenario-service";
import { D1FactionLocationRepository } from "../infrastructure/d1-faction-location-repository";
import { D1FactionRepository } from "../infrastructure/d1-faction-repository";
import { D1LocationRepository } from "../infrastructure/d1-location-repository";
import type { Env } from "../types/env";

export function createScenarioService(env: Env): ScenarioService {
    const locationRepository = new D1LocationRepository(env.fabula_ultima_db);
    const factionRepository = new D1FactionRepository(env.fabula_ultima_db);
    const factionLocationRepository = new D1FactionLocationRepository(env.fabula_ultima_db);
    
    return new ScenarioService(locationRepository, factionRepository, factionLocationRepository);
}