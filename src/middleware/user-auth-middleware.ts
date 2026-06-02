import type { MiddlewareHandler } from "hono";
import { D1UserRepository } from "../infrastructure/repository/d1-user-repository";
import { verifyJwt } from "../utils/jwt";
import { unauthorized } from "../presentation/http";
import type { Env, Variables } from "../types/env";

export const userAuthMiddleware: MiddlewareHandler<{
    Bindings: Env;
    Variables: Variables;
}> = async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        return unauthorized(c, "Authentication required");
    }

    const token = authHeader.slice(7);
    const payload = await verifyJwt(token, c.env.JWT_SECRET);

    if (!payload) {
        return unauthorized(c, "Invalid or expired token");
    }

    // Confirma que o usuário ainda existe no banco
    const userRepo = new D1UserRepository(c.env.fabula_ultima_db);
    const user = await userRepo.findById(String(payload.sub));

    if (!user) {
        return unauthorized(c, "User not found");
    }

    c.set("userId", user.id);
    c.set("userEmail", user.email);
    c.set("isSuperUser", user.is_super_user);

    await next();
};
