import { z } from "zod";

export const sessionSchema = z.object({
    id: z.number(),
    campaign_id: z.number(),
    session_number: z.number(),
    title: z.string().nullable(),
    summary: z.string(),
    notes: z.string().nullable(),
    played_at: z.string(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const createCampaignSessionSchema = z.object({
    session_number: z.number().int().min(0),
    title: z.string().nullable().optional().default(null),
    summary: z.string().min(1),
    notes: z.string().nullable().optional().default(null),
    played_at: z.string().min(1),
});
