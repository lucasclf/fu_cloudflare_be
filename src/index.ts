import { Hono } from "hono";
import type { Env } from "./types/env";
import { createSessionService } from "./composition/create-session-service";
import { createItemService } from "./composition/create-item-service";
import { corsMiddleware } from "./middleware/cors-middleware";
import { createAdminSessionsRoutes } from "./presentation/routes/sessions/admin-sessions-routes";
import { createPublicSessionsRoutes } from "./presentation/routes/sessions/public-sessions-routes";
import { createAdminItemsRoutes } from "./presentation/routes/items/admin-items-routes";
import { internalServerError, notFound, ok } from "./presentation/http";

const app = new Hono<{ Bindings: Env }>();

app.use("*", corsMiddleware);

app.get("/", (c) => {
  return ok(c, { message: "API is running" });
});

app.route("/public", createPublicSessionsRoutes(createSessionService));
app.route("/admin", createAdminSessionsRoutes(createSessionService));

app.route("/admin", createAdminItemsRoutes(createItemService));


app.notFound((c) => {
  return notFound(c, "Route not found");
});

app.onError((error, c) => {
  console.error(error);
  return internalServerError(c);
});

export default app;