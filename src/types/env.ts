export interface Env {
	fabula_ultima_db: D1Database;
	API_TOKEN: string;
	JWT_SECRET: string;
}

export interface Variables {
	requestId: string;
	userId?: number;
	userEmail?: string;
	isSuperUser?: boolean;
}
