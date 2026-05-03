import { LocationService } from "../application/location-service";
import { D1LocationRepository } from "../infrastructure/d1-location-repository";
import type { Env } from "../types/env";

export function createLocationService(env: Env): LocationService {
    const repository = new D1LocationRepository(env.fabula_ultima_db);
    return new LocationService(repository);
}