import type { Context } from "hono";
import { AppError } from "../domain/app-error";

export function handleAppError(error: Error, c: Context): Response {
	if (error instanceof AppError) {
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

	console.error(error);

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