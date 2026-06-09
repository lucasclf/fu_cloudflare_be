import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CampaignInvitationService } from "../../../application/campaign-invitation-service";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import {
    invitationSummaryListResponse,
    standaloneInvitationIdParamSchema,
} from "../../../schemas/campaign-schemas";
import {
    badRequestResponse,
    notFoundResponse,
    okMessageResponse,
    unauthorizedResponse,
} from "../../../schemas/common";

type InvitationServiceFactory = (env: Env) => CampaignInvitationService;

export function createUserInvitationRoutes(
    invitationServiceFactory: InvitationServiceFactory,
) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.use("*", userAuthMiddleware);

    const sec = [{ userToken: [] }];

    // GET / — listar meus convites pendentes
    routes.openapi(
        createRoute({
            method: "get",
            path: "/",
            tags: ["Convites"],
            summary: "Listar meus convites pendentes",
            security: sec,
            responses: {
                200: {
                    content: { "application/json": { schema: invitationSummaryListResponse } },
                    description: "Convites pendentes do usuário autenticado",
                },
                401: unauthorizedResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId)
                return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const invitations = await invitationServiceFactory(c.env).listMyInvitations(userId);
            return c.json({ success: true as const, data: invitations } as any, 200);
        },
    );

    // POST /:invitationId/accept — aceitar convite
    routes.openapi(
        createRoute({
            method: "post",
            path: "/:invitationId/accept",
            tags: ["Convites"],
            summary: "Aceitar convite",
            description: "Aceita o convite e adiciona o usuário como membro da campanha com papel **player**.",
            security: sec,
            request: { params: standaloneInvitationIdParamSchema },
            responses: {
                200: okMessageResponse,
                400: badRequestResponse,
                401: unauthorizedResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId)
                return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const { invitationId } = c.req.valid("param");
            await invitationServiceFactory(c.env).acceptInvitation(Number(invitationId), userId);
            return c.json({ success: true as const, data: { message: "Invitation accepted" } } as any, 200);
        },
    );

    // POST /:invitationId/decline — recusar convite
    routes.openapi(
        createRoute({
            method: "post",
            path: "/:invitationId/decline",
            tags: ["Convites"],
            summary: "Recusar convite",
            security: sec,
            request: { params: standaloneInvitationIdParamSchema },
            responses: {
                200: okMessageResponse,
                400: badRequestResponse,
                401: unauthorizedResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId)
                return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const { invitationId } = c.req.valid("param");
            await invitationServiceFactory(c.env).declineInvitation(Number(invitationId), userId);
            return c.json({ success: true as const, data: { message: "Invitation declined" } } as any, 200);
        },
    );

    return routes;
}
