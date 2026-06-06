import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CampaignService } from "../../../application/campaign-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import {
    campaignListResponse, campaignResponse, campaignIdParamSchema, createCampaignSchema,
} from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, idParamSchema, noContentResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";

type Factory = (env: Env) => CampaignService;

export function createAdminCampaignRoutes(factory: Factory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();
    routes.use("*", adminAuthMiddleware);

    routes.openapi(createRoute({ method: "get", path: "/campaigns", tags: ["Campanhas"], summary: "Listar campanhas", security: [{ adminToken: [] }], responses: { 200: { content: { "application/json": { schema: campaignListResponse } }, description: "Lista" } } }),
        async (c) => c.json({ success: true as const, data: await factory(c.env).listCampaigns() } as any, 200));

    routes.openapi(createRoute({ method: "get", path: "/campaigns/:id", tags: ["Campanhas"], summary: "Buscar campanha por ID", security: [{ adminToken: [] }], request: { params: idParamSchema }, responses: { 200: { content: { "application/json": { schema: campaignResponse } }, description: "Campanha" }, 404: notFoundResponse } }),
        async (c) => c.json({ success: true as const, data: await factory(c.env).getCampaignById(c.req.valid("param").id) } as any, 200));

    routes.openapi(createRoute({ method: "post", path: "/campaigns", tags: ["Campanhas"], summary: "Criar campanha", security: [{ adminToken: [] }], request: { body: { content: { "application/json": { schema: createCampaignSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse } }),
        async (c) => { await factory(c.env).createCampaign(c.req.valid("json")); return c.json({ success: true as const, data: { message: "Campaign created successfully" } } as any, 201); });

    routes.openapi(createRoute({ method: "put", path: "/campaigns/:id", tags: ["Campanhas"], summary: "Atualizar campanha", security: [{ adminToken: [] }], request: { params: idParamSchema, body: { content: { "application/json": { schema: createCampaignSchema } } } }, responses: { 200: okMessageResponse, 400: badRequestResponse, 404: notFoundResponse, 409: conflictResponse } }),
        async (c) => { await factory(c.env).updateCampaign(c.req.valid("param").id, c.req.valid("json")); return c.json({ success: true as const, data: { message: "Campaign updated successfully" } } as any, 200); });

    routes.openapi(createRoute({ method: "delete", path: "/campaigns/:id", tags: ["Campanhas"], summary: "Remover campanha", security: [{ adminToken: [] }], request: { params: idParamSchema }, responses: { 204: noContentResponse, 404: notFoundResponse } }),
        async (c) => { await factory(c.env).deleteCampaign(c.req.valid("param").id); return c.body(null, 204); });

    return routes;
}
