import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { CampaignReadService } from "../../../application/campaign-read-service";
import type { PCService } from "../../../application/pc-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { isMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignIdParamSchema, pcParamSchema } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import { logAuthorizationDenied } from "../../../utils/security-log";
import {
    createPcSchema, createPcJobRelationSchema, createPcPowerRelationSchema,
    createPcSpellRelationSchema, createPcEquipmentSchema, createPcInventorySchema, createPcBondSchema,
} from "../../../schemas/pc-schemas";

type EntityFactory = (env: Env) => CampaignEntityService;
type ReadFactory = (env: Env) => CampaignReadService;
type PcFactory = (env: Env) => PCService;

const createCampaignPcSchema = createPcSchema.extend({
    jobs: z.array(createPcJobRelationSchema.omit({ pc_id: true })).default([]),
    powers: z.array(createPcPowerRelationSchema.omit({ pc_id: true })).default([]),
    spells: z.array(z.number().int().positive()).default([]),
    equipment: createPcEquipmentSchema.omit({ pc_id: true }).optional(),
    inventory: z.array(createPcInventorySchema.omit({ pc_id: true })).default([]),
    bonds: z.array(createPcBondSchema.omit({ pc_id: true })).default([]),
});

const sec = [{ userToken: [] }];

// ── PC: criação (user_id inferido do JWT) e edição ───────────────────────────
// PC é o único tipo de entidade de campanha que um player comum pode criar
// (até 3 por campanha) e só pode editar o próprio (verificado via
// pcs.user_id). Master pode criar sem limite e editar qualquer PC vinculado
// à própria campanha.

export function createCampaignPcRoutes(pcFactory: PcFactory, entityFactory: EntityFactory, readFactory: ReadFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

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

            try {
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
            } catch (error) {
                // Compensação: sem isso, uma falha no meio do processo (ex.: job_id
                // inexistente) deixaria o PC criado com relações parcialmente
                // populadas. Tabelas filhas têm ON DELETE CASCADE em pc_id, então
                // apagar o PC limpa qualquer relação já inserida nesta requisição.
                await pcFactory(c.env).deletePc(newPcId);
                throw error;
            }

            return c.json({ success: true as const, data: { message: "PC created and linked to campaign" } } as any, 201);
        });

    routes.openapi(createRoute({ method: "put", path: "/:campaignId/pcs/:pcId", tags: ["Campanhas"], summary: "Editar PC", description: "Master: qualquer PC vinculado a esta campanha. Player: apenas o próprio (verificado via pcs.user_id).", security: sec, request: { params: pcParamSchema, body: { content: { "application/json": { schema: createPcSchema } } } }, responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse } }),
        async (c) => {
            const { campaignId, pcId } = c.req.valid("param");
            if (isMaster(c)) {
                const linked = await readFactory(c.env).isPcInCampaign(Number(campaignId), Number(pcId), "master");
                if (!linked) {
                    // Master de uma campanha tentando editar um PC vinculado a outra
                    // campanha — exatamente o vetor do IDOR corrigido nesta rota.
                    logAuthorizationDenied(c.get("requestId"), { userId: c.get("userId"), campaignId: Number(campaignId), pcId: Number(pcId), reason: "pc_not_in_campaign" });
                    return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "PC not found in campaign" } }, 404) as any;
                }
            } else {
                const pc = await pcFactory(c.env).findById(pcId);
                if (!pc || pc.user_id !== c.get("userId")) {
                    logAuthorizationDenied(c.get("requestId"), { userId: c.get("userId"), campaignId: Number(campaignId), pcId: Number(pcId), reason: "not_pc_owner" });
                    return c.json({ success: false as const, error: { code: "FORBIDDEN", message: "You can only edit your own PC" } }, 403) as any;
                }
            }
            await pcFactory(c.env).updatePc(pcId, c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "PC updated successfully" } } as any, 200);
        });

    return routes;
}
