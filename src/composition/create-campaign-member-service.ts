import { CampaignMemberService } from "../application/campaign-member-service";
import { D1CampaignRepository } from "../infrastructure/repository/d1-campaign-repository";
import { D1CampaignMemberRepository } from "../infrastructure/repository/d1-campaign-member-repository";
import type { Env } from "../types/env";

export function createCampaignMemberService(env: Env): CampaignMemberService {
    return new CampaignMemberService(
        new D1CampaignRepository(env.fabula_ultima_db),
        new D1CampaignMemberRepository(env.fabula_ultima_db),
    );
}
