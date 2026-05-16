import { describe, expect, it } from "vitest";
import app from "../src/index";

describe("API status", () => {
	it("should return API running message", async () => {
		const response = await app.request("/");

		expect(response.status).toBe(200);

		const body = await response.json();

		expect(body).toEqual({
			success: true,
			data: {
				message: "API is running",
			},
		});
	});
});