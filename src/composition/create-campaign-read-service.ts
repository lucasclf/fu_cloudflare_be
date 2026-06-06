import { CampaignReadService } from "../application/campaign-read-service";
import { D1CampaignRepository } from "../infrastructure/repository/d1-campaign-repository";
import { D1CampaignReadRepository } from "../infrastructure/repository/d1-campaign-read-repository";
import type { Env } from "../types/env";

export function createCampaignReadService(env: Env): CampaignReadService {
    return new CampaignReadService(
        new D1CampaignRepository(env.fabula_ultima_db),
        new D1CampaignReadRepository(env.fabula_ultima_db),
    );
}
