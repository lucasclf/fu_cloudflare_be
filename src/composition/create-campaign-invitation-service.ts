import { CampaignInvitationService } from "../application/campaign-invitation-service";
import { D1CampaignInvitationRepository } from "../infrastructure/repository/d1-campaign-invitation-repository";
import { D1CampaignMemberRepository } from "../infrastructure/repository/d1-campaign-member-repository";
import { D1UserRepository } from "../infrastructure/repository/d1-user-repository";
import type { Env } from "../types/env";

export function createCampaignInvitationService(env: Env): CampaignInvitationService {
    return new CampaignInvitationService(
        new D1CampaignInvitationRepository(env.fabula_ultima_db),
        new D1CampaignMemberRepository(env.fabula_ultima_db),
        new D1UserRepository(env.fabula_ultima_db),
    );
}
