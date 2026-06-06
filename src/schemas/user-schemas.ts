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
    email: z.string().email(),
    name: z.string().min(1),
    nickname: z.string().min(1),
    img_key: z.string().nullable().optional().default(null),
    password: z.string().min(8, "Password must be at least 8 characters"),
    is_super_user: z.boolean().default(false),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const authResultSchema = successResponseSchema(z.object({
    token: z.string(),
    user: userSchema,
}));

export const userListResponse = successResponseSchema(z.array(userSchema));
