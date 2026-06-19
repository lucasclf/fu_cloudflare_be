function toHex(bytes: ArrayBuffer): string {
	return Array.from(new Uint8Array(bytes))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Assinatura de upload do Cloudinary: SHA-1 hexadecimal dos parâmetros
 * ordenados alfabeticamente (formato `key=value&key=value`) concatenados
 * direto com o API secret (sem separador) — não é HMAC, é o algoritmo
 * específico do Cloudinary.
 * https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
 */
export async function buildCloudinarySignature(
	params: Record<string, string | number>,
	apiSecret: string,
): Promise<string> {
	const paramsToSign = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join("&");

	const toSign = `${paramsToSign}${apiSecret}`;
	const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(toSign));

	return toHex(digest);
}
