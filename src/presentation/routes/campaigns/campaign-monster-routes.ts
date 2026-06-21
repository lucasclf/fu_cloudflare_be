import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { MonsterService } from "../../../application/monster-service";
import { campaignMemberMiddleware } from "../../../middleware/campaign-member-middleware";
import { forbidIfNotMaster } from "../../../middleware/campaign-role-helpers";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { campaignIdParamSchema, visibilityFieldSchema } from "../../../schemas/campaign-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, notFoundResponse, okMessageResponse } from "../../../schemas/common";
import {
    createMonsterActionSchema, createMonsterAffinitySchema, createMonsterSchema, createMonsterTraitSchema,
} from "../../../schemas/monster-schemas";

type EntityFactory = (env: Env) => CampaignEntityService;
type MonsterFactory = (env: Env) => MonsterService;

const campaignMonsterParamSchema = campaignIdParamSchema.extend({
    monsterId: z.string().regex(/^\d+$/, "monsterId must be a positive integer"),
});

const monsterTraitBodySchema = createMonsterTraitSchema.omit({ monster_id: true });
const monsterAffinityBodySchema = createMonsterAffinitySchema.omit({ monster_id: true });

// Campos permitidos por action_type — espelha ACTION_FIELD_VISIBILITY do fuweb
// (campaign-manage-page.tsx), que já oculta/limpa esses campos no formulário.
const ACTION_FIELD_VISIBILITY: Record<z.infer<typeof createMonsterActionSchema>["action_type"], {
    damageType: boolean; checkFormula: boolean; accuracyBonus: boolean;
    cost: boolean; target: boolean; duration: boolean; isOffensive: boolean;
}> = {
    special_rule: {
        damageType: false, checkFormula: false, accuracyBonus: false,
        cost: false, target: false, duration: false, isOffensive: false,
    },
    basic_attack: {
        damageType: true, checkFormula: true, accuracyBonus: true,
        cost: false, target: false, duration: false, isOffensive: true,
    },
    spell: {
        damageType: true, checkFormula: true, accuracyBonus: true,
        cost: true, target: true, duration: true, isOffensive: true,
    },
    other_action: {
        damageType: true, checkFormula: true, accuracyBonus: true,
        cost: true, target: true, duration: true, isOffensive: true,
    },
};

const monsterActionBodySchema = createMonsterActionSchema.omit({ monster_id: true })
    .refine(
        (action) => action.action_type !== "spell" || (!!action.cost && !!action.target && !!action.duration),
        { message: "Ações do tipo 'spell' exigem cost, target e duration" },
    )
    .superRefine((action, ctx) => {
        const visibility = ACTION_FIELD_VISIBILITY[action.action_type];
        const notAllowedMessage = (field: string) => `Campo '${field}' não é permitido para ações do tipo '${action.action_type}'`;

        if (!visibility.damageType && action.damage_type !== null) {
            ctx.addIssue({ code: "custom", path: ["damage_type"], message: notAllowedMessage("damage_type") });
        }
        if (!visibility.checkFormula && action.check_formula !== null) {
            ctx.addIssue({ code: "custom", path: ["check_formula"], message: notAllowedMessage("check_formula") });
        }
        if (!visibility.accuracyBonus && action.accuracy_bonus !== null) {
            ctx.addIssue({ code: "custom", path: ["accuracy_bonus"], message: notAllowedMessage("accuracy_bonus") });
        }
        if (!visibility.cost && action.cost !== null) {
            ctx.addIssue({ code: "custom", path: ["cost"], message: notAllowedMessage("cost") });
        }
        if (!visibility.target && action.target !== null) {
            ctx.addIssue({ code: "custom", path: ["target"], message: notAllowedMessage("target") });
        }
        if (!visibility.duration && action.duration !== null) {
            ctx.addIssue({ code: "custom", path: ["duration"], message: notAllowedMessage("duration") });
        }
        if (!visibility.isOffensive && action.is_offensive !== false) {
            ctx.addIssue({ code: "custom", path: ["is_offensive"], message: notAllowedMessage("is_offensive") });
        }
    });
const createCampaignMonsterSchema = createMonsterSchema.extend({
    ...visibilityFieldSchema.shape,
    traits: z.array(monsterTraitBodySchema).max(4).optional().default([]),
    affinities: monsterAffinityBodySchema.optional(),
    actions: z.array(monsterActionBodySchema).optional().default([]),
});

const sec = [{ userToken: [] }];

export function createCampaignMonsterRoutes(monsterFactory: MonsterFactory, entityFactory: EntityFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
    routes.use("*", userAuthMiddleware);
    routes.use("*", campaignMemberMiddleware);

    routes.openapi(createRoute({
        method: "post", path: "/:campaignId/monsters", tags: ["Campanhas"],
        summary: "Criar monstro na campanha",
        description: "Cria um monstro e o vincula automaticamente à campanha, podendo incluir até 4 traits, afinidades elementais e ações. Apenas o mestre da campanha pode criar monstros.",
        security: sec,
        request: {
            params: campaignIdParamSchema,
            body: { content: { "application/json": { schema: createCampaignMonsterSchema } } },
        },
        responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 409: conflictResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId } = c.req.valid("param");
            const { visible_to_players, traits, affinities, actions, ...monsterInput } = c.req.valid("json");
            const newMonsterId = await monsterFactory(c.env).createMonster(monsterInput);
            await entityFactory(c.env).linkEntity({ campaign_id: Number(campaignId), entity_type: "monster", entity_id: newMonsterId, visible_to_players });

            for (const trait of traits) {
                await monsterFactory(c.env).createMonsterTrait({ ...trait, monster_id: newMonsterId });
            }

            if (affinities) {
                await monsterFactory(c.env).createMonsterAffinity({ ...affinities, monster_id: newMonsterId });
            }

            for (const action of actions) {
                await monsterFactory(c.env).createMonsterAction({ ...action, monster_id: newMonsterId });
            }

            return c.json({ success: true as const, data: { message: "Monster created and linked to campaign" } } as any, 201);
        });

    routes.openapi(createRoute({
        method: "patch", path: "/:campaignId/monsters/:monsterId", tags: ["Campanhas"],
        summary: "Atualizar monstro da campanha",
        security: sec,
        request: {
            params: campaignMonsterParamSchema,
            body: { content: { "application/json": { schema: createCampaignMonsterSchema } } },
        },
        responses: { 200: okMessageResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
    }),
        async (c) => {
            const deny = forbidIfNotMaster(c); if (deny) return deny as any;
            const { campaignId, monsterId } = c.req.valid("param");
            const linked = await entityFactory(c.env).getEntity(Number(campaignId), "monster", Number(monsterId));
            if (!linked) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Monstro não encontrado nesta campanha" } } as any, 404);
            const { visible_to_players, traits, affinities, actions, ...monsterInput } = c.req.valid("json");
            await monsterFactory(c.env).updateMonster(
                Number(monsterId),
                monsterInput,
                (traits ?? []).map((t: any) => ({ ...t, monster_id: Number(monsterId) })),
                affinities ? { ...affinities, monster_id: Number(monsterId) } : null,
                (actions ?? []).map((a: any) => ({ ...a, monster_id: Number(monsterId) })),
            );
            await entityFactory(c.env).updateEntityVisibility(Number(campaignId), "monster", Number(monsterId), visible_to_players);
            return c.json({ success: true as const, data: { message: "Monstro atualizado com sucesso" } } as any, 200);
        });

    return routes;
}
