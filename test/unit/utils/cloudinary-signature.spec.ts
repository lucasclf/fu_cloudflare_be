import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildCloudinarySignature } from "../../../src/utils/cloudinary-signature";

function expectedSignature(params: Record<string, string | number>, apiSecret: string): string {
	const paramsToSign = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join("&");

	return createHash("sha1").update(`${paramsToSign}${apiSecret}`).digest("hex");
}

describe("buildCloudinarySignature", () => {
	it("gera o mesmo digest SHA-1 que uma implementação de referência independente", async () => {
		const params = { timestamp: 1315060510, public_id: "sample_image" };
		const apiSecret = "abcd1234";

		const signature = await buildCloudinarySignature(params, apiSecret);

		expect(signature).toBe(expectedSignature(params, apiSecret));
		expect(signature).toMatch(/^[0-9a-f]{40}$/);
	});

	it("ignora a ordem em que as chaves são passadas (sempre ordena alfabeticamente)", async () => {
		const apiSecret = "secret";

		const signatureA = await buildCloudinarySignature(
			{ folder: "fu-wiki/campaigns/1/npc", timestamp: 100, upload_preset: "preset" },
			apiSecret,
		);
		const signatureB = await buildCloudinarySignature(
			{ upload_preset: "preset", timestamp: 100, folder: "fu-wiki/campaigns/1/npc" },
			apiSecret,
		);

		expect(signatureA).toBe(signatureB);
	});

	it("gera assinaturas diferentes para api secrets diferentes", async () => {
		const params = { timestamp: 100 };

		const signatureA = await buildCloudinarySignature(params, "secret-a");
		const signatureB = await buildCloudinarySignature(params, "secret-b");

		expect(signatureA).not.toBe(signatureB);
	});
});
