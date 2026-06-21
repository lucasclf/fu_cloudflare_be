import { describe, expect, it, vi } from "vitest";
import { logAuthorizationDenied } from "../../../src/utils/security-log";

describe("logAuthorizationDenied", () => {
	it("loga um warning estruturado com requestId, evento e contexto fornecido", () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		logAuthorizationDenied("req-123", { userId: 7, campaignId: 2, reason: "not_a_member" });

		expect(warnSpy).toHaveBeenCalledWith({
			requestId: "req-123",
			event: "authorization_denied",
			userId: 7,
			campaignId: 2,
			reason: "not_a_member",
		});

		warnSpy.mockRestore();
	});
});
