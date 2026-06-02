import { Hono } from "hono";
import { requestIdMiddleware } from "./middleware/request-id-middleware";
import { createItemService } from "./composition/create-item-service";
import { createJobService } from "./composition/create-job-service";
import { createSessionService } from "./composition/create-session-service";
import { corsMiddleware } from "./middleware/cors-middleware";
import { notFound, ok } from "./presentation/http";
import { createAdminItemsRoutes } from "./presentation/routes/items/admin-items-routes";
import { createPublicItemsRoutes } from "./presentation/routes/items/public-items-routes";
import { createAdminJobsRoutes } from "./presentation/routes/jobs/admin-jobs-routes";
import { createPublicJobsRoutes } from "./presentation/routes/jobs/public-jobs-routes";
import { createAdminSessionsRoutes } from "./presentation/routes/sessions/admin-sessions-routes";
import { createPublicSessionsRoutes } from "./presentation/routes/sessions/public-sessions-routes";
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
import { createAdminPcsRoutes } from "./presentation/routes/pcs/admin-pcs-routes";
import { createPcService } from "./composition/create-pc-service";
import { createPublicPcsRoutes } from "./presentation/routes/pcs/public-pcs-routes";
import { createAdminArcanaRoutes } from "./presentation/routes/arcanas/admin-arcana-routes";
import { createPublicArcanaRoutes } from "./presentation/routes/arcanas/public-arcana-routes";
import { createArcanaService } from "./composition/create-arcana-service";
import { handleAppError } from "./presentation/error-handler";
import { createAuthRoutes } from "./presentation/routes/auth/auth-routes";
import { createAdminUserRoutes } from "./presentation/routes/users/admin-user-routes";
import { createUserService } from "./composition/create-user-service";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", corsMiddleware);
app.use("*", requestIdMiddleware);

app.get("/", (c) => {
	return ok(c, { message: "API is running" });
});

app.route("/v1/public", createPublicSessionsRoutes(createSessionService));
app.route("/v1/admin", createAdminSessionsRoutes(createSessionService));

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

app.route("/v1/admin", createAdminPcsRoutes(createPcService));
app.route("/v1/public", createPublicPcsRoutes(createPcService));

app.route("/v1/admin", createAdminArcanaRoutes(createArcanaService));
app.route("/v1/public", createPublicArcanaRoutes(createArcanaService));

app.route("/v1/auth", createAuthRoutes(createUserService));
app.route("/v1/admin", createAdminUserRoutes(createUserService));

app.notFound((c) => {
	return notFound(c, "Route not found");
});

app.onError((error, c) => {
	return handleAppError(error, c);
});


export default app;
