import { Hono } from "hono";
import type { ItemService } from "../../../application/item-service";
import type { Env } from "../../../types/env";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { badRequest, conflict, created, noContent, notFound, ok } from "../../http";
import { validateCreateItemInput, validateUpdateItemInput } from "../../../validation/item-validator";
import { ValidationError } from "../../../domain/domain-errors";
import { ItemAlreadyExistsError } from "../../../domain/items/item-errors";

type ItemServiceFactory = (env: Env) => ItemService;

export function createAdminItemsRoutes(itemServiceFactory: ItemServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

        routes.use("*", adminAuthMiddleware);
    
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

        routes.post("/items", async (c) => {
            try {
              const rawBody = await c.req.json();
              const input = validateCreateItemInput(rawBody);
        
              const service = itemServiceFactory(c.env);
              await service.createItem(input);
        
              return created(c, { message: "Item created successfully" });
            } catch (error) {
              if (error instanceof ValidationError) {
                return badRequest(c, error.message);
              }
        
              if (error instanceof ItemAlreadyExistsError) {
                return conflict(c, error.message);
              }
        
              throw error;
            }
          });
        
          /* routes.put("/items/:itemNumber", async (c) => {
            const itemNumber = Number(c.req.param("itemNumber"));
        
            if (!Number.isInteger(itemNumber) || itemNumber < 0) {
              return badRequest(c, "Invalid item number");
            }
        
            try {
              const rawBody = await c.req.json();
              const input = validateUpdateItemInput(rawBody);
        
              const service = itemServiceFactory(c.env);
              await service.updateItem(itemNumber, input);
        
              return ok(c, { message: "Item updated successfully" });
            } catch (error) {
              if (error instanceof ValidationError) {
                return badRequest(c, error.message);
              }
        
              if (error instanceof ItemNotFoundError) {
                return notFound(c, error.message);
              }
        
              throw error;
            }
          });
        
          routes.delete("/items/:itemNumber", async (c) => {
            const itemNumber = Number(c.req.param("itemNumber"));
        
            if (!Number.isInteger(itemNumber) || itemNumber < 0) {
              return badRequest(c, "Invalid item number");
            }
        
            try {
              const service = itemServiceFactory(c.env);
              await service.deleteItem(itemNumber);
        
              return noContent(c);
            } catch (error) {
              if (error instanceof ItemNotFoundError) {
                return notFound(c, error.message);
              }
        
              throw error;
            }
          });*/
        
          return routes; 
}