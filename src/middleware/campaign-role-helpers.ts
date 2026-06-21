export function isMaster(c: { get(key: string): unknown }): boolean {
    const role = c.get("campaignRole") as string | undefined;
    return role === "master" || role === "super_user";
}

export function forbidIfNotMaster(c: { get(key: string): unknown; json: (body: unknown, status: number) => Response }): Response | null {
    if (!isMaster(c)) return c.json({ success: false, error: { code: "FORBIDDEN", message: "Master role required" } }, 403);
    return null;
}
