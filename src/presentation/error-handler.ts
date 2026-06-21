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

	// Violação de FK do D1/SQLite é erro de input do cliente (ex.: job_id
	// inexistente), não falha de infraestrutura — traduzido aqui de forma
	// centralizada porque a maioria dos repositórios só trata UNIQUE
	// constraint, não FOREIGN KEY, e replicar esse catch em cada um seria
	// repetitivo. Loga a mensagem original para diagnóstico, mas não a
	// expõe ao cliente.
	if (error.message.includes("FOREIGN KEY constraint failed")) {
		console.error({ requestId, error: error.message, stack: error.stack });

		return c.json(
			{
				success: false,
				error: {
					code: "BAD_REQUEST",
					message: "Referência inválida: um dos IDs informados não existe.",
				},
			},
			400,
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