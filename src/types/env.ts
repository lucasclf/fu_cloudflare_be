export interface Env {
	fabula_ultima_db: D1Database;
	API_TOKEN: string;
	JWT_SECRET: string;
	// Configuração opcional do cookie de sessão (complementar ao Authorization: Bearer).
	// Ausentes/omitidas, o suporte a cookie permanece desabilitado (AUTH_COOKIE_ENABLED=false).
	AUTH_COOKIE_ENABLED?: string;
	AUTH_COOKIE_NAME?: string;
	AUTH_COOKIE_DOMAIN?: string;
	AUTH_COOKIE_SAMESITE?: string;
	AUTH_COOKIE_SECURE?: string;
	AUTH_COOKIE_MAX_AGE?: string;
	// Upload de imagens de entidades de campanha (ver POST /v1/campaigns/:campaignId/uploads/signature).
	CLOUDINARY_CLOUD_NAME: string;
	CLOUDINARY_API_KEY: string;
	CLOUDINARY_API_SECRET: string;
	CLOUDINARY_UPLOAD_PRESET: string;
}

import type { User } from "../domain/users/user";

export interface Variables {
	requestId: string;
	userId?: number;
	userEmail?: string;
	isSuperUser?: boolean;
	campaignRole?: "master" | "player" | "super_user";
	currentUser?: User;
}
