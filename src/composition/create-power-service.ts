import { PowerService } from "../application/power-service";
import { D1JobPowerRepository } from "../infrastructure/d1-job-power-repository";
import type { Env } from "../types/env";

export function createPowerService(env: Env): PowerService {
    const repository = new D1JobPowerRepository(env.fabula_ultima_db);
    return new PowerService(repository);
}