import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { SessionService } from "../../../application/session-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { forbidIfNotMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignIdParamSchema, visibilityFieldSchema } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import { createCampaignSessionSchema } from "../../../schemas/session-schemas";

type EntityFactory = (env: Env) => CampaignEntityService;
type SessionFactory = (env: Env) => SessionService;

const createCampaignSessionWithVisibilitySchema = createCampaignSessionSchema.extend(visibilityFieldSchema.shape);
const campaignSessionParamSchema = campaignIdParamSchema.extend({
    sessionId: z.string().regex(/^\d+$/, "sessionId must be a positive integer"),
});

const sec = [{ userToken: [] }];

export function createCampaignSessionRoutes(sessionFactory: SessionFactory, entityFactory: EntityFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/sessions", tags: ["Campanhas"],
        summary: "Criar sessão na campanha",
        description: "Cria uma sessão vinculada à campanha. Apenas o mestre da campanha pode criar sessões.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignSessionWithVisibilitySchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const { visible_to_players, ...sessionInput } = c.req.valid("json");
            const newSessionId = await sessionFactory(c.env).createSession({ ...sessionInput, campaign_id: Number(campaignId) });
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "session", entity_id: newSessionId, visible_to_players });
            return c.json({ success: true as const, data: { message: "Session created and linked to campaign" } } as any, 201);
        });

    routes.openapi(createRoute({
        method: "patch", path: "/:campaignId/sessions/:sessionId", tags: ["Campanhas"],
        summary: "Atualizar sessão da campanha",
        security: sec,
        request: {
            params: campaignSessionParamSchema,
            body: { content: { "application/json": { schema: createCampaignSessionWithVisibilitySchema } } },
        },
        responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, sessionId } = c.req.valid("param");
            const linked = await entityFactory(c.env).getEntity(Number(campaignId), "session", Number(sessionId));
            if (!linked) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Sessão não encontrada nesta campanha" } } as any, 404);
            const { visible_to_players, session_number: _, ...sessionInput } = c.req.valid("json");
            await sessionFactory(c.env).updateSession(Number(sessionId), sessionInput);
            await entityFactory(c.env).updateEntityVisibility(Number(campaignId), "session", Number(sessionId), visible_to_players);
            return c.json({ success: true as const, data: { message: "Sessão atualizada com sucesso" } } as any, 200);
        });

    return routes;
}
