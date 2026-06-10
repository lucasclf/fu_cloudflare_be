import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { CampaignMemberService } from "../../../application/campaign-member-service";
import type { CampaignReadService } from "../../../application/campaign-read-service";
import type { ItemService } from "../../../application/item-service";
import type { PCService } from "../../../application/pc-service";
import type { SessionService } from "../../../application/session-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import {
    campaignIdParamSchema, campaignPcListResponse, entityListResponse, entityParamSchema,
    entityTypeSchema, linkEntitySchema, linkPcSchema, memberListResponse,
    memberUserIdParamSchema, addMemberSchema, updateMemberRoleSchema,
    pcParamSchema, updateCampaignPcSchema, updateVisibilitySchema,
} from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, noContentResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import { createItemSchema } from "../../../schemas/item-schemas";
import { createPcSchema, pcFullResponse, pcSummaryListResponse } from "../../../schemas/pc-schemas";
import { createCampaignSessionSchema } from "../../../schemas/session-schemas";
import { sessionListResponse, npcSummaryListResponse, locationListResponse, factionListResponse, monsterSummaryListResponse } from "./campaign-read-schemas";

type ReadFactory = (env: Env) => CampaignReadService;
type EntityFactory = (env: Env) => CampaignEntityService;
type MemberFactory = (env: Env) => CampaignMemberService;
type PcFactory = (env: Env) => PCService;
type ItemFactory = (env: Env) => ItemService;
type SessionFactory = (env: Env) => SessionService;

function isMaster(c: { get(key: string): unknown }): boolean {
    const role = c.get("campaignRole") as string | undefined;
    return role === "master" || role === "super_user";
}

function forbidIfNotMaster(c: any): Response | null {
    if (!isMaster(c)) return c.json({ success: false, error: { code: "FORBIDDEN", message: "Master role required" } }, 403);
    return null;
}

export function createCampaignRoutes(readFactory: ReadFactory, entityFactory: EntityFactory, pcFactory: PcFactory, memberFactory: MemberFactory, itemFactory: ItemFactory, sessionFactory: SessionFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    const sec = [{ userToken: [] }];

    // ── Leitura (qualquer membro) ────────────────────────────────────────────

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/sessions", tags: ["Campanhas"], summary: "Sessões", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: sessionListResponse } }, description: "Sessões" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listSessions(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/npcs", tags: ["Campanhas"], summary: "NPCs", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: npcSummaryListResponse } }, description: "NPCs" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listNpcs(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/locations", tags: ["Campanhas"], summary: "Localizações", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: locationListResponse } }, description: "Localizações" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listLocations(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/factions", tags: ["Campanhas"], summary: "Facções", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: factionListResponse } }, description: "Facções" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listFactions(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/monsters", tags: ["Campanhas"], summary: "Monstros", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: monsterSummaryListResponse } }, description: "Monstros" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listMonsters(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/pcs", tags: ["Campanhas"], summary: "PCs da campanha", description: "Player sempre vê o próprio PC.", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: pcSummaryListResponse } }, description: "PCs" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listPcs(Number(campaignId), role, c.get("userId")) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/pcs/:pcId", tags: ["Campanhas"], summary: "PC completo", security: sec, request: { params: pcParamSchema }, responses: { 200: { content: { "application/json": { schema: pcFullResponse } }, description: "PC" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => {
            const { campaignId, pcId } = c.req.valid("param");
            const ok = await readFactory(c.env).isPcInCampaign(Number(campaignId), Number(pcId), c.get("campaignRole") ?? "player", c.get("userId"));
            if (!ok) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "PC not found in campaign" } }, 404) as any;
            const pc = await pcFactory(c.env).findById(pcId);
            if (!pc) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "PC not found" } }, 404) as any;
            return c.json({ success: true as const, data: pc } as any, 200);
        });

    // ── Criar PC (user_id inferido do JWT) ───────────────────────────────────

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/pcs", tags: ["Campanhas"],
        summary: "Criar PC na campanha",
        description: "Cria um PC com user_id inferido do token JWT e o vincula automaticamente à campanha. Master pode criar PC para si mesmo; player cria PC para si.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createPcSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const { campaignId } = c.req.valid("param");
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;
            const body = c.req.valid("json");
            const newPcId = await pcFactory(c.env).createPc({ ...body, user_id: userId } as any);
            await entityFactory(c.env).linkPc({ campaign_id: Number(campaignId), pc_id: newPcId, visible_to_players: true });
            return c.json({ success: true as const, data: { message: "PC created and linked to campaign" } } as any, 201);
        });

    // ── Criar item e vincular à campanha (master) ────────────────────────────

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/items", tags: ["Campanhas"],
        summary: "Criar item na campanha",
        description: "Cria um item e o vincula automaticamente à campanha. Apenas o mestre da campanha pode criar itens.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createItemSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const newItemId = await itemFactory(c.env).createItem(c.req.valid("json"));
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "item", entity_id: newItemId, visible_to_players: true });
            return c.json({ success: true as const, data: { message: "Item created and linked to campaign" } } as any, 201);
        });

    // ── Criar sessão na campanha (master) ────────────────────────────────────

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/sessions", tags: ["Campanhas"],
        summary: "Criar sessão na campanha",
        description: "Cria uma sessão vinculada à campanha. Apenas o mestre da campanha pode criar sessões.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignSessionSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const body = c.req.valid("json");
            const newSessionId = await sessionFactory(c.env).createSession({ ...body, campaign_id: Number(campaignId) });
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "session", entity_id: newSessionId, visible_to_players: true });
            return c.json({ success: true as const, data: { message: "Session created and linked to campaign" } } as any, 201);
        });

    // ── Edição de PC ─────────────────────────────────────────────────────────

    routes.openapi(createRoute({ method: "put", path: "/:campaignId/pcs/:pcId", tags: ["Campanhas"], summary: "Editar PC", description: "Master: qualquer PC. Player: apenas o próprio (verificado via pcs.user_id).", security: sec, request: { params: pcParamSchema, body: { content: { "application/json": { schema: createPcSchema } } } }, responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            if (!isMaster(c)) {
                const pc = await pcFactory(c.env).findById(pcId);
                if (!pc || pc.user_id !== c.get("userId")) return c.json({ success: false as const, error: { code: "FORBIDDEN", message: "You can only edit your own PC" } }, 403) as any;
            }
            await pcFactory(c.env).updatePc(pcId, c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "PC updated successfully" } } as any, 200);
        });

    // ── Membros da campanha ────────────────────────────────────────────────────

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/members", tags: ["Campanhas"], summary: "Listar membros", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: memberListResponse } }, description: "Membros" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => c.json({ success: true as const, data: await memberFactory(c.env).listMembers(Number(c.req.valid("param").campaignId)) } as any, 200));

    routes.openapi(createRoute({ method: "post", path: "/:campaignId/members", tags: ["Campanhas"], summary: "Adicionar membro (master)", security: sec, request: { params: campaignIdParamSchema, body: { content: { "application/json": { schema: addMemberSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            await memberFactory(c.env).addMember({ campaign_id: Number(c.req.valid("param").campaignId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "Member added successfully" } } as any, 201);
        });

    routes.openapi(createRoute({ method: "patch", path: "/:campaignId/members/:userId", tags: ["Campanhas"], summary: "Alterar papel do membro (master)", security: sec, request: { params: memberUserIdParamSchema, body: { content: { "application/json": { schema: updateMemberRoleSchema } } } }, responses: { 200: okMessageResponse, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, userId } = c.req.valid("param");
            await memberFactory(c.env).updateMemberRole(Number(campaignId), Number(userId), c.req.valid("json").role);
            return c.json({ success: true as const, data: { message: "Member role updated" } } as any, 200);
        });

    routes.openapi(createRoute({ method: "delete", path: "/:campaignId/members/:userId", tags: ["Campanhas"], summary: "Remover membro (master)", security: sec, request: { params: memberUserIdParamSchema }, responses: { 204: noContentResponse, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, userId } = c.req.valid("param");
            await memberFactory(c.env).removeMember(Number(campaignId), Number(userId));
            return c.body(null, 204);
        });

    // ── Gerenciamento de vínculos (master only) ────────────────────────────────

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
