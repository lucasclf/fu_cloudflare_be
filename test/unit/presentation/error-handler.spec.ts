import { describe, expect, it, vi } from "vitest";
import { handleAppError } from "../../../src/presentation/error-handler";
import { BadRequestError } from "../../../src/domain/app-error";

function fakeContext() {
	return {
		get: () => "req-1",
		json: (body: unknown, status: number) => new Response(JSON.stringify(body), { status }),
	} as any;
}

describe("handleAppError", () => {
	it("traduz violação de FOREIGN KEY do D1 para 400 BAD_REQUEST sem expor a mensagem original do SQLite", async () => {
		const error = new Error("D1_ERROR: FOREIGN KEY constraint failed: SQLITE_CONSTRAINT");
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const res = handleAppError(error, fakeContext());
		const body = await res.json();

		expect(res.status).toBe(400);
		expect(body).toEqual({
			success: false,
			error: { code: "BAD_REQUEST", message: "Referência inválida: um dos IDs informados não existe." },
		});
		expect(JSON.stringify(body)).not.toContain("SQLITE_CONSTRAINT");
		consoleSpy.mockRestore();
	});

	it("mantém o comportamento de AppError conhecido (ex.: BadRequestError) intacto", async () => {
		const res = handleAppError(new BadRequestError("Nome obrigatório"), fakeContext());
		const body = await res.json();

		expect(res.status).toBe(400);
		expect(body).toEqual({ success: false, error: { code: "BAD_REQUEST", message: "Nome obrigatório" } });
	});

	it("retorna 500 INTERNAL_ERROR genérico para erros inesperados não relacionados a FK", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const res = handleAppError(new Error("algo inesperado"), fakeContext());
		const body = await res.json();

		expect(res.status).toBe(500);
		expect(body).toEqual({ success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
		consoleSpy.mockRestore();
	});
});
