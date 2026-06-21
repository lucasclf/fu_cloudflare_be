import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignReadService } from "../../../application/campaign-read-service";
import type { PCService } from "../../../application/pc-service";
import { TooManyRequestsError } from "../../../domain/app-error";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignIdParamSchema, pcParamSchema } from "../../../schemas/campaign-schemas";
import { forbiddenResponse, notFoundResponse, tooManyRequestsResponse } from "../../../schemas/common";
import { buildCloudinarySignature } from "../../../utils/cloudinary-signature";
import {
    sessionListResponse, npcSummaryListResponse, locationListResponse, factionListResponse,
    monsterSummaryListResponse, campaignItemListResponse, campaignSpellListResponse, campaignJobListResponse,
    campaignPowerListResponse, campaignArcanaListResponse, uploadSignatureResponse,
} from "./campaign-read-schemas";
import { pcFullResponse, pcSummaryListResponse } from "../../../schemas/pc-schemas";

type ReadFactory = (env: Env) => CampaignReadService;
type PcFactory = (env: Env) => PCService;

const UPLOAD_ENTITY_TYPES = ["npc", "pc", "monster", "item", "location", "faction"] as const;
const uploadSignatureQuerySchema = z.object({
    entity_type: z.enum(UPLOAD_ENTITY_TYPES).optional(),
});

const sec = [{ userToken: [] }];

// ── Leitura (qualquer membro) e assinatura de upload ────────────────────────
// Nenhuma rota deste arquivo exige papel de master: leitura é liberada para
// qualquer membro da campanha (visibilidade já filtrada por role no service),
// e a assinatura de upload só permite gerar a URL assinada — a permissão de
// fato é validada quando a entidade é criada/editada.

export function createCampaignReadRoutes(readFactory: ReadFactory, pcFactory: PcFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

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

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/uploads/signature", tags: ["Campanhas"],
        summary: "Gerar assinatura de upload (Cloudinary)",
        description: "Qualquer membro da campanha pode gerar uma assinatura para subir uma imagem direto para o Cloudinary.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            query: uploadSignatureQuerySchema,
        },
        responses: { 200: { content: { "application/json": { schema: uploadSignatureResponse } }, description: "Assinatura de upload" }, 403: forbiddenResponse, 404: notFoundResponse, 429: tooManyRequestsResponse },
    }),
        async (c) => {
            const { campaignId } = c.req.valid("param");
            const { entity_type } = c.req.valid("query");

            // Cada assinatura permite um upload real ao Cloudinary, mesmo sem
            // vincular a entidade nenhuma — sem limite, qualquer membro podia
            // esgotar a cota gratuita da conta gerando assinaturas em loop.
            const { success: withinLimit } = await c.env.UPLOAD_RATE_LIMITER.limit({ key: String(c.get("userId")) });
            if (!withinLimit) {
                throw new TooManyRequestsError("Limite de uploads excedido. Tente novamente em alguns instantes.");
            }

            const folder = `fu-wiki/campaigns/${campaignId}/${entity_type ?? "misc"}`;
            const timestamp = Math.floor(Date.now() / 1000);
            const upload_preset = c.env.CLOUDINARY_UPLOAD_PRESET;

            const signature = await buildCloudinarySignature({ timestamp, upload_preset, folder }, c.env.CLOUDINARY_API_SECRET);

            return c.json({
                success: true as const,
                data: { timestamp, signature, api_key: c.env.CLOUDINARY_API_KEY, cloud_name: c.env.CLOUDINARY_CLOUD_NAME, upload_preset, folder },
            } as any, 200);
        });

    return routes;
}
