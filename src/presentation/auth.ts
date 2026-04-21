import { Env } from "../types/env";

export function isAuthorized(request: Request, env: Env): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${env.API_TOKEN}`;
}