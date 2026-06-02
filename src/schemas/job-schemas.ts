import { z } from "zod";
import { successResponseSchema } from "./common";

const jobBooleans = {
    allows_martial_armor: z.boolean().default(false),
    allows_martial_shield: z.boolean().default(false),
    allows_martial_ranged_weapon: z.boolean().default(false),
    allows_martial_melee_weapon: z.boolean().default(false),
    allows_arcane: z.boolean().default(false),
    allows_rituals: z.boolean().default(false),
    allows_monster_spells: z.boolean().default(false),
    can_start_projects: z.boolean().default(false),
    can_cooking: z.boolean().default(false),
};

export const resumeJobSchema = z.object({
    id: z.number(),
    name: z.string(),
    tagline: z.string(),
    img_key: z.string().nullable(),
    hp_bonus: z.number(),
    mp_bonus: z.number(),
    ip_bonus: z.number(),
    ...jobBooleans,
});

export const jobSchema = resumeJobSchema.extend({
    description: z.string(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const jobPowerSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    type: z.enum(["common", "heroic"]),
    max_level: z.number(),
    is_global: z.boolean(),
});

export const arcanaSchema = z.object({
    id: z.number(),
    name: z.string(),
    domain: z.string(),
    merge_effect: z.string().nullable(),
    dismiss_effect: z.string().nullable(),
    special_rule: z.string().nullable(),
});

export const jobFullSchema = jobSchema.extend({
    questions: z.array(z.object({ id: z.number(), question: z.string(), sort_order: z.number() })).optional(),
    aliases: z.array(z.object({ id: z.number(), alias: z.string() })).optional(),
    powers: z.array(jobPowerSchema).optional(),
    spells: z.array(z.object({ id: z.number(), name: z.string(), description: z.string() }).passthrough()).optional(),
    arcanas: z.array(arcanaSchema).optional(),
});

export const createJobSchema = z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    description: z.string().min(1),
    img_key: z.string().nullable().optional().default(null),
    hp_bonus: z.number().int().default(0),
    mp_bonus: z.number().int().default(0),
    ip_bonus: z.number().int().default(0),
    ...jobBooleans,
});

export const createJobQuestionSchema = z.object({
    job_id: z.number().int().positive(),
    question: z.string().min(1),
    sort_order: z.number().int().min(0),
});

export const createJobAliasSchema = z.object({
    job_id: z.number().int().positive(),
    alias: z.string().min(1),
});

export const createJobPowerSchema = z.object({
    job_id: z.array(z.number().int().positive()).min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(["common", "heroic"]),
    max_level: z.number().int().min(0),
    is_global: z.boolean().default(false),
});

export const jobIncludeQuerySchema = z.object({
    include: z.string().optional(),
});

export const jobJobIdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, "id must be a positive integer"),
});

export const jobListResponse = successResponseSchema(z.array(z.union([jobSchema, jobFullSchema])));
export const jobCatalogResponse = successResponseSchema(z.array(resumeJobSchema));
export const jobResponse = successResponseSchema(z.union([jobSchema, jobFullSchema]));
