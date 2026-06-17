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
	// `credentials: true` só é seguro porque `origin` acima nunca retorna "*" —
	// sempre ecoa uma origem específica da allowlist (ou null). O middleware de
	// CORS do Hono respeita essa garantia: Access-Control-Allow-Credentials só é
	// emitido junto de Access-Control-Allow-Origin com a origem exata, nunca com
	// curinga. Necessário para que o navegador envie/aceite o cookie de sessão
	// HttpOnly em requisições cross-site (fetch com `credentials: "include"`).
	credentials: true,
	allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowHeaders: ["Content-Type", "Authorization"],
	maxAge: 86400,
});
