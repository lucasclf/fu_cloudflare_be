import type { Context } from "hono";
import { AppError } from "../domain/app-error";
import type { Env, Variables } from "../types/env";

type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

export function handleAppError(error: Error, c: AppContext): Response {
	const requestId = c.get("requestId");

	if (error instanceof AppError) {
		if (error.status >= 500) {
			console.error({ requestId, code: error.code, message: error.message });
		}

		return c.json(
			{
				success: false,
				error: {
					code: error.code,
					message: error.message,
				},
			},
			error.status,
		);
	}

	console.error({
		requestId,
		error: error.message,
		stack: error.stack,
	});

	return c.json(
		{
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "Internal server error",
			},
		},
		500,
	);
}