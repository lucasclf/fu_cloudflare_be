import { Hono } from "hono";
import type { ItemService } from "../../../application/item-service";
import type { Env } from "../../../types/env";
import { notFound, ok } from "../../http";

type ItemServiceFactory = (env: Env) => ItemService;

export function createPublicItemsRoutes(itemServiceFactory: ItemServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();
    
        routes.get("/items", async (c) => {
            const service = itemServiceFactory(c.env);
            const items = await service.listItems();
        
            return ok(c, items);
            });

        routes.get("/items/:itemName", async (c) => {
            const itemName = c.req.param("itemName");
        
            const service = itemServiceFactory(c.env);
            const item = await service.getItemByName(itemName);
        
            if (!item) {
              return notFound(c, "Item not found");
            }
        
            return ok(c, item);
        });
        
          return routes; 
}