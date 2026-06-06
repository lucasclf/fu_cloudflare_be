import { CampaignService } from "../application/campaign-service";
import { D1CampaignRepository } from "../infrastructure/repository/d1-campaign-repository";
import type { Env } from "../types/env";

export function createCampaignService(env: Env): CampaignService {
    return new CampaignService(new D1CampaignRepository(env.fabula_ultima_db));
}
