export type JwtPayload = {
    sub: number;
    email: string;
    is_super_user: boolean;
    iat: number;
    exp: number;
};

const EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 dias

function toBase64Url(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

function fromBase64Url(str: string): Uint8Array {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function encodeJson(obj: object): string {
    return toBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
    );
}

const HEADER = encodeJson({ alg: "HS256", typ: "JWT" });

export async function signJwt(
    payload: Omit<JwtPayload, "iat" | "exp">,
    secret: string,
): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const full: JwtPayload = { ...payload, iat: now, exp: now + EXPIRY_SECONDS };
    const body = `${HEADER}.${encodeJson(full)}`;
    const key = await getHmacKey(secret);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyJwt(
    token: string,
    secret: string,
): Promise<JwtPayload | null> {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const key = await getHmacKey(secret);
    const body = `${parts[0]}.${parts[1]}`;
    const signature = fromBase64Url(parts[2]);

    const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        signature,
        new TextEncoder().encode(body),
    );

    if (!valid) return null;

    let payload: JwtPayload;
    try {
        payload = JSON.parse(
            new TextDecoder().decode(fromBase64Url(parts[1])),
        ) as JwtPayload;
    } catch {
        return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
}
