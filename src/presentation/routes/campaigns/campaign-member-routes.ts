import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CampaignMemberService } from "../../../application/campaign-member-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { forbidIfNotMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import {
    campaignIdParamSchema, memberListResponse, memberUserIdParamSchema, addMemberSchema, updateMemberRoleSchema,
} from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, noContentResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";

type MemberFactory = (env: Env) => CampaignMemberService;

const sec = [{ userToken: [] }];

export function createCampaignMemberRoutes(memberFactory: MemberFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

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

    return routes;
}
