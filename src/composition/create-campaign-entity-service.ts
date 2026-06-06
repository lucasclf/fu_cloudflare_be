import { CampaignEntityService } from "../application/campaign-entity-service";
import { D1CampaignRepository } from "../infrastructure/repository/d1-campaign-repository";
import { D1CampaignEntityRepository, D1CampaignPcRepository } from "../infrastructure/repository/d1-campaign-entity-repository";
import type { Env } from "../types/env";

export function createCampaignEntityService(env: Env): CampaignEntityService {
    return new CampaignEntityService(
        new D1CampaignRepository(env.fabula_ultima_db),
        new D1CampaignEntityRepository(env.fabula_ultima_db),
        new D1CampaignPcRepository(env.fabula_ultima_db),
    );
}
