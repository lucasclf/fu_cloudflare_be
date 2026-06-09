import { z } from "zod";
import { successResponseSchema } from "./common";
import { CAMPAIGN_ROLES } from "../domain/campaigns/campaign-member";
import { ENTITY_TYPES } from "../domain/campaigns/campaign-entity";
import { INVITATION_STATUSES } from "../domain/campaigns/invitation";

// ─── Campaign ─────────────────────────────────────────────────────────────────

export const campaignSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    img_key: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const createCampaignSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional().default(null),
    img_key: z.string().nullable().optional().default(null),
});

export const campaignIdParamSchema = z.object({
    campaignId: z.string().regex(/^\d+$/, "campaignId must be a positive integer"),
});

export const campaignListResponse = successResponseSchema(z.array(campaignSchema));
export const campaignResponse = successResponseSchema(campaignSchema);

export const userCampaignSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    img_key: z.string().nullable(),
    role: z.enum(CAMPAIGN_ROLES),
    joined_at: z.string(),
});

export const userCampaignListResponse = successResponseSchema(z.array(userCampaignSummarySchema));

// ─── Members ──────────────────────────────────────────────────────────────────

export const campaignRoleSchema = z.enum(CAMPAIGN_ROLES);

export const campaignMemberSchema = z.object({
    id: z.number(),
    campaign_id: z.number(),
    user_id: z.number(),
    role: campaignRoleSchema,
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const addMemberSchema = z.object({
    user_id: z.number().int().positive(),
    role: campaignRoleSchema,
});

export const updateMemberRoleSchema = z.object({
    role: campaignRoleSchema,
});

export const memberUserIdParamSchema = campaignIdParamSchema.extend({
    userId: z.string().regex(/^\d+$/, "userId must be a positive integer"),
});

export const memberListResponse = successResponseSchema(z.array(campaignMemberSchema));

// ─── Entities ─────────────────────────────────────────────────────────────────

export const entityTypeSchema = z.enum(ENTITY_TYPES);

export const campaignEntitySchema = z.object({
    id: z.number(),
    campaign_id: z.number(),
    entity_type: entityTypeSchema,
    entity_id: z.number(),
    visible_to_players: z.boolean(),
    created_at: z.string(),
});

export const linkEntitySchema = z.object({
    entity_type: entityTypeSchema,
    entity_id: z.number().int().positive(),
    visible_to_players: z.boolean().default(true),
});

export const entityParamSchema = campaignIdParamSchema.extend({
    entityType: z.string(),
    entityId: z.string().regex(/^\d+$/, "entityId must be a positive integer"),
});

export const updateVisibilitySchema = z.object({
    visible_to_players: z.boolean(),
});

export const entityListResponse = successResponseSchema(z.array(campaignEntitySchema));

// ─── Campaign PCs ──────────────────────────────────────────────────────────────

export const campaignPcSchema = z.object({
    campaign_id: z.number(),
    pc_id: z.number(),
    visible_to_players: z.boolean(),
    created_at: z.string(),
});

export const linkPcSchema = z.object({
    pc_id: z.number().int().positive(),
    visible_to_players: z.boolean().default(true),
});

export const updateCampaignPcSchema = z.object({
    visible_to_players: z.boolean(),
});

export const pcParamSchema = campaignIdParamSchema.extend({
    pcId: z.string().regex(/^\d+$/, "pcId must be a positive integer"),
});

export const campaignPcListResponse = successResponseSchema(z.array(campaignPcSchema));

// ─── Invitations ──────────────────────────────────────────────────────────────

export const invitationStatusSchema = z.enum(INVITATION_STATUSES);

export const sendInvitationSchema = z
    .object({
        invitee_email:    z.string().email().optional(),
        invitee_nickname: z.string().min(1).optional(),
    })
    .refine(
        (d) => d.invitee_email !== undefined || d.invitee_nickname !== undefined,
        { message: "Informe invitee_email ou invitee_nickname" },
    );

export const invitationWithInviteeSchema = z.object({
    id:               z.number(),
    campaign_id:      z.number(),
    invitee_id:       z.number(),
    invitee_name:     z.string(),
    invitee_nickname: z.string(),
    status:           invitationStatusSchema,
    created_at:       z.string(),
    updated_at:       z.string().nullable(),
});

export const invitationSummarySchema = z.object({
    id:               z.number(),
    status:           invitationStatusSchema,
    campaign_id:      z.number(),
    campaign_name:    z.string(),
    inviter_name:     z.string(),
    inviter_nickname: z.string(),
    created_at:       z.string(),
});

export const invitationIdParamSchema = campaignIdParamSchema.extend({
    invitationId: z.string().regex(/^\d+$/, "invitationId must be a positive integer"),
});

export const standaloneInvitationIdParamSchema = z.object({
    invitationId: z.string().regex(/^\d+$/, "invitationId must be a positive integer"),
});

export const campaignInvitationListResponse  = successResponseSchema(z.array(invitationWithInviteeSchema));
export const invitationSummaryListResponse   = successResponseSchema(z.array(invitationSummarySchema));
