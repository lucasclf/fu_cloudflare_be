import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { FactionService } from "../../../application/faction-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { forbidIfNotMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignIdParamSchema, visibilityFieldSchema } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import { createFactionSchema } from "../../../schemas/faction-schemas";

type EntityFactory = (env: Env) => CampaignEntityService;
type FactionFactory = (env: Env) => FactionService;

const createCampaignFactionSchema = createFactionSchema.extend(visibilityFieldSchema.shape);
const campaignFactionParamSchema = campaignIdParamSchema.extend({
    factionId: z.string().regex(/^\d+$/, "factionId must be a positive integer"),
});

const sec = [{ userToken: [] }];

export function createCampaignFactionRoutes(factionFactory: FactionFactory, entityFactory: EntityFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/factions", tags: ["Campanhas"],
        summary: "Criar facção na campanha",
        description: "Cria uma facção e a vincula automaticamente à campanha, podendo relacioná-la a localizações existentes. Apenas o mestre da campanha pode criar facções.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignFactionSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const { visible_to_players, ...factionInput } = c.req.valid("json");
            const newFactionId = await factionFactory(c.env).createFaction(factionInput);
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "faction", entity_id: newFactionId, visible_to_players });
            return c.json({ success: true as const, data: { message: "Faction created and linked to campaign" } } as any, 201);
        });

    routes.openapi(createRoute({
        method: "patch", path: "/:campaignId/factions/:factionId", tags: ["Campanhas"],
        summary: "Atualizar facção da campanha",
        security: sec,
        request: {
            params: campaignFactionParamSchema,
            body: { content: { "application/json": { schema: createCampaignFactionSchema } } },
        },
        responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, factionId } = c.req.valid("param");
            const linked = await entityFactory(c.env).getEntity(Number(campaignId), "faction", Number(factionId));
            if (!linked) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Facção não encontrada nesta campanha" } } as any, 404);
            const { visible_to_players, ...factionInput } = c.req.valid("json");
            await factionFactory(c.env).updateFaction(Number(factionId), factionInput);
            await entityFactory(c.env).updateEntityVisibility(Number(campaignId), "faction", Number(factionId), visible_to_players);
            return c.json({ success: true as const, data: { message: "Facção atualizada com sucesso" } } as any, 200);
        });

    return routes;
}
