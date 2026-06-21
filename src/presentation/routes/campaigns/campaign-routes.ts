import { OpenAPIHono } from "@hono/zod-openapi";
import type { CampaignEntityService } from "../../../application/campaign-entity-service";
import type { CampaignMemberService } from "../../../application/campaign-member-service";
import type { CampaignReadService } from "../../../application/campaign-read-service";
import type { FactionService } from "../../../application/faction-service";
import type { ItemService } from "../../../application/item-service";
import type { LocationService } from "../../../application/location-service";
import type { MonsterService } from "../../../application/monster-service";
import type { NpcService } from "../../../application/npc-service";
import type { PCService } from "../../../application/pc-service";
import type { SessionService } from "../../../application/session-service";
import type { Env, Variables } from "../../../types/env";
import { createCampaignEntityLinkRoutes } from "./campaign-entity-link-routes";
import { createCampaignFactionRoutes } from "./campaign-faction-routes";
import { createCampaignItemRoutes } from "./campaign-item-routes";
import { createCampaignLocationRoutes } from "./campaign-location-routes";
import { createCampaignMemberRoutes } from "./campaign-member-routes";
import { createCampaignMonsterRoutes } from "./campaign-monster-routes";
import { createCampaignNpcRoutes } from "./campaign-npc-routes";
import { createCampaignPcRoutes } from "./campaign-pc-routes";
import { createCampaignReadRoutes } from "./campaign-read-routes";
import { createCampaignSessionRoutes } from "./campaign-session-routes";

type ReadFactory = (env: Env) => CampaignReadService;
type EntityFactory = (env: Env) => CampaignEntityService;
type MemberFactory = (env: Env) => CampaignMemberService;
type PcFactory = (env: Env) => PCService;
type ItemFactory = (env: Env) => ItemService;
type LocationFactory = (env: Env) => LocationService;
type SessionFactory = (env: Env) => SessionService;
type FactionFactory = (env: Env) => FactionService;
type NpcFactory = (env: Env) => NpcService;
type MonsterFactory = (env: Env) => MonsterService;

// Agregador fino: cada sub-recurso (leitura, PCs, itens, locais, facções,
// sessões, NPCs, monstros, membros, vínculos genéricos) vive em seu próprio
// arquivo, com sua própria cadeia de middleware — mesmo padrão usado em todo
// o resto do projeto (um arquivo de rotas por domínio). Isso existia antes
// como um único arquivo de ~730 linhas misturando 7+ sub-recursos.
export function createCampaignRoutes(
    readFactory: ReadFactory,
    entityFactory: EntityFactory,
    pcFactory: PcFactory,
    memberFactory: MemberFactory,
    itemFactory: ItemFactory,
    sessionFactory: SessionFactory,
    locationFactory: LocationFactory,
    factionFactory: FactionFactory,
    npcFactory: NpcFactory,
    monsterFactory: MonsterFactory,
) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.route("/", createCampaignReadRoutes(readFactory, pcFactory));
    routes.route("/", createCampaignPcRoutes(pcFactory, entityFactory, readFactory));
    routes.route("/", createCampaignItemRoutes(itemFactory, entityFactory));
    routes.route("/", createCampaignLocationRoutes(locationFactory, entityFactory));
    routes.route("/", createCampaignFactionRoutes(factionFactory, entityFactory));
    routes.route("/", createCampaignSessionRoutes(sessionFactory, entityFactory));
    routes.route("/", createCampaignNpcRoutes(npcFactory, entityFactory));
    routes.route("/", createCampaignMonsterRoutes(monsterFactory, entityFactory));
    routes.route("/", createCampaignMemberRoutes(memberFactory));
    routes.route("/", createCampaignEntityLinkRoutes(entityFactory));

    return routes;
}
