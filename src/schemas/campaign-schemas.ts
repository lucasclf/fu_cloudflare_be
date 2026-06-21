import { z } from "zod";
import { successResponseSchema } from "./common";
import { CAMPAIGN_ROLES } from "../domain/campaigns/campaign-member";
import { CAMPAIGN_STATUSES } from "../domain/campaigns/campaign";
import { ENTITY_TYPES } from "../domain/campaigns/campaign-entity";
import { INVITATION_STATUSES } from "../domain/campaigns/invitation";

// ─── Campaign ─────────────────────────────────────────────────────────────────

export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES);

export const campaignSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    img_key: z.string().nullable(),
    status: campaignStatusSchema,
    master_notes: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const updateCampaignNotesSchema = z.object({
    master_notes: z.string().nullable(),
    status: campaignStatusSchema.optional(),
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

export const visibilityFieldSchema = z.object({
    visible_to_players: z.boolean().optional().default(false),
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
    expires_at:       z.string().nullable(),
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

// ─── Campaign Home ─────────────────────────────────────────────────────────────

export const memberWithNicknameSchema = z.object({
    user_id: z.number(),
    role:    z.enum(CAMPAIGN_ROLES),
    nickname: z.string(),
    pc_id:   z.number().nullable(),
    pc_name: z.string().nullable(),
});

export const campaignHomeStatsSchema = z.object({
    memberCount:   z.number(),
    sessionCount:  z.number(),
    npcCount:      z.number(),
    locationCount: z.number(),
    factionCount:  z.number(),
    monsterCount:  z.number(),
    pcCount:       z.number(),
});

export const recentSessionSchema = z.object({
    id:             z.number(),
    session_number: z.number(),
    title:          z.string().nullable(),
    played_at:      z.string(),
});

export const pcHomeStatsSchema = z.object({
    id:            z.number(),
    name:          z.string(),
    tagline:       z.string().nullable(),
    img_key:       z.string().nullable(),
    level:         z.number(),
    hp:            z.number(),
    mp:            z.number(),
    initiative:    z.number(),
    ip:            z.number(),
    defense:       z.number(),
    magic_defense: z.number(),
    jobs: z.array(z.object({ name: z.string(), level: z.number() })),
});

export const pendingInvitationSchema = z.object({
    id:               z.number(),
    invitee_id:       z.number(),
    invitee_nickname: z.string(),
    created_at:       z.string(),
});

export const campaignHomeMasterSchema = z.object({
    role:                z.literal("master"),
    campaign:            campaignSchema,
    stats:               campaignHomeStatsSchema,
    members:             z.array(memberWithNicknameSchema),
    recentSessions:      z.array(recentSessionSchema),
    pendingInvitations:  z.array(pendingInvitationSchema),
});

export const campaignHomePlayerSchema = z.object({
    role:           z.literal("player"),
    campaign:       campaignSchema.omit({ master_notes: true }),
    masterNickname: z.string(),
    memberCount:    z.number(),
    myPcs:          z.array(pcHomeStatsSchema),
    recentSessions: z.array(recentSessionSchema),
});

export const campaignHomeResponse = successResponseSchema(
    z.discriminatedUnion("role", [campaignHomeMasterSchema, campaignHomePlayerSchema]),
);

// ─── User Search ───────────────────────────────────────────────────────────────

export const userSearchQuerySchema = z.object({
    q:          z.string().min(2, "Query must have at least 2 characters"),
    campaignId: z.string().regex(/^\d+$/, "campaignId must be a positive integer"),
});

export const userSearchResultSchema = z.object({
    id:       z.number(),
    nickname: z.string(),
    email:    z.string(),
});

export const userSearchResponse = successResponseSchema(z.array(userSearchResultSchema));
