// Gestão de membros movida para /v1/campaigns/:id/members (JWT, master only).
// Este arquivo foi esvaziado intencionalmente.

import { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "../../../types/env";

export function createAdminCampaignMemberRoutes(_factory: unknown) {
    return new OpenAPIHono<{ Bindings: Env }>();
}
