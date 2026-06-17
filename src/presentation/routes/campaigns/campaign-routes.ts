import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { CampaignMemberService } from "../../../application/campaign-member-service";
import type { CampaignReadService } from "../../../application/campaign-read-service";
import type { FactionService } from "../../../application/faction-service";
import type { ItemService } from "../../../application/item-service";
import type { LocationService } from "../../../application/location-service";
import type { MonsterService } from "../../../application/monster-service";
import type { NpcService } from "../../../application/npc-service";
import type { PCService } from "../../../application/pc-service";
import type { SessionService } from "../../../application/session-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import {
    campaignIdParamSchema, campaignPcListResponse, entityListResponse, entityParamSchema,
    entityTypeSchema, linkEntitySchema, linkPcSchema, memberListResponse,
    memberUserIdParamSchema, addMemberSchema, updateMemberRoleSchema,
    pcParamSchema, updateCampaignPcSchema, updateVisibilitySchema, visibilityFieldSchema,
} from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, noContentResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import { createFactionSchema } from "../../../schemas/faction-schemas";
import { createItemSchema } from "../../../schemas/item-schemas";
import { createLocationSchema } from "../../../schemas/location-schemas";
import {
    createMonsterActionSchema, createMonsterAffinitySchema, createMonsterSchema, createMonsterTraitSchema,
} from "../../../schemas/monster-schemas";
import { createCampaignNpcSchema } from "../../../schemas/npc-schemas";
import {
    createPcSchema, createPcJobRelationSchema, createPcPowerRelationSchema,
    createPcSpellRelationSchema, createPcEquipmentSchema, createPcInventorySchema,
    createPcBondSchema, pcFullResponse, pcSummaryListResponse,
} from "../../../schemas/pc-schemas";
import { createCampaignSessionSchema } from "../../../schemas/session-schemas";
import { sessionListResponse, npcSummaryListResponse, locationListResponse, factionListResponse, monsterSummaryListResponse, campaignItemListResponse, campaignSpellListResponse, campaignJobListResponse, campaignPowerListResponse, campaignArcanaListResponse } from "./campaign-read-schemas";

const createCampaignItemSchema = createItemSchema.extend(visibilityFieldSchema.shape);
const updateCampaignItemSchema = createItemSchema.extend(visibilityFieldSchema.shape);
const campaignItemParamSchema = campaignIdParamSchema.extend({
    itemId: z.string().regex(/^\d+$/, "itemId must be a positive integer"),
});
const createCampaignLocationSchema = createLocationSchema.extend(visibilityFieldSchema.shape);
const createCampaignFactionSchema = createFactionSchema.extend(visibilityFieldSchema.shape);
const createCampaignSessionWithVisibilitySchema = createCampaignSessionSchema.extend(visibilityFieldSchema.shape);
const createCampaignNpcWithVisibilitySchema = createCampaignNpcSchema.extend(visibilityFieldSchema.shape);

const campaignSessionParamSchema = campaignIdParamSchema.extend({
    sessionId: z.string().regex(/^\d+$/, "sessionId must be a positive integer"),
});
const campaignLocationParamSchema = campaignIdParamSchema.extend({
    locationId: z.string().regex(/^\d+$/, "locationId must be a positive integer"),
});
const campaignFactionParamSchema = campaignIdParamSchema.extend({
    factionId: z.string().regex(/^\d+$/, "factionId must be a positive integer"),
});
const campaignNpcParamSchema = campaignIdParamSchema.extend({
    npcId: z.string().regex(/^\d+$/, "npcId must be a positive integer"),
});
const campaignMonsterParamSchema = campaignIdParamSchema.extend({
    monsterId: z.string().regex(/^\d+$/, "monsterId must be a positive integer"),
});

const monsterTraitBodySchema = createMonsterTraitSchema.omit({ monster_id: true });
const monsterAffinityBodySchema = createMonsterAffinitySchema.omit({ monster_id: true });

// Campos permitidos por action_type — espelha ACTION_FIELD_VISIBILITY do fuweb
// (campaign-manage-page.tsx), que já oculta/limpa esses campos no formulário.
const ACTION_FIELD_VISIBILITY: Record<z.infer<typeof createMonsterActionSchema>["action_type"], {
    damageType: boolean; checkFormula: boolean; accuracyBonus: boolean;
    cost: boolean; target: boolean; duration: boolean; isOffensive: boolean;
}> = {
    special_rule: {
        damageType: false, checkFormula: false, accuracyBonus: false,
        cost: false, target: false, duration: false, isOffensive: false,
    },
    basic_attack: {
        damageType: true, checkFormula: true, accuracyBonus: true,
        cost: false, target: false, duration: false, isOffensive: true,
    },
    spell: {
        damageType: true, checkFormula: true, accuracyBonus: true,
        cost: true, target: true, duration: true, isOffensive: true,
    },
    other_action: {
        damageType: true, checkFormula: true, accuracyBonus: true,
        cost: true, target: true, duration: true, isOffensive: true,
    },
};

const monsterActionBodySchema = createMonsterActionSchema.omit({ monster_id: true })
    .refine(
        (action) => action.action_type !== "spell" || (!!action.cost && !!action.target && !!action.duration),
        { message: "Ações do tipo 'spell' exigem cost, target e duration" },
    )
    .superRefine((action, ctx) => {
        const visibility = ACTION_FIELD_VISIBILITY[action.action_type];
        const notAllowedMessage = (field: string) => `Campo '${field}' não é permitido para ações do tipo '${action.action_type}'`;

        if (!visibility.damageType && action.damage_type !== null) {
            ctx.addIssue({ code: "custom", path: ["damage_type"], message: notAllowedMessage("damage_type") });
        }
        if (!visibility.checkFormula && action.check_formula !== null) {
            ctx.addIssue({ code: "custom", path: ["check_formula"], message: notAllowedMessage("check_formula") });
        }
        if (!visibility.accuracyBonus && action.accuracy_bonus !== null) {
            ctx.addIssue({ code: "custom", path: ["accuracy_bonus"], message: notAllowedMessage("accuracy_bonus") });
        }
        if (!visibility.cost && action.cost !== null) {
            ctx.addIssue({ code: "custom", path: ["cost"], message: notAllowedMessage("cost") });
        }
        if (!visibility.target && action.target !== null) {
            ctx.addIssue({ code: "custom", path: ["target"], message: notAllowedMessage("target") });
        }
        if (!visibility.duration && action.duration !== null) {
            ctx.addIssue({ code: "custom", path: ["duration"], message: notAllowedMessage("duration") });
        }
        if (!visibility.isOffensive && action.is_offensive !== false) {
            ctx.addIssue({ code: "custom", path: ["is_offensive"], message: notAllowedMessage("is_offensive") });
        }
    });
const createCampaignMonsterSchema = createMonsterSchema.extend({
    ...visibilityFieldSchema.shape,
    traits: z.array(monsterTraitBodySchema).max(4).optional().default([]),
    affinities: monsterAffinityBodySchema.optional(),
    actions: z.array(monsterActionBodySchema).optional().default([]),
});

const createCampaignPcSchema = createPcSchema.extend({
    jobs: z.array(createPcJobRelationSchema.omit({ pc_id: true })).default([]),
    powers: z.array(createPcPowerRelationSchema.omit({ pc_id: true })).default([]),
    spells: z.array(z.number().int().positive()).default([]),
    equipment: createPcEquipmentSchema.omit({ pc_id: true }).optional(),
    inventory: z.array(createPcInventorySchema.omit({ pc_id: true })).default([]),
    bonds: z.array(createPcBondSchema.omit({ pc_id: true })).default([]),
});

type ReadFactory = (env: Env) => CampaignReadService;
type EntityFactory = (env: Env) => CampaignEntityService;
type MemberFactory = (env: Env) => CampaignMemberService;
type PcFactory = (env: Env) => PCService;
type ItemFactory = (env: Env) => ItemService;
type LocationFactory = (env: Env) => LocationService;
type SessionFactory = (env: Env) => SessionService;
type FactionFactory = (env: Env) => FactionService;
type NpcFactory = (env: Env) => NpcService;
type MonsterFactory = (env: Env) => MonsterService;

function isMaster(c: { get(key: string): unknown }): boolean {
    const role = c.get("campaignRole") as string | undefined;
    return role === "master" || role === "super_user";
}

function forbidIfNotMaster(c: any): Response | null {
    if (!isMaster(c)) return c.json({ success: false, error: { code: "FORBIDDEN", message: "Master role required" } }, 403);
    return null;
}

export function createCampaignRoutes(readFactory: ReadFactory, entityFactory: EntityFactory, pcFactory: PcFactory, memberFactory: MemberFactory, itemFactory: ItemFactory, sessionFactory: SessionFactory, locationFactory: LocationFactory, factionFactory: FactionFactory, npcFactory: NpcFactory, monsterFactory: MonsterFactory) {
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

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/items", tags: ["Campanhas"], summary: "Itens", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: campaignItemListResponse } }, description: "Itens" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listItems(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/spells", tags: ["Campanhas"], summary: "Magias", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: campaignSpellListResponse } }, description: "Magias" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listSpells(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/jobs", tags: ["Campanhas"], summary: "Classes", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: campaignJobListResponse } }, description: "Classes" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listJobs(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/powers", tags: ["Campanhas"], summary: "Poderes", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: campaignPowerListResponse } }, description: "Poderes" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listPowers(Number(campaignId), role) } as any, 200); });

    routes.openapi(createRoute({ method: "get", path: "/:campaignId/arcanas", tags: ["Campanhas"], summary: "Arcanas", security: sec, request: { params: campaignIdParamSchema }, responses: { 200: { content: { "application/json": { schema: campaignArcanaListResponse } }, description: "Arcanas" }, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => { const { campaignId } = c.req.valid("param"); const role = c.get("campaignRole") ?? "player"; return c.json({ success: true as const, data: await readFactory(c.env).listArcanas(Number(campaignId), role) } as any, 200); });

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
        description: "Cria um PC com user_id inferido do token JWT e o vincula automaticamente à campanha. Jogadores podem criar até 3 PCs por campanha; mestres sem limite.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignPcSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const { campaignId } = c.req.valid("param");
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            if (!isMaster(c)) {
                const countResult = await c.env.fabula_ultima_db
                    .prepare("SELECT COUNT(*) as count FROM pcs p INNER JOIN campaign_pcs cp ON cp.pc_id = p.id WHERE cp.campaign_id = ? AND p.user_id = ?")
                    .bind(Number(campaignId), userId)
                    .first<{ count: number }>();
                if ((countResult?.count ?? 0) >= 3) {
                    return c.json({ success: false as const, error: { code: "FORBIDDEN", message: "Você já possui o máximo de 3 personagens nesta campanha" } }, 403) as any;
                }
            }

            const { jobs, powers, spells, equipment, inventory, bonds, ...pcInput } = c.req.valid("json");
            const newPcId = await pcFactory(c.env).createPc({ ...pcInput, user_id: userId } as any);
            await entityFactory(c.env).linkPc({ campaign_id: Number(campaignId), pc_id: newPcId, visible_to_players: true });

            for (const job of jobs) {
                await pcFactory(c.env).createPcJobRelation({ ...job, pc_id: newPcId });
            }
            for (const power of powers) {
                await pcFactory(c.env).createPcPowerRelation({ ...power, pc_id: newPcId });
            }
            for (const spellId of spells) {
                await pcFactory(c.env).createPcSpellRelation({ spell_id: spellId, pc_id: newPcId });
            }
            if (equipment) {
                await pcFactory(c.env).createPcEquipment({ ...equipment, pc_id: newPcId });
            }
            for (const item of inventory) {
                await pcFactory(c.env).createPcInventory({ ...item, pc_id: newPcId });
            }
            for (const bond of bonds) {
                await pcFactory(c.env).createPcBond({ ...bond, pc_id: newPcId });
            }

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

    // ── Criar localização e vincular à campanha (master) ─────────────────────

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

    // ── Criar facção e vincular à campanha (master) ──────────────────────────

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

    // ── Criar sessão na campanha (master) ────────────────────────────────────

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

    // ── Criar NPC e vincular à campanha (master) ─────────────────────────────

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

    // ── Criar monstro e vincular à campanha (master) ─────────────────────────

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/monsters", tags: ["Campanhas"],
        summary: "Criar monstro na campanha",
        description: "Cria um monstro e o vincula automaticamente à campanha, podendo incluir até 4 traits, afinidades elementais e ações. Apenas o mestre da campanha pode criar monstros.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignMonsterSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const { visible_to_players, traits, affinities, actions, ...monsterInput } = c.req.valid("json");
            const newMonsterId = await monsterFactory(c.env).createMonster(monsterInput);
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "monster", entity_id: newMonsterId, visible_to_players });

            for (const trait of traits) {
                await monsterFactory(c.env).createMonsterTrait({ ...trait, monster_id: newMonsterId });
            }

            if (affinities) {
                await monsterFactory(c.env).createMonsterAffinity({ ...affinities, monster_id: newMonsterId });
            }

            for (const action of actions) {
                await monsterFactory(c.env).createMonsterAction({ ...action, monster_id: newMonsterId });
            }

            return c.json({ success: true as const, data: { message: "Monster created and linked to campaign" } } as any, 201);
        });

    // ── Editar item da campanha (master) ─────────────────────────────────────

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

    // ── Atualizar sessão da campanha (master) ────────────────────────────────

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

    // ── Atualizar local da campanha (master) ─────────────────────────────────

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

    // ── Atualizar facção da campanha (master) ────────────────────────────────

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

    // ── Atualizar NPC da campanha (master) ───────────────────────────────────

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

    // ── Atualizar monstro da campanha (master) ───────────────────────────────

    routes.openapi(createRoute({
        method: "patch", path: "/:campaignId/monsters/:monsterId", tags: ["Campanhas"],
        summary: "Atualizar monstro da campanha",
        security: sec,
        request: {
            params: campaignMonsterParamSchema,
            body: { content: { "application/json": { schema: createCampaignMonsterSchema } } },
        },
        responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, monsterId } = c.req.valid("param");
            const linked = await entityFactory(c.env).getEntity(Number(campaignId), "monster", Number(monsterId));
            if (!linked) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Monstro não encontrado nesta campanha" } } as any, 404);
            const { visible_to_players, traits, affinities, actions, ...monsterInput } = c.req.valid("json");
            await monsterFactory(c.env).updateMonster(
                Number(monsterId),
                monsterInput,
                (traits ?? []).map((t: any) => ({ ...t, monster_id: Number(monsterId) })),
                affinities ? { ...affinities, monster_id: Number(monsterId) } : null,
                (actions ?? []).map((a: any) => ({ ...a, monster_id: Number(monsterId) })),
            );
            await entityFactory(c.env).updateEntityVisibility(Number(campaignId), "monster", Number(monsterId), visible_to_players);
            return c.json({ success: true as const, data: { message: "Monstro atualizado com sucesso" } } as any, 200);
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
