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

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
    );

    const hashBits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
        keyMaterial,
        256,
    );

    return `pbkdf2:100000:${toBase64Url(salt)}:${toBase64Url(new Uint8Array(hashBits))}`;
}

/**
 * Verifica uma senha contra o hash armazenado.
 * Usa comparação em tempo constante para evitar timing attacks.
 */
export async function verifyPassword(
    password: string,
    stored: string,
): Promise<boolean> {
    const parts = stored.split(":");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;

    const iterations = Number(parts[1]);
    const salt = fromBase64Url(parts[2]);
    const expectedHash = fromBase64Url(parts[3]);

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
    );

    const hashBits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
        keyMaterial,
        256,
    );

    const hash = new Uint8Array(hashBits);

    if (hash.length !== expectedHash.length) return false;

    let diff = 0;
    for (let i = 0; i < hash.length; i++) {
        diff |= hash[i] ^ expectedHash[i];
    }

    return diff === 0;
}
