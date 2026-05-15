import { ArcanaService } from "../application/arcana-service";
import { D1ArcanaRepository } from "../infrastructure/d1-arcana-repository";
import type { Env } from "../types/env";

export function createArcanaService(env: Env): ArcanaService {
    const arcanaRepository = new D1ArcanaRepository(env.fabula_ultima_db);
    
    return new ArcanaService(arcanaRepository);
}