# FUDB — Fábula Última Database

Backend da aplicação **Fábula Última**, um sistema de gerenciamento de dados para campanhas do RPG de mesa Fábula Ultima. Executado como um **Cloudflare Worker** serverless, com banco de dados **Cloudflare D1** (SQLite na edge).

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Configuração Local](#configuração-local)
- [Variáveis de Ambiente e Secrets](#variáveis-de-ambiente-e-secrets)
- [Banco de Dados e Migrations](#banco-de-dados-e-migrations)
- [Rodando Localmente](#rodando-localmente)
- [Testes](#testes)
- [Deploy](#deploy)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Referência da API](#referência-da-api)
- [Formato de Respostas](#formato-de-respostas)
- [Autenticação](#autenticação)
- [Cache](#cache)

---

## Visão Geral

O FUDB expõe uma API HTTP que serve como backend para o wiki/painel da campanha. Os dados incluem:

- **Personagens Jogáveis (PCs)** — atributos, classes, poderes, feitiços, equipamento, inventário, arcanas e vínculos
- **Profissões (Jobs)** — classes do sistema com poderes e feitiços associados
- **Itens** — armas, armaduras, escudos, acessórios e artefatos
- **Monstros** — com traits, afinidades e ações
- **NPCs** — com regras especiais, inventário e equipamento
- **Localizações, Facções, Arcanas, Feitiços, Poderes e Sessões**

A API possui dois contextos de acesso:

| Prefixo | Descrição |
|---------|-----------|
| `/public/*` | Endpoints de leitura, sem autenticação |
| `/admin/*` | Endpoints de escrita, protegidos por Bearer token |

---

## Stack

| Tecnologia | Uso |
|------------|-----|
| [Cloudflare Workers](https://workers.cloudflare.com/) | Runtime serverless/edge |
| [Cloudflare D1](https://developers.cloudflare.com/d1/) | Banco de dados SQLite na edge |
| [Hono](https://hono.dev/) | Framework HTTP |
| [TypeScript](https://www.typescriptlang.org/) | Linguagem principal |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | CLI de desenvolvimento e deploy |
| [Vitest](https://vitest.dev/) | Framework de testes |
| [@cloudflare/vitest-pool-workers](https://www.npmjs.com/package/@cloudflare/vitest-pool-workers) | Pool de testes no ambiente Workers |

---

## Arquitetura

O projeto segue **Clean Architecture** com separação explícita de camadas:

```
src/
├── domain/          # Entidades, interfaces e erros de domínio — sem dependências externas
├── application/     # Serviços de aplicação, ports e assemblers — orquestra o domínio
├── infrastructure/  # Implementações concretas: repositórios D1, mapeamento de rows
├── presentation/    # Rotas HTTP, middlewares e formatação de respostas
├── composition/     # Factories de injeção de dependência por domínio
├── middleware/      # CORS, autenticação, request ID, cache
├── validation/      # Validadores de entrada por domínio
└── types/           # Tipos globais (Env, Variables)
```

### Fluxo de uma requisição

```
Request HTTP
    ↓
cors-middleware → request-id-middleware
    ↓
[adminAuthMiddleware] (apenas rotas /admin)
    ↓
Route handler → validação de input
    ↓
ServiceFactory(env) → Service → Repository → D1Database
    ↓
Response JSON padronizado
```

### Padrões utilizados

- **Port & Adapter (Hexagonal):** interfaces entre camadas isolam a lógica de negócio da infraestrutura
- **Repository Pattern:** acesso a dados abstraído por interfaces
- **Factory Pattern:** composição de dependências em `composition/`
- **Assembler Pattern:** `PcFullAssembler` monta o `PcFull` a partir de múltiplas fontes com queries paralelas

---

## Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- Conta na [Cloudflare](https://dash.cloudflare.com/) com Workers e D1 habilitados
- **Wrangler** autenticado: `npx wrangler login`

---

## Configuração Local

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd fudb

# 2. Instale as dependências
npm install

# 3. Gere os tipos do Worker (bindings D1, etc.)
npm run cf-typegen

# 4. Aplique as migrations no banco local
npm run db:migrate:local
```

---

## Variáveis de Ambiente e Secrets

### Secret obrigatório

O único secret necessário é o token de autenticação das rotas admin.

**Em produção** (via Wrangler):
```bash
npx wrangler secret put API_TOKEN
# Digite o valor do token quando solicitado
```

**Em desenvolvimento local**, crie o arquivo `.dev.vars` na raiz do projeto:
```env
API_TOKEN=seu_token_local_aqui
```

> O arquivo `.dev.vars` é ignorado pelo git e nunca deve ser commitado.

### Binding D1

O banco de dados é configurado em `wrangler.jsonc`. Para desenvolvimento local o Wrangler usa um SQLite local automaticamente (via `--local`). Para produção, o binding aponta para o banco D1 remoto.

```jsonc
// wrangler.jsonc
"d1_databases": [
  {
    "binding": "fabula_ultima_db",
    "database_name": "fabula-ultima-db",
    "database_id": "<seu-database-id>"
  }
]
```

---

## Banco de Dados e Migrations

As migrations ficam em `migrations/` e são aplicadas em ordem numérica.

### Comandos disponíveis

```bash
# Aplicar migrations no banco local (desenvolvimento)
npm run db:migrate:local

# Aplicar migrations no banco remoto (produção)
npm run db:migrate:remote

# Listar tabelas no banco local
npm run db:tables:local

# Listar tabelas no banco remoto
npm run db:tables:remote

# Resetar o banco remoto (script PowerShell — use com cautela)
npm run db:remote:reset
```

### Schema resumido

| Tabela | Descrição |
|--------|-----------|
| `sessions` | Sessões de jogo jogadas |
| `items` | Itens do jogo (armas, armaduras, acessórios, etc.) |
| `jobs` | Profissões/Classes dos personagens |
| `job_powers` | Poderes associados às profissões |
| `job_power_jobs` | Relação N:N entre poderes e profissões |
| `job_questions` | Perguntas de background por profissão |
| `job_aliases` | Nomes alternativos de profissões |
| `arcanas` | Arcanas do sistema |
| `spells` | Feitiços (associados a profissões) |
| `locations` | Localizações do cenário |
| `factions` | Facções do cenário |
| `faction_locations` | Relação entre facções e locais |
| `monsters` | Inimigos e criaturas |
| `monster_traits` | Características especiais de monstros |
| `monster_affinities` | Afinidades elementares de monstros |
| `monster_actions` | Ações disponíveis para monstros |
| `npcs` | Personagens não-jogáveis |
| `npc_special_rules` | Regras especiais de NPCs |
| `npc_inventory` | Inventário de NPCs |
| `npc_equipment` | Equipamento de NPCs |
| `pcs` | Personagens jogáveis |
| `pc_jobs` | Relação PC ↔ Profissão (com nível) |
| `pc_powers` | Poderes adquiridos pelo PC |
| `pc_spells` | Feitiços aprendidos pelo PC |
| `pc_arcanas` | Arcanas vinculadas ao PC |
| `pc_equipment` | Equipamento equipado pelo PC |
| `pc_inventory` | Inventário do PC |
| `pc_bonds` | Vínculos do PC com outros personagens |
| `pc_monster_spells` | Feitiços de monstros que o PC pode usar |

---

## Rodando Localmente

```bash
# Inicia o servidor de desenvolvimento (hot reload)
npm run dev
```

O servidor ficará disponível em `http://localhost:8787`.

Para testar um endpoint público:
```bash
curl http://localhost:8787/public/jobs
```

Para testar um endpoint admin:
```bash
curl -H "Authorization: Bearer seu_token_local_aqui" \
  http://localhost:8787/admin/jobs \
  -d '{"name":"Guardião","tagline":"...","description":"...","hp_bonus":5,...}' \
  -H "Content-Type: application/json" \
  -X POST
```

---

## Testes

### Testes unitários

Testam lógica isolada de domínio e aplicação, sem dependência de banco ou runtime do Worker.

```bash
npm run test:unit
```

Cobertura atual:
- `PcStatsCalculator` — cálculo de HP, MP, defesa, iniciativa
- `PcBondResolver` — resolução de vínculos por tipo de alvo
- `PcFullAssembler` — montagem completa do `PcFull`

### Testes de integração

Rodam no ambiente real do Cloudflare Workers (via Miniflare) com um banco D1 local em memória. As migrations são aplicadas automaticamente antes dos testes.

```bash
npm run test:integration
```

Cobertura atual:
- `D1JobRepository` — criação, leitura, busca por IDs, detecção de duplicata
- `D1PCBondRepository` — criação e leitura de vínculos com campos `id` e `img_key`

### Checagem de tipos

```bash
# Checagem do código fonte
npm run typecheck

# Checagem do código fonte + arquivos de teste
npm run typecheck:test
```

---

## Deploy

```bash
# Deploy para produção
npm run deploy
```

Antes do primeiro deploy:
1. Certifique-se de que o banco D1 remoto existe: `npx wrangler d1 create fabula-ultima-db`
2. Copie o `database_id` gerado para o `wrangler.jsonc`
3. Aplique as migrations no banco remoto: `npm run db:migrate:remote`
4. Configure o secret: `npx wrangler secret put API_TOKEN`

---

## Estrutura de Pastas

```
fudb/
├── migrations/                        # Migrations SQL em ordem numérica
├── src/
│   ├── index.ts                       # Entry point — registra rotas e middlewares
│   ├── types/
│   │   └── env.ts                     # Tipos Env (bindings) e Variables (requestId)
│   ├── middleware/
│   │   ├── admin-auth-middleware.ts   # Autenticação Bearer com timing-safe compare
│   │   ├── cache-middleware.ts        # Cache-Control para dados estáticos
│   │   ├── cors-middleware.ts         # CORS com whitelist de origens
│   │   └── request-id-middleware.ts   # Correlation ID por request
│   ├── domain/
│   │   ├── app-error.ts               # Hierarquia de erros base (AppError)
│   │   ├── common-errors.ts           # ResourceNotFoundError, ResourceAlreadyExistsError
│   │   ├── domain-errors.ts           # ValidationError
│   │   ├── domain-types.ts            # Tipos compartilhados (Character, AttributeDie)
│   │   ├── items/
│   │   ├── jobs/
│   │   ├── monsters/
│   │   ├── npc/
│   │   ├── pc/
│   │   │   ├── pc.ts                  # Tipos do PC (PcBase, PcFull, PcBond, etc.)
│   │   │   └── pc-stats-calculator.ts # Cálculo de HP, MP, DEF, MDEF, iniciativa
│   │   ├── sessions/
│   │   ├── spells/
│   │   ├── factions/
│   │   ├── locations/
│   │   └── scenario/
│   ├── application/
│   │   ├── ports/                     # Interfaces de contrato por domínio
│   │   ├── pc-full-assembler.ts       # Monta PcFull com 2 rodadas de queries paralelas
│   │   ├── pc-bond-resolver.ts        # Resolve vínculos agrupando IDs por tipo
│   │   ├── pc-command-service.ts      # Comandos de PC (escrita)
│   │   ├── pc-query-service.ts        # Queries de PC (leitura)
│   │   ├── pc-service.ts              # Fachada para command + query services
│   │   ├── job-service.ts
│   │   ├── item-service.ts
│   │   └── ...                        # Um service por domínio
│   ├── infrastructure/
│   │   ├── d1-utils.ts                # toBoolean, fromBoolean, mapById, buildInPlaceholders
│   │   ├── rows/                      # Tipos de rows do D1 (com D1Boolean)
│   │   └── repository/                # Implementações D1 por entidade
│   ├── presentation/
│   │   ├── http.ts                    # Helpers: ok, created, notFound, badRequest, etc.
│   │   ├── error-handler.ts           # Handler global com logging estruturado
│   │   └── routes/                    # Rotas organizadas por domínio e acesso
│   ├── composition/                   # Factories de injeção de dependência
│   └── validation/                    # Validadores de entrada por domínio
├── test/
│   ├── unit/                          # Testes unitários com mocks manuais
│   └── integration/                   # Testes de integração com D1 real (Miniflare)
├── wrangler.jsonc                     # Configuração do Worker
├── tsconfig.json                      # Config TypeScript (src)
├── tsconfig.test.json                 # Config TypeScript (src + test)
├── vitest.unit.config.ts
└── vitest.integration.config.ts
```

---

## Referência da API

### Saúde

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | — | Retorna `{ message: "API is running" }` |

---

### Sessões `/sessions`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/sessions` | — | Lista todas as sessões |
| `GET` | `/public/sessions/:sessionNumber` | — | Busca sessão por número |
| `POST` | `/admin/sessions` | ✅ | Cria uma nova sessão |
| `PUT` | `/admin/sessions/:sessionNumber` | ✅ | Atualiza uma sessão existente |
| `DELETE` | `/admin/sessions/:sessionNumber` | ✅ | Remove uma sessão |

**POST /admin/sessions — body:**
```json
{
  "session_number": 1,
  "title": "O Início da Jornada",
  "summary": "Descrição do que aconteceu na sessão.",
  "played_at": "2026-01-15"
}
```

---

### Itens `/items`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/items` | — | Lista todos os itens |
| `GET` | `/public/items/:itemName` | — | Busca item pelo nome exato |
| `POST` | `/admin/items` | ✅ | Cria um novo item |

**Tipos de item (`item_type`):** `arma`, `armadura`, `escudo`, `acessorio`, `artefato`, `outros`

**POST /admin/items — body (arma):**
```json
{
  "name": "Espada Longa",
  "item_type": "arma",
  "description": "Uma espada de aço temperado.",
  "img_key": "espada_longa",
  "cost": 200,
  "weapon_category": "espada",
  "accuracy": "+1",
  "damage": "HR+8",
  "damage_type": "fisico",
  "grip": "two_handed",
  "distance": "corpo_a_corpo",
  "is_martial": true
}
```

**POST /admin/items — body (armadura):**
```json
{
  "name": "Armadura de Placas",
  "item_type": "armadura",
  "description": "Armadura pesada.",
  "cost": 500,
  "defense_dice": "DES",
  "defense_bonus": 2,
  "magic_defense_dice": "AST",
  "magic_defense_bonus": 0,
  "initiative": "-3",
  "is_martial": true
}
```

---

### Profissões `/jobs`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/jobs` | — | Lista profissões (com suporte a `?include=`) |
| `GET` | `/public/jobs/catalog` | — | Lista resumida de profissões |
| `GET` | `/public/jobs/:id` | — | Busca profissão por ID (com suporte a `?include=`) |
| `POST` | `/admin/jobs` | ✅ | Cria uma nova profissão |
| `POST` | `/admin/jobs/questions` | ✅ | Adiciona pergunta de background a uma profissão |
| `POST` | `/admin/jobs/aliases` | ✅ | Adiciona nome alternativo a uma profissão |

**Query param `?include=`** para `/public/jobs` e `/public/jobs/:id`:

| Valor | Descrição |
|-------|-----------|
| `background` | Inclui perguntas e aliases da profissão |
| `powers` | Inclui poderes da profissão |
| `spells` | Inclui feitiços e arcanas (se `allows_arcane`) |

Exemplo: `GET /public/jobs/1?include=powers,spells`

**POST /admin/jobs — body:**
```json
{
  "name": "Guardião",
  "tagline": "Protetor das fronteiras",
  "description": "Especialista em defesa e proteção.",
  "img_key": "guardiao",
  "hp_bonus": 5,
  "mp_bonus": 0,
  "ip_bonus": 1,
  "allows_martial_armor": true,
  "allows_martial_shield": true,
  "allows_martial_ranged_weapon": false,
  "allows_martial_melee_weapon": true,
  "allows_arcane": false,
  "allows_rituals": false,
  "allows_monster_spells": false,
  "can_start_projects": false,
  "can_cooking": false
}
```

---

### Poderes `/powers`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/powers` | — | Lista todos os poderes com suas profissões |
| `POST` | `/admin/powers` | ✅ | Cria um novo poder |

**POST /admin/powers — body:**
```json
{
  "job_id": [1, 3],
  "name": "Escudo de Luz",
  "description": "Cria uma barreira protetora.",
  "type": "common",
  "max_level": 2,
  "is_global": false
}
```

> `job_id` é um array — um mesmo poder pode pertencer a múltiplas profissões.  
> `type`: `"common"` ou `"heroic"`

---

### Feitiços `/spells`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/spells` | — | Lista todos os feitiços |
| `POST` | `/admin/spells` | ✅ | Cria um novo feitiço |

**POST /admin/spells — body:**
```json
{
  "job_id": 2,
  "name": "Raio",
  "description": "Dispara um raio de energia.",
  "is_offensive": true,
  "cost": "20 PM",
  "target": "Um inimigo",
  "duration": "Instantânea"
}
```

---

### Arcanas `/arcanas`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/arcanas` | — | Lista todas as arcanas |
| `POST` | `/admin/arcanas` | ✅ | Cria uma nova arcana |

**POST /admin/arcanas — body:**
```json
{
  "name": "A Torre",
  "domain": "Ruína e Isolamento",
  "merge_effect": "Descrição do efeito de fusão.",
  "dismiss_effect": "Descrição do efeito de dispensa.",
  "special_rule": null
}
```

---

### Localizações `/locations`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/locations` | — | Lista todas as localizações |
| `GET` | `/public/locations/:id` | — | Busca localização por ID |
| `POST` | `/admin/locations` | ✅ | Cria uma nova localização |

---

### Facções `/factions`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/factions` | — | Lista todas as facções |
| `GET` | `/public/factions/:factionId` | — | Busca facção por ID |
| `POST` | `/admin/factions` | ✅ | Cria uma nova facção |

---

### Monstros `/monsters`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/monsters` | — | Lista todos os monstros |
| `GET` | `/public/monsters/summary` | — | Lista resumo dos monstros |
| `GET` | `/public/monsters/:id` | — | Busca monstro por ID (com suporte a `?include=`) |
| `GET` | `/public/monsters/actions` | — | Lista ações de monstros (com suporte a `?include=`) |
| `POST` | `/admin/monsters` | ✅ | Cria um novo monstro |
| `POST` | `/admin/monsters/traits` | ✅ | Adiciona trait a um monstro |
| `POST` | `/admin/monsters/affinities` | ✅ | Adiciona afinidade a um monstro |
| `POST` | `/admin/monsters/actions` | ✅ | Adiciona ação a um monstro |

**Query param `?include=`** para `/public/monsters/:id`:  
`traits`, `affinities`, `actions`

**Query param `?include=`** para `/public/monsters/actions`:  
`basic_attack`, `spell`, `other_action`, `special_rule`

---

### NPCs `/npcs`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/npcs/summary` | — | Lista resumo de todos os NPCs |
| `GET` | `/public/npcs/:id` | — | Busca NPC por ID (com suporte a `?include=`) |
| `POST` | `/admin/npcs` | ✅ | Cria um novo NPC |
| `POST` | `/admin/npcs/special` | ✅ | Adiciona regra especial a um NPC |
| `POST` | `/admin/npcs/inventory` | ✅ | Adiciona item ao inventário de um NPC |
| `POST` | `/admin/npcs/equipment` | ✅ | Define equipamento de um NPC |

**Query param `?include=`** para `/public/npcs/:id`:  
`rules`, `inventories`, `equipments`

---

### Personagens Jogáveis `/pcs`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/pcs/summary` | — | Lista resumo de todos os PCs |
| `GET` | `/public/pcs/:id` | — | Busca PC completo por ID |
| `POST` | `/admin/pcs` | ✅ | Cria um novo PC |
| `POST` | `/admin/pcs/jobs` | ✅ | Vincula profissão ao PC |
| `POST` | `/admin/pcs/powers` | ✅ | Vincula poder ao PC |
| `POST` | `/admin/pcs/spells` | ✅ | Vincula feitiço ao PC |
| `POST` | `/admin/pcs/arcanas` | ✅ | Vincula arcana ao PC |
| `POST` | `/admin/pcs/equipments` | ✅ | Define equipamento do PC |
| `POST` | `/admin/pcs/inventories` | ✅ | Adiciona item ao inventário do PC |
| `POST` | `/admin/pcs/bonds` | ✅ | Cria vínculo do PC |
| `POST` | `/admin/pcs/monster-spells` | ✅ | Vincula feitiço de monstro ao PC |

**POST /admin/pcs — body:**
```json
{
  "name": "Aria Ventworth",
  "description": "Uma jovem maga de origem nobre.",
  "tagline": "A Chama que Nunca Se Apaga",
  "pronouns": "ela/dela",
  "origin": "Capital do Império",
  "identity": "Herdeira renegada",
  "theme": "Redenção pelo conhecimento",
  "dexterity_die": "d8",
  "insight_die": "d10",
  "might_die": "d6",
  "willpower_die": "d10",
  "money": 150,
  "img_key": "aria_ventworth"
}
```

**POST /admin/pcs/jobs — body:**
```json
{
  "pc_id": 1,
  "job_id": 2,
  "level": 5,
  "ignore_hp_bonus": false,
  "ignore_mp_bonus": false
}
```

**POST /admin/pcs/bonds — body:**
```json
{
  "pc_id": 1,
  "target_type": "npc",
  "target_id": 3,
  "target_name": null,
  "admiration_axis": "admiration",
  "loyalty_axis": "loyalty",
  "affection_axis": null,
  "description": "Mestre e mentora."
}
```

> `target_type`: `"pc"`, `"npc"`, `"monster"` ou `"freeform"`  
> Para `freeform`, `target_id` deve ser `null` e `target_name` obrigatório.  
> Para os demais, `target_id` é obrigatório.  
> Pelo menos um dos eixos (`admiration_axis`, `loyalty_axis`, `affection_axis`) deve ser não-nulo.

**Atributos válidos (`dexterity_die`, `insight_die`, `might_die`, `willpower_die`):**  
`"d6"`, `"d8"`, `"d10"`, `"d12"`

**Resposta de `GET /public/pcs/:id`** inclui estatísticas calculadas automaticamente:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Aria Ventworth",
    "stats": {
      "level": 10,
      "hp": 65,
      "mp": 80,
      "initiative": -1,
      "ip": 7,
      "defense": 12,
      "magic_defense": 14
    },
    "pc_capacities": {
      "hp_bonus": 5,
      "allows_martial_armor": false,
      "allows_arcane": true,
      "..."
    },
    "jobs": [...],
    "powers": [...],
    "spells": [...],
    "equipment": {...},
    "inventories": [...],
    "bonds": [...],
    "arcanas": [...]
  }
}
```

---

### Cenário `/scenario`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/public/scenario/entities` | — | Lista todas as entidades do cenário (localizações + facções + NPCs) |

---

## Formato de Respostas

Todas as respostas seguem o mesmo envelope JSON:

**Sucesso:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "PC not found"
  }
}
```

### Códigos de status HTTP

| Status | Código | Quando ocorre |
|--------|--------|---------------|
| `200` | — | Leitura bem-sucedida |
| `201` | — | Criação bem-sucedida |
| `204` | — | Deleção bem-sucedida (sem corpo) |
| `400` | `BAD_REQUEST` | Parâmetro inválido na URL ou query string |
| `400` | `BAD_REQUEST` | Valor de enum inválido no body |
| `401` | `UNAUTHORIZED` | Token ausente ou inválido |
| `404` | `NOT_FOUND` | Recurso não encontrado |
| `409` | `CONFLICT` | Recurso já existe (violação de unicidade) |
| `500` | `INTERNAL_ERROR` | Erro inesperado no servidor |

---

## Autenticação

As rotas `/admin/*` exigem um Bearer token no header `Authorization`:

```
Authorization: Bearer <API_TOKEN>
```

A comparação é feita com `timingSafeEqual` de `node:crypto` para mitigar timing attacks.

Respostas de autenticação inválida retornam `401` com o header:
```
WWW-Authenticate: Bearer realm="secure-area"
```

---

## Cache

Os endpoints públicos de dados de referência (que mudam raramente) retornam o header:

```
Cache-Control: public, max-age=300, stale-while-revalidate=60
```

Endpoints com cache habilitado: `/public/jobs`, `/public/items`, `/public/spells`, `/public/powers`, `/public/arcanas`, `/public/monsters`, `/public/locations`, `/public/factions`.

Endpoints **sem** cache: `/public/pcs/*`, `/public/sessions`, `/public/scenario/entities`, `/public/npcs/*`.

---

## Observabilidade

Cada request recebe um `requestId` único (UUID v4) gerado pelo `request-id-middleware`. Em caso de erro, o log estruturado é emitido via `console.error` com o seguinte formato:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "error": "mensagem do erro",
  "stack": "stack trace completo"
}
```

Os logs ficam disponíveis no painel da Cloudflare em **Workers → Logs** (com `observability.enabled: true` no `wrangler.jsonc`).
