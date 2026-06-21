import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CampaignInvitationService } from "../../../application/campaign-invitation-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { isMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import {
    campaignIdParamSchema,
    campaignInvitationListResponse,
    invitationIdParamSchema,
    sendInvitationSchema,
} from "../../../schemas/campaign-schemas";
import {
    badRequestResponse,
    conflictResponse,
    createdResponse,
    forbiddenResponse,
    noContentResponse,
    notFoundResponse,
    okMessageResponse,
    unauthorizedResponse,
} from "../../../schemas/common";

type InvitationServiceFactory = (env: Env) => CampaignInvitationService;

export function createCampaignInvitationRoutes(
    invitationServiceFactory: InvitationServiceFactory,
) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    const sec = [{ userToken: [] }];

    // POST /:campaignId/invitations — enviar convite (master)
    routes.openapi(
        createRoute({
            method: "post",
            path: "/:campaignId/invitations",
            tags: ["Convites"],
            summary: "Enviar convite (master)",
            description: "Envia convite a um usuário pelo e-mail ou nickname. O convidado precisa aceitar para tornar-se membro.",
            security: sec,
            request: {
                params: campaignIdParamSchema,
                body: { content: { "application/json": { schema: sendInvitationSchema } } },
            },
            responses: {
                201: createdResponse,
                400: badRequestResponse,
                401: unauthorizedResponse,
                403: forbiddenResponse,
                404: notFoundResponse,
                409: conflictResponse,
            },
        }),
        async (c) => {
            if (!isMaster(c))
                return c.json({ success: false as const, error: { code: "FORBIDDEN", message: "Master role required" } }, 403) as any;

            const userId = c.get("userId");
            if (!userId)
                return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const { campaignId } = c.req.valid("param");
            const body = c.req.valid("json");

            await invitationServiceFactory(c.env).sendInvitation(
                Number(campaignId),
                userId,
                body.invitee_email
                    ? { type: "email" as const, value: body.invitee_email }
                    : { type: "nickname" as const, value: body.invitee_nickname! },
            );

            return c.json({ success: true as const, data: { message: "Invitation sent successfully" } } as any, 201);
        },
    );

    // GET /:campaignId/invitations — listar convites da campanha (master)
    routes.openapi(
        createRoute({
            method: "get",
            path: "/:campaignId/invitations",
            tags: ["Convites"],
            summary: "Listar convites da campanha (master)",
            security: sec,
            request: { params: campaignIdParamSchema },
            responses: {
                200: { content: { "application/json": { schema: campaignInvitationListResponse } }, description: "Convites" },
                401: unauthorizedResponse,
                403: forbiddenResponse,
            },
        }),
        async (c) => {
            if (!isMaster(c))
                return c.json({ success: false as const, error: { code: "FORBIDDEN", message: "Master role required" } }, 403) as any;

            const { campaignId } = c.req.valid("param");
            const invitations = await invitationServiceFactory(c.env).listCampaignInvitations(Number(campaignId));
            return c.json({ success: true as const, data: invitations } as any, 200);
        },
    );

    // DELETE /:campaignId/invitations/:invitationId — cancelar convite (master)
    routes.openapi(
        createRoute({
            method: "delete",
            path: "/:campaignId/invitations/:invitationId",
            tags: ["Convites"],
            summary: "Cancelar convite (master)",
            security: sec,
            request: { params: invitationIdParamSchema },
            responses: {
                204: noContentResponse,
                400: badRequestResponse,
                401: unauthorizedResponse,
                403: forbiddenResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            if (!isMaster(c))
                return c.json({ success: false as const, error: { code: "FORBIDDEN", message: "Master role required" } }, 403) as any;

            const { campaignId, invitationId } = c.req.valid("param");
            await invitationServiceFactory(c.env).cancelInvitation(
                Number(invitationId),
                Number(campaignId),
            );
            return c.body(null, 204);
        },
    );

    return routes;
}
