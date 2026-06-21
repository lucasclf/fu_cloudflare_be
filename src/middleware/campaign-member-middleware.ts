import type { MiddlewareHandler } from "hono";
import { D1CampaignMemberRepository } from "../infrastructure/repository/d1-campaign-member-repository";
import type { Env, Variables } from "../types/env";
import { logAuthorizationDenied } from "../utils/security-log";

export const campaignMemberMiddleware: MiddlewareHandler<{
    Bindings: Env;
    Variables: Variables;
}> = async (c, next) => {
    const userId = c.get("userId");
    const isSuperUser = c.get("isSuperUser");

    if (userId === undefined) {
        return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
    }

    if (isSuperUser) {
        c.set("campaignRole", "super_user");
        await next();
        return;
    }

    const match = c.req.path.match(/\/campaigns\/(\d+)/);
    if (!match) {
        return c.json({ success: false, error: { code: "BAD_REQUEST", message: "Missing campaignId in path" } }, 400);
    }

    const campaignId = Number(match[1]);
    const memberRepo = new D1CampaignMemberRepository(c.env.fabula_ultima_db);
    const member = await memberRepo.findByUserAndCampaign(userId, campaignId);

    if (!member) {
        logAuthorizationDenied(c.get("requestId"), { userId, campaignId, reason: "not_a_member" });
        return c.json({ success: false, error: { code: "FORBIDDEN", message: "Not a member of this campaign" } }, 403);
    }

    c.set("campaignRole", member.role);
    await next();
};
