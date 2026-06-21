/**
 * Log estruturado para negações de autorização entre tenants/usuários
 * (campaignMemberMiddleware, pcOwnerMiddleware, IDOR de edição de PC).
 * Sem isso, uma tentativa de scanning (ex.: variar pcId sequencialmente
 * tentando encontrar um PC de outra campanha) não deixa nenhum rastro.
 * Não usado para 401 genérico (senha errada) — só para 403/cross-tenant.
 */
export function logAuthorizationDenied(requestId: string | undefined, context: Record<string, unknown>): void {
    console.warn({ requestId, event: "authorization_denied", ...context });
}
