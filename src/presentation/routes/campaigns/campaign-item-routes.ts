import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { ItemService } from "../../../application/item-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { forbidIfNotMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignIdParamSchema, visibilityFieldSchema } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import { createItemSchema } from "../../../schemas/item-schemas";

type EntityFactory = (env: Env) => CampaignEntityService;
type ItemFactory = (env: Env) => ItemService;

const createCampaignItemSchema = createItemSchema.extend(visibilityFieldSchema.shape);
const updateCampaignItemSchema = createItemSchema.extend(visibilityFieldSchema.shape);
const campaignItemParamSchema = campaignIdParamSchema.extend({
    itemId: z.string().regex(/^\d+$/, "itemId must be a positive integer"),
});

const sec = [{ userToken: [] }];

export function createCampaignItemRoutes(itemFactory: ItemFactory, entityFactory: EntityFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/items", tags: ["Campanhas"],
        summary: "Criar item na campanha",
        description: "Cria um item e o vincula automaticamente à campanha. Apenas o mestre da campanha pode criar itens.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignItemSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const { visible_to_players, ...itemInput } = c.req.valid("json");
            const newItemId = await itemFactory(c.env).createItem(itemInput);
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "item", entity_id: newItemId, visible_to_players });
            return c.json({ success: true as const, data: { message: "Item created and linked to campaign" } } as any, 201);
        });

    routes.openapi(createRoute({
        method: "patch", path: "/:campaignId/items/:itemId", tags: ["Campanhas"],
        summary: "Atualizar item da campanha",
        security: sec,
        request: {
            params: campaignItemParamSchema,
            body: { content: { "application/json": { schema: updateCampaignItemSchema } } },
        },
        responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, itemId } = c.req.valid("param");
            const linked = await entityFactory(c.env).getEntity(Number(campaignId), "item", Number(itemId));
            if (!linked) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Item não encontrado nesta campanha" } } as any, 404);
            const { visible_to_players, ...itemInput } = c.req.valid("json");
            await itemFactory(c.env).updateItem(Number(itemId), itemInput);
            await entityFactory(c.env).updateEntityVisibility(Number(campaignId), "item", Number(itemId), visible_to_players);
            return c.json({ success: true as const, data: { message: "Item atualizado com sucesso" } } as any, 200);
        });

    return routes;
}
