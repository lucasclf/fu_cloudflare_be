import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CampaignMemberService } from "../../../application/campaign-member-service";
import type { CampaignService } from "../../../application/campaign-service";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignResponse, createCampaignSchema } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, unauthorizedResponse } from "../../../schemas/common";
import { z } from "zod";
import { successResponseSchema } from "../../../schemas/common";

type CampaignServiceFactory = (env: Env) => CampaignService;
type MemberServiceFactory = (env: Env) => CampaignMemberService;

const createdCampaignResponse = successResponseSchema(
    z.object({ id: z.number(), message: z.string() }),
);

export function createUserCampaignRoutes(
    campaignServiceFactory: CampaignServiceFactory,
    memberServiceFactory: MemberServiceFactory,
) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.use("*", userAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/",
            tags: ["Campanhas"],
            summary: "Criar campanha",
            description: "Cria uma nova campanha e vincula o criador automaticamente como **master**.",
            security: [{ userToken: [] }],
            request: { body: { content: { "application/json": { schema: createCampaignSchema } } } },
            responses: {
                201: { content: { "application/json": { schema: createdCampaignResponse } }, description: "Campanha criada" },
                400: badRequestResponse,
                401: unauthorizedResponse,
                409: conflictResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const input = c.req.valid("json");
            const campaignId = await campaignServiceFactory(c.env).createCampaign(input);

            await memberServiceFactory(c.env).addMember({
                campaign_id: campaignId,
                user_id: userId,
                role: "master",
            });

            return c.json({ success: true as const, data: { id: campaignId, message: "Campaign created successfully" } } as any, 201);
        },
    );

    return routes;
}
