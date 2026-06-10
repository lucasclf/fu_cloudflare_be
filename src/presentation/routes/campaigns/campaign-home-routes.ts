import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import type { CampaignService } from "../../../application/campaign-service";
import type { CampaignMemberService } from "../../../application/campaign-member-service";
import type { CampaignReadService } from "../../../application/campaign-read-service";
import type { CampaignInvitationService } from "../../../application/campaign-invitation-service";
import type { PCService } from "../../../application/pc-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import {
    campaignIdParamSchema,
    campaignHomeResponse,
    updateCampaignNotesSchema,
} from "../../../schemas/campaign-schemas";
import { forbiddenResponse, notFoundResponse, okMessageResponse, unauthorizedResponse } from "../../../schemas/common";

type CampaignServiceFactory   = (env: Env) => CampaignService;
type MemberServiceFactory     = (env: Env) => CampaignMemberService;
type ReadServiceFactory       = (env: Env) => CampaignReadService;
type InvitationServiceFactory = (env: Env) => CampaignInvitationService;
type PcServiceFactory         = (env: Env) => PCService;

function isMaster(c: { get(key: string): unknown }): boolean {
    const role = c.get("campaignRole") as string | undefined;
    return role === "master" || role === "super_user";
}

export function createCampaignHomeRoutes(
    campaignServiceFactory: CampaignServiceFactory,
    memberServiceFactory: MemberServiceFactory,
    readServiceFactory: ReadServiceFactory,
    invitationServiceFactory: InvitationServiceFactory,
    pcServiceFactory: PcServiceFactory,
) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    const sec = [{ userToken: [] }];

    // GET /:campaignId/home — dados resumidos da campanha
    routes.openapi(
        createRoute({
            method: "get",
            path: "/:campaignId/home",
            tags: ["Campanhas"],
            summary: "Home da campanha",
            description: "Retorna dados resumidos da campanha adaptados ao papel do usuário (mestre ou jogador).",
            security: sec,
            request: { params: campaignIdParamSchema },
            responses: {
                200: { content: { "application/json": { schema: campaignHomeResponse } }, description: "Home da campanha" },
                401: unauthorizedResponse,
                403: forbiddenResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const { campaignId } = c.req.valid("param");
            const id = Number(campaignId);
            const role = c.get("campaignRole") ?? "player";

            const campaignSvc = campaignServiceFactory(c.env);
            const memberSvc   = memberServiceFactory(c.env);
            const readSvc     = readServiceFactory(c.env);

            const campaign = await campaignSvc.getCampaignById(campaignId);
            const members  = await memberSvc.listMembersWithNicknames(id);

            if (role === "master" || role === "super_user") {
                const invitationSvc = invitationServiceFactory(c.env);
                const [stats, sessions, allInvitations] = await Promise.all([
                    readSvc.getHomeStats(id),
                    readSvc.listSessions(id, role),
                    invitationSvc.listCampaignInvitations(id),
                ]);

                const recentSessions = sessions.slice(0, 3).map((s) => ({
                    id: s.id,
                    session_number: s.session_number,
                    title: s.title,
                    played_at: s.played_at,
                }));

                const pendingInvitations = allInvitations
                    .filter((i) => i.status === "pending")
                    .map((i) => ({
                        id:               i.id,
                        invitee_id:       i.invitee_id,
                        invitee_nickname: i.invitee_nickname,
                        created_at:       i.created_at,
                    }));

                return c.json({
                    success: true as const,
                    data: {
                        role: "master" as const,
                        campaign,
                        stats,
                        members,
                        recentSessions,
                        pendingInvitations,
                    },
                } as any, 200);
            }

            // player view
            const pcSvc = pcServiceFactory(c.env);
            const [sessions, pcSummaries] = await Promise.all([
                readSvc.listSessions(id, "player"),
                readSvc.listPcs(id, "player", userId),
            ]);

            const myPcsFullSettled = await Promise.allSettled(
                pcSummaries.map((pc) => pcSvc.findById(String(pc.id))),
            );

            const myPcs = myPcsFullSettled
                .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<PCService["findById"]>>>> =>
                    r.status === "fulfilled" && r.value !== null,
                )
                .map((r) => {
                    const pc = r.value!;
                    return {
                        id:            pc.id,
                        name:          pc.name,
                        tagline:       pc.tagline ?? null,
                        img_key:       pc.img_key ?? null,
                        level:         pc.stats.level,
                        hp:            pc.stats.hp,
                        mp:            pc.stats.mp,
                        initiative:    pc.stats.initiative,
                        ip:            pc.stats.ip,
                        defense:       pc.stats.defense,
                        magic_defense: pc.stats.magic_defense,
                        jobs:          (pc.jobs ?? []).map((j) => ({ name: j.name, level: j.level })),
                    };
                });

            const master = members.find((m) => m.role === "master");
            const recentSessions = sessions.slice(0, 3).map((s) => ({
                id: s.id,
                session_number: s.session_number,
                title: s.title,
                played_at: s.played_at,
            }));

            // omit master_notes for player
            const { master_notes: _notes, ...campaignForPlayer } = campaign;

            return c.json({
                success: true as const,
                data: {
                    role:           "player" as const,
                    campaign:       campaignForPlayer,
                    masterNickname: master?.nickname ?? "",
                    memberCount:    members.length,
                    myPcs,
                    recentSessions,
                },
            } as any, 200);
        },
    );

    // PATCH /:campaignId/notes — atualizar notas/status (master only)
    routes.openapi(
        createRoute({
            method: "patch",
            path: "/:campaignId/notes",
            tags: ["Campanhas"],
            summary: "Atualizar notas do mestre",
            description: "Atualiza as notas privadas e/ou o status da campanha. Apenas o mestre pode executar esta ação.",
            security: sec,
            request: {
                params: campaignIdParamSchema,
                body: { content: { "application/json": { schema: updateCampaignNotesSchema } } },
            },
            responses: {
                200: okMessageResponse,
                401: unauthorizedResponse,
                403: forbiddenResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            if (!isMaster(c))
                return c.json({ success: false as const, error: { code: "FORBIDDEN", message: "Master role required" } }, 403) as any;

            const { campaignId } = c.req.valid("param");
            const body = c.req.valid("json");
            await campaignServiceFactory(c.env).updateCampaignNotes(campaignId, body);
            return c.json({ success: true as const, data: { message: "Notes updated" } } as any, 200);
        },
    );

    return routes;
}
