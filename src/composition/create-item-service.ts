import { ItemService } from "../application/item-service";
import { D1ItemRepository } from "../infrastructure/d1-item-repository";
import type { Env } from "../types/env";

export function createItemService(env: Env): ItemService {
	const repository = new D1ItemRepository(env.fabula_ultima_db);
	return new ItemService(repository);
}
