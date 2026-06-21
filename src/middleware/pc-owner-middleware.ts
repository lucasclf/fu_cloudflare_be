import type { MiddlewareHandler } from "hono";
import { D1PCRepository } from "../infrastructure/repository/d1-pc-repository";
import type { Env, Variables } from "../types/env";
import { logAuthorizationDenied } from "../utils/security-log";

export const pcOwnerMiddleware: MiddlewareHandler<{
    Bindings: Env;
    Variables: Variables;
}> = async (c, next) => {
    const userId = c.get("userId");
    const isSuperUser = c.get("isSuperUser");

    if (userId === undefined) {
        return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
    }

    if (isSuperUser) {
        await next();
        return;
    }

    const match = c.req.path.match(/\/pcs\/(\d+)/);
    if (!match) {
        return c.json({ success: false, error: { code: "BAD_REQUEST", message: "Missing pcId in path" } }, 400);
    }

    const pcId = Number(match[1]);
    const pcRepo = new D1PCRepository(c.env.fabula_ultima_db);
    const pc = await pcRepo.findById(String(pcId));

    if (!pc) {
        return c.json({ success: false, error: { code: "NOT_FOUND", message: "PC not found" } }, 404);
    }

    if (pc.user_id !== userId) {
        logAuthorizationDenied(c.get("requestId"), { userId, pcId, reason: "not_pc_owner" });
        return c.json({ success: false, error: { code: "FORBIDDEN", message: "You can only modify your own PC" } }, 403);
    }

    await next();
};
