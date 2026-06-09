import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CampaignMemberService } from "../../../application/campaign-member-service";
import type { CampaignService } from "../../../application/campaign-service";
import { CampaignMasterLimitReachedError } from "../../../domain/campaigns/campaign-errors";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { createCampaignSchema, userCampaignListResponse } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, forbiddenResponse, noContentResponse, notFoundResponse, unauthorizedResponse } from "../../../schemas/common";
import { ForbiddenAppError } from "../../../domain/app-error";
import { campaignIdParamSchema } from "../../../schemas/campaign-schemas";
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

    const sec = [{ userToken: [] }];

    // GET / — listar campanhas do usuário autenticado
    routes.openapi(
        createRoute({
            method: "get",
            path: "/",
            tags: ["Campanhas"],
            summary: "Listar minhas campanhas",
            description: "Retorna todas as campanhas em que o usuário autenticado é membro (mestre ou jogador).",
            security: sec,
            responses: {
                200: { content: { "application/json": { schema: userCampaignListResponse } }, description: "Campanhas do usuário" },
                401: unauthorizedResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;
            const campaigns = await memberServiceFactory(c.env).listMyCampaigns(userId);
            return c.json({ success: true as const, data: campaigns } as any, 200);
        },
    );

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

            const masterCount = await memberServiceFactory(c.env).countMasterCampaigns(userId);
            if (masterCount >= 5) throw new CampaignMasterLimitReachedError();

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

    // DELETE /:campaignId — deletar campanha (apenas master)
    routes.openapi(
        createRoute({
            method: "delete",
            path: "/:campaignId",
            tags: ["Campanhas"],
            summary: "Deletar campanha",
            description: "Remove permanentemente a campanha e todos os seus dados. Apenas o **master** da campanha pode executar esta ação.",
            security: sec,
            request: { params: campaignIdParamSchema },
            responses: {
                204: noContentResponse,
                401: unauthorizedResponse,
                403: forbiddenResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const { campaignId } = c.req.valid("param");
            const member = await memberServiceFactory(c.env).findByUserAndCampaign(userId, Number(campaignId));
            if (!member || member.role !== "master") throw new ForbiddenAppError("Apenas o mestre pode deletar a campanha.");

            await campaignServiceFactory(c.env).deleteCampaign(campaignId);
            return c.body(null, 204);
        },
    );

    return routes;
}
