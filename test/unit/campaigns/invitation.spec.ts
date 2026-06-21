import { describe, expect, it } from "vitest";
import { isInvitationExpired } from "../../../src/domain/campaigns/invitation";

describe("isInvitationExpired", () => {
	it("retorna false quando expires_at é null (convites antigos, sem TTL retroativo)", () => {
		expect(isInvitationExpired({ expires_at: null })).toBe(false);
	});

	it("retorna false quando expires_at está no futuro", () => {
		const now = new Date("2026-06-20T12:00:00Z");
		expect(isInvitationExpired({ expires_at: "2026-06-27 12:00:00" }, now)).toBe(false);
	});

	it("retorna true quando expires_at já passou", () => {
		const now = new Date("2026-06-20T12:00:00Z");
		expect(isInvitationExpired({ expires_at: "2026-06-13 12:00:00" }, now)).toBe(true);
	});

	it("interpreta expires_at (formato SQLite, sem timezone) como UTC, não horário local", () => {
		// Se fosse interpretado como horário local (ex.: UTC-3), esta data "no
		// futuro em UTC" poderia cair no passado e o teste anterior mascararia o bug.
		const now = new Date("2026-06-20T12:00:00Z");
		expect(isInvitationExpired({ expires_at: "2026-06-20 12:00:01" }, now)).toBe(false);
		expect(isInvitationExpired({ expires_at: "2026-06-20 11:59:59" }, now)).toBe(true);
	});
});
