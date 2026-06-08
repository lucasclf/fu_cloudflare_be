import { z } from "zod";
import { successResponseSchema } from "./common";

export const userSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string(),
    nickname: z.string(),
    img_key: z.string().nullable(),
    is_super_user: z.boolean(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const createUserSchema = z.object({
    email: z.string().email("E-mail inválido."),
    name: z.string().min(1),
    nickname: z.string().min(1),
    img_key: z.string().nullable().optional().default(null),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    is_super_user: z.boolean().default(false),
});

// Cadastro público: mesmos campos de createUserSchema, exceto is_super_user e
// img_key — um usuário comum nunca pode se autopromover nem definir avatar no
// cadastro (is_super_user é sempre forçado para false em UserService.register).
export const registerUserSchema = createUserSchema.omit({
    is_super_user: true,
    img_key: true,
});

export const loginSchema = z.object({
    email: z.string().email("E-mail inválido."),
    password: z.string().min(1),
});

export const authResultSchema = successResponseSchema(z.object({
    token: z.string(),
    user: userSchema,
}));

export const userListResponse = successResponseSchema(z.array(userSchema));
