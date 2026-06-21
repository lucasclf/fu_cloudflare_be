import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { NpcService } from "../../../application/npc-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { forbidIfNotMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignIdParamSchema, visibilityFieldSchema } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import { createCampaignNpcSchema } from "../../../schemas/npc-schemas";

type EntityFactory = (env: Env) => CampaignEntityService;
type NpcFactory = (env: Env) => NpcService;

const createCampaignNpcWithVisibilitySchema = createCampaignNpcSchema.extend(visibilityFieldSchema.shape);
const campaignNpcParamSchema = campaignIdParamSchema.extend({
    npcId: z.string().regex(/^\d+$/, "npcId must be a positive integer"),
});

const sec = [{ userToken: [] }];

export function createCampaignNpcRoutes(npcFactory: NpcFactory, entityFactory: EntityFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/npcs", tags: ["Campanhas"],
        summary: "Criar NPC na campanha",
        description: "Cria um NPC e o vincula automaticamente à campanha, podendo incluir regras especiais, inventário e equipamento. Apenas o mestre da campanha pode criar NPCs.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignNpcWithVisibilitySchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const { visible_to_players, specialRules, inventory, equipment, ...npcInput } = c.req.valid("json");
            const newNpcId = await npcFactory(c.env).createNpc(npcInput);
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "npc", entity_id: newNpcId, visible_to_players });

            for (const rule of specialRules) {
                await npcFactory(c.env).createNpcSpecialRules({ ...rule, npc_id: newNpcId });
            }

            for (const inventoryItem of inventory) {
                await npcFactory(c.env).createNpcInventoryRepository({ ...inventoryItem, npc_id: newNpcId });
            }

            if (equipment) {
                await npcFactory(c.env).createNpcEquipmentRepository({ ...equipment, npc_id: newNpcId });
            }

            return c.json({ success: true as const, data: { message: "NPC created and linked to campaign" } } as any, 201);
        });

    routes.openapi(createRoute({
        method: "patch", path: "/:campaignId/npcs/:npcId", tags: ["Campanhas"],
        summary: "Atualizar NPC da campanha",
        security: sec,
        request: {
            params: campaignNpcParamSchema,
            body: { content: { "application/json": { schema: createCampaignNpcWithVisibilitySchema } } },
        },
        responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, npcId } = c.req.valid("param");
            const linked = await entityFactory(c.env).getEntity(Number(campaignId), "npc", Number(npcId));
            if (!linked) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "NPC não encontrado nesta campanha" } } as any, 404);
            const { visible_to_players, specialRules, inventory, equipment, ...npcInput } = c.req.valid("json");
            await npcFactory(c.env).updateNpc(
                Number(npcId),
                npcInput,
                (specialRules ?? []).map((r: any) => ({ ...r, npc_id: Number(npcId) })),
                (inventory ?? []).map((i: any) => ({ ...i, npc_id: Number(npcId) })),
                equipment ? { ...equipment, npc_id: Number(npcId) } : null,
            );
            await entityFactory(c.env).updateEntityVisibility(Number(campaignId), "npc", Number(npcId), visible_to_players);
            return c.json({ success: true as const, data: { message: "NPC atualizado com sucesso" } } as any, 200);
        });

    return routes;
}
