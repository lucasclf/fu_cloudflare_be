import { z } from "zod";
import { successResponseSchema } from "./common";

export const sessionSchema = z.object({
    id: z.number(),
    session_number: z.number(),
    title: z.string().nullable(),
    summary: z.string(),
    notes: z.string().nullable(),
    played_at: z.string(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const createSessionSchema = z.object({
    session_number: z.number().int().positive(),
    title: z.string().nullable().optional().default(null),
    summary: z.string().min(1),
    notes: z.string().nullable().optional().default(null),
    played_at: z.string().min(1),
});

export const updateSessionSchema = z.object({
    title: z.string().nullable().optional().default(null),
    summary: z.string().min(1),
    notes: z.string().nullable().optional().default(null),
    played_at: z.string().min(1),
});

export const sessionParamSchema = z.object({
    sessionNumber: z.string().regex(/^\d+$/, "sessionNumber must be a positive integer"),
});

export const sessionListResponse = successResponseSchema(z.array(sessionSchema));
export const sessionResponse = successResponseSchema(sessionSchema);
