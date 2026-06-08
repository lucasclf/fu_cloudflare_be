import type { CookieOptions } from "hono/utils/cookie";
import type { Env } from "../types/env";
import { EXPIRY_SECONDS } from "./jwt";

const DEFAULT_COOKIE_NAME = "token";
const DEFAULT_SAME_SITE: NonNullable<CookieOptions["sameSite"]> = "Lax";

export type AuthCookieConfig = {
    enabled: boolean;
    name: string;
    options: CookieOptions;
};

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined || value.trim() === "") return defaultValue;
    return value.trim().toLowerCase() === "true";
}

function parseSameSite(value: string | undefined): NonNullable<CookieOptions["sameSite"]> {
    switch (value?.trim().toLowerCase()) {
        case "strict":
            return "Strict";
        case "lax":
            return "Lax";
        case "none":
            return "None";
        default:
            return DEFAULT_SAME_SITE;
    }
}

function parseMaxAge(value: string | undefined): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : EXPIRY_SECONDS;
}

/**
 * Centraliza a configuração do cookie de sessão a partir das variáveis de
 * ambiente. Login, logout e middleware devem usar esta mesma função: o
 * navegador só substitui/remove um cookie quando Domain, Path, SameSite e
 * Secure coincidem exatamente entre criação e remoção.
 *
 * Desabilitado por padrão (AUTH_COOKIE_ENABLED ausente) — o cookie é um modo
 * de autenticação complementar ao Authorization: Bearer, não um substituto.
 */
export function getAuthCookieConfig(env: Env): AuthCookieConfig {
    const sameSite = parseSameSite(env.AUTH_COOKIE_SAMESITE);

    return {
        enabled: parseBoolean(env.AUTH_COOKIE_ENABLED, false),
        name: env.AUTH_COOKIE_NAME?.trim() || DEFAULT_COOKIE_NAME,
        options: {
            httpOnly: true,
            secure: parseBoolean(env.AUTH_COOKIE_SECURE, true),
            sameSite,
            path: "/",
            domain: env.AUTH_COOKIE_DOMAIN?.trim() || undefined,
            maxAge: parseMaxAge(env.AUTH_COOKIE_MAX_AGE),
        },
    };
}
