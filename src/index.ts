import { Hono } from "hono";
import { createItemService } from "./composition/create-item-service";
import { createJobService } from "./composition/create-job-service";
import { createSessionService } from "./composition/create-session-service";
import { corsMiddleware } from "./middleware/cors-middleware";
import { internalServerError, notFound, ok } from "./presentation/http";
import { createAdminItemsRoutes } from "./presentation/routes/items/admin-items-routes";
import { createPublicItemsRoutes } from "./presentation/routes/items/public-items-routes";
import { createAdminJobsRoutes } from "./presentation/routes/jobs/admin-jobs-routes";
import { createPublicJobsRoutes } from "./presentation/routes/jobs/public-jobs-routes";
import { createAdminSessionsRoutes } from "./presentation/routes/sessions/admin-sessions-routes";
import { createPublicSessionsRoutes } from "./presentation/routes/sessions/public-sessions-routes";
import type { Env } from "./types/env";
import { createPublicSpellsRoutes } from "./presentation/routes/spells/public.spells.routes";
import { createAdminSpellsRoutes } from "./presentation/routes/spells/admin-spells-routes";
import { createSpellService } from "./composition/create-spell-service";

const app = new Hono<{ Bindings: Env }>();

app.use("*", corsMiddleware);

app.get("/", (c) => {
	return ok(c, { message: "API is running" });
});

app.route("/public", createPublicSessionsRoutes(createSessionService));
app.route("/admin", createAdminSessionsRoutes(createSessionService));

app.route("/admin", createAdminItemsRoutes(createItemService));
app.route("/public", createPublicItemsRoutes(createItemService));

app.route("/admin", createAdminJobsRoutes(createJobService));
app.route("/public", createPublicJobsRoutes(createJobService));

app.route("/public", createPublicSpellsRoutes(createSpellService));
app.route("/admin", createAdminSpellsRoutes(createSpellService));

app.notFound((c) => {
	return notFound(c, "Route not found");
});

app.onError((error, c) => {
	console.error(error);
	return internalServerError(c);
});

export default app;
