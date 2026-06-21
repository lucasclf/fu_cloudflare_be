import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { LocationService } from "../../../application/location-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { forbidIfNotMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignIdParamSchema, visibilityFieldSchema } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import { createLocationSchema } from "../../../schemas/location-schemas";

type EntityFactory = (env: Env) => CampaignEntityService;
type LocationFactory = (env: Env) => LocationService;

const createCampaignLocationSchema = createLocationSchema.extend(visibilityFieldSchema.shape);
const campaignLocationParamSchema = campaignIdParamSchema.extend({
    locationId: z.string().regex(/^\d+$/, "locationId must be a positive integer"),
});

const sec = [{ userToken: [] }];

export function createCampaignLocationRoutes(locationFactory: LocationFactory, entityFactory: EntityFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/locations", tags: ["Campanhas"],
        summary: "Criar localização na campanha",
        description: "Cria uma localização e a vincula automaticamente à campanha. Apenas o mestre da campanha pode criar localizações.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignLocationSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const { visible_to_players, ...locationInput } = c.req.valid("json");
            const newLocationId = await locationFactory(c.env).createLocation(locationInput);
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "location", entity_id: newLocationId, visible_to_players });
            return c.json({ success: true as const, data: { message: "Location created and linked to campaign" } } as any, 201);
        });

    routes.openapi(createRoute({
        method: "patch", path: "/:campaignId/locations/:locationId", tags: ["Campanhas"],
        summary: "Atualizar local da campanha",
        security: sec,
        request: {
            params: campaignLocationParamSchema,
            body: { content: { "application/json": { schema: createCampaignLocationSchema } } },
        },
        responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, locationId } = c.req.valid("param");
            const linked = await entityFactory(c.env).getEntity(Number(campaignId), "location", Number(locationId));
            if (!linked) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Local não encontrado nesta campanha" } } as any, 404);
            const { visible_to_players, ...locationInput } = c.req.valid("json");
            await locationFactory(c.env).updateLocation(Number(locationId), locationInput);
            await entityFactory(c.env).updateEntityVisibility(Number(campaignId), "location", Number(locationId), visible_to_players);
            return c.json({ success: true as const, data: { message: "Local atualizado com sucesso" } } as any, 200);
        });

    return routes;
}
