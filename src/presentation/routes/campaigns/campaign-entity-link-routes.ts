import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { forbidIfNotMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import {
    campaignIdParamSchema, campaignPcListResponse, entityListResponse, entityParamSchema,
    entityTypeSchema, linkEntitySchema, linkPcSchema, pcParamSchema, updateCampaignPcSchema, updateVisibilitySchema,
} from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, noContentResponse, okMessageResponse } from "../../../schemas/common";

type EntityFactory = (env: Env) => CampaignEntityService;

const sec = [{ userToken: [] }];

// ── Gerenciamento de vínculos (master only) ─────────────────────────────────
// Endpoints genéricos de vínculo/visibilidade/desvínculo entre campanha e
// entidade (usados pela tela de administração da campanha), além do CRUD de
// vínculo de PCs já existentes.

export function createCampaignEntityLinkRoutes(entityFactory: EntityFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/entities", tags: ["Campanhas"], summary: "Vínculos de entidades", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: entityListResponse } }, description: "Vínculos" }, 403: forbiddenResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            return c.json({ success: true as const, data: await entityFactory(c.env).listEntities(Number(c.req.valid("param").campaignId)) } as any, 200);
        });

    routes.openapi(createRoute({ method: "post", path: "/:campaignId/entities", tags: ["Campanhas"], summary: "Vincular entidade", security: sec, request: { params: campaignIdParamSchema, body: { content: { "application/json": { schema: linkEntitySchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            await entityFactory(c.env).linkEntity({ campaign_id: Number(c.req.valid("param").campaignId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "Entity linked successfully" } } as any, 201);
        });

    routes.openapi(createRoute({ method: "patch", path: "/:campaignId/entities/:entityType/:entityId", tags: ["Campanhas"], summary: "Alterar visibilidade", security: sec, request: { params: entityParamSchema, body: { content: { "application/json": { schema: updateVisibilitySchema } } } }, responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, entityType, entityId } = c.req.valid("param");
            const parsed = entityTypeSchema.safeParse(entityType);
            if (!parsed.success) return c.json({ success: false as const, error: { code: "BAD_REQUEST", message: "Invalid entity_type" } }, 400) as any;
            await entityFactory(c.env).updateEntityVisibility(Number(campaignId), parsed.data, Number(entityId), c.req.valid("json").visible_to_players);
            return c.json({ success: true as const, data: { message: "Visibility updated" } } as any, 200);
        });

    routes.openapi(createRoute({ method: "delete", path: "/:campaignId/entities/:entityType/:entityId", tags: ["Campanhas"], summary: "Desvincular entidade", security: sec, request: { params: entityParamSchema }, responses: { 204: noContentResponse, 400: badRequestResponse, 403: forbiddenResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, entityType, entityId } = c.req.valid("param");
            const parsed = entityTypeSchema.safeParse(entityType);
            if (!parsed.success) return c.json({ success: false as const, error: { code: "BAD_REQUEST", message: "Invalid entity_type" } }, 400) as any;
            await entityFactory(c.env).unlinkEntity(Number(campaignId), parsed.data, Number(entityId));
            return c.body(null, 204);
        });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/campaign-pcs", tags: ["Campanhas"], summary: "PCs vinculados (detalhes)", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: campaignPcListResponse } }, description: "PCs" }, 403: forbiddenResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            return c.json({ success: true as const, data: await entityFactory(c.env).listPcs(Number(c.req.valid("param").campaignId)) } as any, 200);
        });

    routes.openapi(createRoute({ method: "post", path: "/:campaignId/campaign-pcs", tags: ["Campanhas"], summary: "Vincular PC à campanha", security: sec, request: { params: campaignIdParamSchema, body: { content: { "application/json": { schema: linkPcSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            await entityFactory(c.env).linkPc({ campaign_id: Number(c.req.valid("param").campaignId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC linked to campaign" } } as any, 201);
        });

    routes.openapi(createRoute({ method: "patch", path: "/:campaignId/campaign-pcs/:pcId", tags: ["Campanhas"], summary: "Atualizar PC na campanha", security: sec, request: { params: pcParamSchema, body: { content: { "application/json": { schema: updateCampaignPcSchema } } } }, responses: { 200: okMessageResponse, 403: forbiddenResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, pcId } = c.req.valid("param");
            await entityFactory(c.env).updateCampaignPc(Number(campaignId), Number(pcId), c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "Campaign PC updated" } } as any, 200);
        });

    routes.openapi(createRoute({ method: "delete", path: "/:campaignId/campaign-pcs/:pcId", tags: ["Campanhas"], summary: "Desvincular PC da campanha", security: sec, request: { params: pcParamSchema }, responses: { 204: noContentResponse, 403: forbiddenResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, pcId } = c.req.valid("param");
            await entityFactory(c.env).unlinkPc(Number(campaignId), Number(pcId));
            return c.body(null, 204);
        });

    return routes;
}
