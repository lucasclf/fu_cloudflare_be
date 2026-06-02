import { z } from "zod";

// ─── Tipos base ───────────────────────────────────────────────────────────────

export const attributeDieSchema = z.enum(["d6", "d8", "d10", "d12"]);

export const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, "id must be a positive integer"),
});

// ─── Envelope de resposta ─────────────────────────────────────────────────────

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.literal(true),
        data: dataSchema,
    });

export const errorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
    }),
});

export const messageResponseSchema = successResponseSchema(
    z.object({ message: z.string() }),
);

// ─── Respostas padrão reutilizáveis ──────────────────────────────────────────

export const badRequestResponse = {
    content: { "application/json": { schema: errorResponseSchema } },
    description: "Requisição inválida",
};

export const unauthorizedResponse = {
    content: { "application/json": { schema: errorResponseSchema } },
    description: "Não autorizado",
};

export const forbiddenResponse = {
    content: { "application/json": { schema: errorResponseSchema } },
    description: "Sem permissão",
};

export const notFoundResponse = {
    content: { "application/json": { schema: errorResponseSchema } },
    description: "Não encontrado",
};

export const conflictResponse = {
    content: { "application/json": { schema: errorResponseSchema } },
    description: "Conflito — recurso já existe",
};

export const noContentResponse = {
    description: "Sem conteúdo",
};

export const createdResponse = {
    content: {
        "application/json": { schema: messageResponseSchema },
    },
    description: "Criado com sucesso",
};

export const okMessageResponse = {
    content: {
        "application/json": { schema: messageResponseSchema },
    },
    description: "Operação realizada com sucesso",
};
