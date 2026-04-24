import { cors } from "hono/cors";

const ALLOWED_ORIGINS = [
	"http://localhost:5173",
	"https://fuweb.cqn-lucas.workers.dev",
	"https://fu-wiki.cqn.xyz.br",
];

export const corsMiddleware = cors({
	origin: (origin) => {
		if (!origin) return null;
		return ALLOWED_ORIGINS.includes(origin) ? origin : null;
	},
	allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowHeaders: ["Content-Type", "Authorization"],
	maxAge: 86400,
});
