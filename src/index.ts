import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { requestIdMiddleware } from "./middleware/request-id-middleware";
import { createItemService } from "./composition/create-item-service";
import { createJobService } from "./composition/create-job-service";
import { createSessionService } from "./composition/create-session-service";
import { corsMiddleware } from "./middleware/cors-middleware";
import { ok } from "./presentation/http";
import { createAdminItemsRoutes } from "./presentation/routes/items/admin-items-routes";
import { createPublicItemsRoutes } from "./presentation/routes/items/public-items-routes";
import { createAdminJobsRoutes } from "./presentation/routes/jobs/admin-jobs-routes";
import { createPublicJobsRoutes } from "./presentation/routes/jobs/public-jobs-routes";
import type { Env, Variables } from "./types/env";
import { createPublicSpellsRoutes } from "./presentation/routes/spells/public-spells-routes";
import { createAdminSpellsRoutes } from "./presentation/routes/spells/admin-spells-routes";
import { createSpellService } from "./composition/create-spell-service";
import { createPowerService } from "./composition/create-power-service";
import { createAdminPowersRoutes } from "./presentation/routes/powers/admin-powers-routes";
import { createPublicPowersRoutes } from "./presentation/routes/powers/public-powers-routes";
import { createLocationService } from "./composition/create-location-service";
import { createAdminLocationsRoutes } from "./presentation/routes/locations/admin-locations-routes";
import { createPublicLocationsRoutes } from "./presentation/routes/locations/public-locations-routes";
import { createAdminFactionsRoutes } from "./presentation/routes/factions/admin-factions-routes";
import { createFactionService } from "./composition/create-faction-service";
import { createPublicFactionsRoutes } from "./presentation/routes/factions/public-factions-routes";
import { createPublicScenarioRoutes } from "./presentation/routes/scenario/public-scenario-routes";
import { createScenarioService } from "./composition/create-scenario-service";
import { createAdminMonstersRoutes } from "./presentation/routes/monsters/admin-monsters-route";
import { createMonsterService } from "./composition/create-monster-service";
import { createPublicMonstersRoutes } from "./presentation/routes/monsters/public-monsters-route";
import { createNpcService } from "./composition/create-npc-service";
import { createAdminNpcRoutes } from "./presentation/routes/npcs/admin-npcs-routes";
import { createPublicNpcRoutes } from "./presentation/routes/npcs/public-npcs-routes";
import { createPcService } from "./composition/create-pc-service";
import { createPublicPcsRoutes } from "./presentation/routes/pcs/public-pcs-routes";
import { createPcRelationRoutes } from "./presentation/routes/pcs/pc-relation-routes";
import { createAdminArcanaRoutes } from "./presentation/routes/arcanas/admin-arcana-routes";
import { createPublicArcanaRoutes } from "./presentation/routes/arcanas/public-arcana-routes";
import { createArcanaService } from "./composition/create-arcana-service";
import { handleAppError } from "./presentation/error-handler";
import { createAuthRoutes } from "./presentation/routes/auth/auth-routes";
import { createAdminUserRoutes } from "./presentation/routes/users/admin-user-routes";
import { createUserService } from "./composition/create-user-service";
import { createAdminCampaignRoutes } from "./presentation/routes/campaigns/admin-campaign-routes";
import { createAdminCampaignMemberRoutes } from "./presentation/routes/campaigns/admin-campaign-member-routes";
import { createCampaignRoutes } from "./presentation/routes/campaigns/campaign-routes";
import { createUserCampaignRoutes } from "./presentation/routes/campaigns/user-campaign-routes";
import { createCampaignService } from "./composition/create-campaign-service";
import { createCampaignMemberService } from "./composition/create-campaign-member-service";
import { createCampaignEntityService } from "./composition/create-campaign-entity-service";
import { createCampaignReadService } from "./composition/create-campaign-read-service";
import { createCampaignInvitationService } from "./composition/create-campaign-invitation-service";
import { createCampaignInvitationRoutes } from "./presentation/routes/campaigns/campaign-invitation-routes";
import { createCampaignHomeRoutes } from "./presentation/routes/campaigns/campaign-home-routes";
import { createUserInvitationRoutes } from "./presentation/routes/invitations/user-invitation-routes";
import { createUserRoutes } from "./presentation/routes/users/user-routes";

const app = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>({
	defaultHook: (result, c) => {
		if (!result.success) {
			const firstError = result.error.issues[0];
			const path = firstError.path.join(".");
			const message = path
				? `${path}: ${firstError.message}`
				: firstError.message;
			return c.json(
				{
					success: false as const,
					error: { code: "BAD_REQUEST", message },
				},
				400,
			);
		}
	},
});

app.use("*", corsMiddleware);
app.use("*", requestIdMiddleware);

app.get("/", (c) => {
	return ok(c, { message: "API is running" });
});

// ─── Documentação ─────────────────────────────────────────────────────────────

// Spec base gerada pelo @hono/zod-openapi (rota interna)
app.doc("/_internal/spec", {
	openapi: "3.0.0",
	info: {
		title: "FUDB — Fábula Última Database",
		version: "1.0.0",
		description: "API backend do sistema de gerenciamento de campanhas Fábula Última.",
	},
	tags: [
		{ name: "Autenticação" },
		{ name: "Usuários" },
		{ name: "Sessões" },
		{ name: "Itens" },
		{ name: "Profissões" },
		{ name: "Poderes" },
		{ name: "Feitiços" },
		{ name: "Arcanas" },
		{ name: "Localizações" },
		{ name: "Facções" },
		{ name: "Monstros" },
		{ name: "NPCs" },
		{ name: "Personagens" },
		{ name: "Cenário" },
		{ name: "Campanhas" },
		{ name: "Convites" },
	],
});

// Spec público — injeta securitySchemes que o @hono/zod-openapi não inclui via app.doc()
app.get("/docs/spec.json", async (c) => {
	const internalRes = await app.request("/_internal/spec");
	const spec = (await internalRes.json()) as Record<string, unknown>;

	(spec.components as Record<string, unknown>) = {
		...((spec.components as Record<string, unknown>) ?? {}),
		securitySchemes: {
			adminToken: {
				type: "http",
				scheme: "bearer",
				description: "Token de administração — valor de API_TOKEN no .dev.vars",
			},
			userToken: {
				type: "http",
				scheme: "bearer",
				description: "JWT gerado pelo endpoint POST /v1/auth/login",
			},
		},
	};

	return c.json(spec);
});

app.get("/docs", swaggerUI({ url: "/docs/spec.json" }));

// ─── Rotas ────────────────────────────────────────────────────────────────────

app.route("/v1/auth", createAuthRoutes(createUserService));
app.route("/v1/admin", createAdminUserRoutes(createUserService));

app.route("/v1/admin", createAdminItemsRoutes(createItemService));
app.route("/v1/public", createPublicItemsRoutes(createItemService));

app.route("/v1/admin", createAdminJobsRoutes(createJobService));
app.route("/v1/public", createPublicJobsRoutes(createJobService));

app.route("/v1/public", createPublicSpellsRoutes(createSpellService));
app.route("/v1/admin", createAdminSpellsRoutes(createSpellService));

app.route("/v1/admin", createAdminPowersRoutes(createPowerService));
app.route("/v1/public", createPublicPowersRoutes(createPowerService));

app.route("/v1/admin", createAdminLocationsRoutes(createLocationService));
app.route("/v1/public", createPublicLocationsRoutes(createLocationService));

app.route("/v1/admin", createAdminFactionsRoutes(createFactionService));
app.route("/v1/public", createPublicFactionsRoutes(createFactionService));

app.route("/v1/public", createPublicScenarioRoutes(createScenarioService));

app.route("/v1/admin", createAdminMonstersRoutes(createMonsterService));
app.route("/v1/public", createPublicMonstersRoutes(createMonsterService));

app.route("/v1/admin", createAdminNpcRoutes(createNpcService));
app.route("/v1/public", createPublicNpcRoutes(createNpcService));

app.route("/v1/public", createPublicPcsRoutes(createPcService));
app.route("/v1/pcs", createPcRelationRoutes(createPcService));

app.route("/v1/admin", createAdminArcanaRoutes(createArcanaService));
app.route("/v1/public", createPublicArcanaRoutes(createArcanaService));

// ─── Campanhas ────────────────────────────────────────────────────────────────
app.route("/v1/admin", createAdminCampaignRoutes(createCampaignService));
app.route("/v1/admin", createAdminCampaignMemberRoutes(createCampaignMemberService));
app.route("/v1/campaigns", createUserCampaignRoutes(createCampaignService, createCampaignMemberService));
app.route("/v1/campaigns", createCampaignRoutes(createCampaignReadService, createCampaignEntityService, createPcService, createCampaignMemberService, createItemService, createSessionService, createLocationService, createFactionService, createNpcService, createMonsterService));
app.route("/v1/campaigns", createCampaignInvitationRoutes(createCampaignInvitationService));
app.route("/v1/campaigns", createCampaignHomeRoutes(createCampaignService, createCampaignMemberService, createCampaignReadService, createCampaignInvitationService, createPcService));

// ─── Usuários ─────────────────────────────────────────────────────────────────
app.route("/v1/users", createUserRoutes(createUserService));

// ─── Convites ─────────────────────────────────────────────────────────────────
app.route("/v1/invitations", createUserInvitationRoutes(createCampaignInvitationService));

app.onError((error, c) => {
	return handleAppError(error, c);
});

export default app;
