export interface Session {
	id: number;
	session_number: number;
	title: string | null;
	summary: string;
	notes: string | null;
	played_at: string;
	created_at: string;
	updated_at: string | null;
}

export interface CreateSessionInput {
	session_number: number;
	title: string | null;
	summary: string;
	notes: string | null;
	played_at: string;
}

export interface UpdateSessionInput {
	title: string | null;
	summary: string;
	notes: string | null;
	played_at: string;
}
