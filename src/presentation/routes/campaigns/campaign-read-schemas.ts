import { successResponseSchema } from "../../../schemas/common";
import { sessionSchema } from "../../../schemas/session-schemas";
import { npcSummarySchema } from "../../../schemas/npc-schemas";
import { locationSchema } from "../../../schemas/location-schemas";
import { factionBaseSchema } from "../../../schemas/faction-schemas";
import { monsterSummarySchema } from "../../../schemas/monster-schemas";

export const sessionListResponse = successResponseSchema(sessionSchema.array());
export const npcSummaryListResponse = successResponseSchema(npcSummarySchema.array());
export const locationListResponse = successResponseSchema(locationSchema.array());
export const factionListResponse = successResponseSchema(factionBaseSchema.array());
export const monsterSummaryListResponse = successResponseSchema(monsterSummarySchema.array());
