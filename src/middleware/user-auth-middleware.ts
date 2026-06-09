import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { D1UserRepository } from "../infrastructure/repository/d1-user-repository";
import { verifyJwt } from "../utils/jwt";
import { unauthorized } from "../presentation/http";
import { getAuthCookieConfig } from "../utils/auth-cookie";
import type { Env, Variables } from "../types/env";

export const userAuthMiddleware: MiddlewareHandler<{
    Bindings: Env;
    Variables: Variables;
}> = async (c, next) => {
    const authHeader = c.req.header("Authorization");

    // Ordem de precedência: 1) Authorization: Bearer; 2) cookie de sessão
    // (somente se AUTH_COOKIE_ENABLED) — nunca outras fontes (query string etc.).
    let token: string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
    } else if (!authHeader) {
        const cookieConfig = getAuthCookieConfig(c.env);
        if (cookieConfig.enabled) {
            token = getCookie(c, cookieConfig.name);
        }
    }

    if (!token) {
        return unauthorized(c, "Authentication required");
    }

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
    c.set("currentUser", user);

    await next();
};
