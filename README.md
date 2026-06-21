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
- [Upload de Imagens (Cloudinary)](#upload-de-imagens-cloudinary)
- [Banco de Dados e Migrations](#banco-de-dados-e-migrations)
- [Seed de Dados Globais](#seed-de-dados-globais)
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

A API possui quatro contextos de acesso:

| Prefixo           | Auth                                | Descrição                                            |
| ----------------- | ----------------------------------- | ---------------------------------------------------- |
| `/v1/public/*`    | —                                   | Endpoints de leitura, sem autenticação               |
| `/v1/admin/*`     | Bearer token estático (`API_TOKEN`) | Endpoints de escrita administrativos                 |
| `/v1/auth/*`      | —                                   | Registro e login de usuários                         |
| `/v1/pcs/:pcId/*` | JWT do dono do PC                   | Modificação de relações do próprio PC                |
| `/v1/campaigns/*` | JWT de membro da campanha           | Endpoints de campanha (leitura e escrita contextual) |

---

## Stack

| Tecnologia                                                                                       | Uso                                |
| ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| [Cloudflare Workers](https://workers.cloudflare.com/)                                            | Runtime serverless/edge            |
| [Cloudflare D1](https://developers.cloudflare.com/d1/)                                           | Banco de dados SQLite na edge      |
| [Hono](https://hono.dev/)                                                                        | Framework HTTP                     |
| [TypeScript](https://www.typescriptlang.org/)                                                    | Linguagem principal                |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/)                                  | CLI de desenvolvimento e deploy    |
| [Vitest](https://vitest.dev/)                                                                    | Framework de testes                |
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
├── schemas/         # Validação de entrada/saída por domínio (Zod)
└── types/           # Tipos globais (Env, Variables)
```

### Fluxo de uma requisição

```
Request HTTP
    ↓
cors-middleware → request-id-middleware
    ↓
[adminAuthMiddleware]     — apenas /v1/admin/*  (Bearer API_TOKEN)
[userAuthMiddleware]      — /v1/pcs/* e /v1/campaigns/*  (JWT)
[pcOwnerMiddleware]       — /v1/pcs/:pcId/*  (valida pcs.user_id === userId)
[campaignMemberMiddleware]— /v1/campaigns/*  (valida membership e role)
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

### Secrets obrigatórios

**Em produção** (via Wrangler):

```bash
npx wrangler secret put API_TOKEN   # token estático das rotas /admin
npx wrangler secret put JWT_SECRET  # chave de assinatura dos tokens de usuário
```

**Em desenvolvimento local**, crie o arquivo `.dev.vars` na raiz do projeto:

```env
API_TOKEN=seu_token_local_aqui
JWT_SECRET=sua_chave_jwt_local_aqui

# Cookie de sessão — substitua os valores de produção do wrangler.jsonc
# para o ambiente local (HTTP não aceita Secure=true)
AUTH_COOKIE_ENABLED=true
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAMESITE=Lax
```

| Secret / Var               | Tipo           | Uso                                                                                                                        |
| -------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `API_TOKEN`                | Secret         | Autenticação das rotas `/v1/admin/*` (Bearer token estático)                                                               |
| `JWT_SECRET`               | Secret         | Assinatura e verificação dos tokens JWT de usuário                                                                         |
| `AUTH_COOKIE_ENABLED`      | Var            | `"true"` habilita `Set-Cookie` no login e leitura via cookie no middleware                                                 |
| `AUTH_COOKIE_SECURE`       | Var            | `"true"` em produção (HTTPS), `"false"` em dev local (HTTP)                                                                |
| `AUTH_COOKIE_SAMESITE`     | Var            | `Lax` (padrão e recomendado quando front e back estão no mesmo domínio registrável)                                        |
| `AUTH_COOKIE_NAME`         | Var (opcional) | Nome do cookie — padrão `"token"`                                                                                          |
| `AUTH_COOKIE_DOMAIN`       | Var (opcional) | Atributo `Domain=` do cookie — omitir para cookie host-only (mais restritivo)                                              |
| `AUTH_COOKIE_MAX_AGE`      | Var (opcional) | `Max-Age` em segundos — padrão `2592000` (30 dias, igual ao JWT)                                                           |
| `CLOUDINARY_CLOUD_NAME`    | Var            | Cloud name da conta Cloudinary usada para upload de imagens de entidades de campanha                                       |
| `CLOUDINARY_API_KEY`       | Secret         | API key do Cloudinary — viaja para o navegador na resposta da assinatura, mas fica como secret por ser específica da conta |
| `CLOUDINARY_API_SECRET`    | Secret         | API secret do Cloudinary — usado só no servidor para gerar a assinatura; nunca exposto ao cliente                          |
| `CLOUDINARY_UPLOAD_PRESET` | Var            | Nome do upload preset assinado (configurado no painel do Cloudinary) usado nos uploads                                     |

> O arquivo `.dev.vars` é ignorado pelo git e nunca deve ser commitado.
> Os valores de produção de `AUTH_COOKIE_*` e `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_UPLOAD_PRESET` (não sensíveis) ficam em `wrangler.jsonc` no bloco `vars`. `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` são configurados em produção via `npx wrangler secret put <nome>`.

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

## Upload de Imagens (Cloudinary)

Entidades criadas dentro de uma campanha (NPC, PC, monstro, item, local, facção) podem ter uma imagem enviada pelo próprio usuário, em vez de usar apenas as imagens fixas empacotadas no frontend. A coluna `img_key` (já existente em todas essas tabelas, sem necessidade de migration) passa a guardar uma URL completa do Cloudinary em vez de uma chave de asset estático.

### Por que upload assinado direto (signed direct upload)

O binário do arquivo vai **direto do navegador para o Cloudinary** — nunca passa pelo Worker. O FUDB só gera uma assinatura de curta duração. Isso evita custo de CPU/banda no Worker, risco de bater limite de tamanho de request do Workers, e a `CLOUDINARY_API_SECRET` nunca é exposta ao cliente (só o resultado assinado).

```
[Cliente] --1. pede assinatura--> [POST /v1/campaigns/:campaignId/uploads/signature]
[Cliente] <--2. {timestamp, signature, api_key, cloud_name, upload_preset, folder}--
[Cliente] --3. POST direto, multipart-------------> [api.cloudinary.com/v1_1/.../image/upload]
[Cliente] <--4. {secure_url, public_id, ...}---------------------------------------
[Cliente] --5. salva img_key = secure_url no create/update da entidade--> [FUDB]
```

### `POST /v1/campaigns/:campaignId/uploads/signature`

| Auth                   | Descrição                                       |
| ---------------------- | ----------------------------------------------- |
| JWT membro da campanha | Gera uma assinatura de upload para o Cloudinary |

**Query param `entity_type`** (opcional): `npc`, `pc`, `monster`, `item`, `location`, `faction` — usado só para organizar pastas no Cloudinary (`fu-wiki/campaigns/:campaignId/:entity_type`); valor inválido/ausente cai em `"misc"`.

Aberto a qualquer membro (não só master), porque PC é criado pelo próprio jogador — a permissão de fato continua sendo validada pelo endpoint de criação/edição de cada entidade, não aqui. Como cada assinatura permite um upload real ao Cloudinary mesmo sem vincular a entidade nenhuma, o endpoint tem **rate limit de 10 requisições/minuto por usuário** (binding `UPLOAD_RATE_LIMITER`, configurado em `wrangler.jsonc` → `ratelimits`) — excedido, retorna `429 TOO_MANY_REQUESTS`.

**Resposta (200):**

```json
{
	"success": true,
	"data": {
		"timestamp": 1781875504,
		"signature": "...",
		"api_key": "...",
		"cloud_name": "dprfwwjz9",
		"upload_preset": "fu_preset",
		"folder": "fu-wiki/campaigns/2/npc"
	}
}
```

A assinatura é gerada por `src/utils/cloudinary-signature.ts` (`buildCloudinarySignature`): ordena os parâmetros alfabeticamente, monta `key=value&key=value`, concatena o `CLOUDINARY_API_SECRET` direto no final (sem separador — é o algoritmo do Cloudinary, não HMAC) e calcula o SHA-1 hexadecimal via Web Crypto.

### Configuração no painel do Cloudinary

1. Crie uma conta gratuita em [cloudinary.com](https://cloudinary.com) (sem cartão).
2. Em **Settings → Upload → Upload presets**, crie um preset com `Signing Mode: Signed`, `Allowed formats: png,jpg,jpeg,webp` e um limite de tamanho/transformação de redimensionamento, se desejar.
3. Anote o **Cloud name**, **API Key**, **API Secret** e o **nome do preset** — são os 4 valores das variáveis acima.

### Limitações conhecidas

Trocar ou remover a imagem de uma entidade não exclui o asset antigo no Cloudinary (ficaria ocupando a cota gratuita). Para um volume baixo de uso isso não é um problema a curto prazo; uma melhoria futura seria guardar o `public_id` (exigiria uma coluna nova) e chamar a API de destroy do Cloudinary no update/delete.

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

| Tabela               | Descrição                                          |
| -------------------- | -------------------------------------------------- |
| `sessions`           | Sessões de jogo jogadas                            |
| `items`              | Itens do jogo (armas, armaduras, acessórios, etc.) |
| `jobs`               | Profissões/Classes dos personagens                 |
| `job_powers`         | Poderes associados às profissões                   |
| `job_power_jobs`     | Relação N:N entre poderes e profissões             |
| `job_questions`      | Perguntas de background por profissão              |
| `job_aliases`        | Nomes alternativos de profissões                   |
| `arcanas`            | Arcanas do sistema                                 |
| `spells`             | Feitiços (associados a profissões)                 |
| `locations`          | Localizações do cenário                            |
| `factions`           | Facções do cenário                                 |
| `faction_locations`  | Relação entre facções e locais                     |
| `monsters`           | Inimigos e criaturas                               |
| `monster_traits`     | Características especiais de monstros              |
| `monster_affinities` | Afinidades elementares de monstros                 |
| `monster_actions`    | Ações disponíveis para monstros                    |
| `npcs`               | Personagens não-jogáveis                           |
| `npc_special_rules`  | Regras especiais de NPCs                           |
| `npc_inventory`      | Inventário de NPCs                                 |
| `npc_equipment`      | Equipamento de NPCs                                |
| `pcs`                | Personagens jogáveis                               |
| `pc_jobs`            | Relação PC ↔ Profissão (com nível)                 |
| `pc_powers`          | Poderes adquiridos pelo PC                         |
| `pc_spells`          | Feitiços aprendidos pelo PC                        |
| `pc_arcanas`         | Arcanas vinculadas ao PC                           |
| `pc_equipment`       | Equipamento equipado pelo PC                       |
| `pc_inventory`       | Inventário do PC                                   |
| `pc_bonds`           | Vínculos do PC com outros personagens              |
| `pc_monster_spells`  | Feitiços de monstros que o PC pode usar            |

---

## Seed de Dados Globais

Após resetar o banco (migrations zeradas), os dados globais e independentes de campanha — itens, classes (jobs, poderes, feitiços), arcanas e monstros (com traits, afinidades e ações) — podem ser repovoados via scripts de seed em `seed/`.

### Estrutura

```
seed/
├── data/   # JSON curado (fonte da verdade), normalizado a partir do fabula_helper
└── sql/    # SQL gerado (INSERT OR IGNORE), versionado e numerado (001-012)
```

Os seeds são **idempotentes**: usam `INSERT OR IGNORE`, então rodar múltiplas vezes não duplica dados. Relações (ex.: `job_power_jobs`, `job_spells.job_id`) são resolvidas por **nome natural** via subquery (`SELECT id FROM jobs WHERE name = ...`), não por ID fixo.

### Comandos

```bash
# Aplicar migrations antes da seed (cria as tabelas)
npm run db:migrate:local   # ou db:migrate:remote

# (Opcional) Regerar seed/sql/*.sql a partir de seed/data/*.json
npm run seed:generate

# Aplicar a seed
npm run seed:local    # banco local
npm run seed:remote   # banco remoto
```

### Regenerando os dados a partir do fabula_helper

Os arquivos `seed/data/*.json` foram extraídos e normalizados a partir de `fabula_helper/jsons/*.json` pelos scripts:

```bash
node scripts/build-items-seed-data.mjs    # itens (armas, armaduras, escudos, acessórios, artefatos)
node scripts/build-jobs-seed-data.mjs     # jobs, perguntas, aliases, poderes, feitiços
node scripts/build-monsters-seed-data.mjs # monstros, traits, afinidades, ações
```

Esses scripts aplicam normalizações necessárias (ex.: `damage_type` PT→EN, correção do typo `duas_mao`→`duas_maos`, `distancia`→`a_distancia`, `ultima_point`→`ultima_points`). Só precisam ser executados novamente se os arquivos de origem em `fabula_helper/jsons/` mudarem.

---

## Rodando Localmente

```bash
# Inicia o servidor de desenvolvimento (hot reload)
npm run dev
```

O servidor ficará disponível em `http://localhost:8787`.

Para testar um endpoint público:

```bash
curl http://localhost:8787/v1/public/jobs
```

Para testar um endpoint admin:

```bash
curl -H "Authorization: Bearer seu_token_local_aqui" \
  http://localhost:8787/v1/admin/jobs \
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
- `buildCloudinarySignature` — assinatura de upload, validada contra uma implementação de referência independente (SHA-1 via `node:crypto`)
- `handleAppError` — tradução de violação de FOREIGN KEY do D1 para 400, comportamento de `AppError` conhecido e fallback genérico de 500
- `logAuthorizationDenied` — formato do log estruturado emitido nas negações de autorização
- `isInvitationExpired` — comparação de `expires_at` (formato SQLite, sem timezone) contra o horário atual, incluindo o caso `null` (convites antigos sem TTL retroativo)

### Testes de integração

Rodam no ambiente real do Cloudflare Workers (via Miniflare) com um banco D1 local em memória. As migrations são aplicadas automaticamente antes dos testes.

```bash
npm run test:integration
```

Cobertura atual:

- `D1JobRepository` — criação, leitura, busca por IDs, detecção de duplicata
- `D1PCBondRepository` — criação e leitura de vínculos com campos `id` e `img_key`
- Middlewares de autorização (`userAuthMiddleware`, `campaignMemberMiddleware`, `pcOwnerMiddleware`) — autenticação ausente/inválida, usuário não-membro da campanha, edição de PC por quem não é o dono, e a regressão do isolamento entre campanhas no `PUT /v1/campaigns/:campaignId/pcs/:pcId` (um master só pode editar PCs vinculados à própria campanha), incluindo o log estruturado emitido em cada negação
- Atomicidade de operações multi-tabela — criação de PC com relações reverte por completo se uma falhar (FK inexistente), update de monstro não apaga traits antigos quando o payload novo é inválido
- Rate limit do endpoint de assinatura de upload — 10 requisições/minuto por usuário, sem afetar outros usuários
- TTL de convites de campanha — convite expirado não pode ser aceito/recusado, não aparece na lista do convidado e não bloqueia o master de reenviar

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
│   ├── schemas/                       # Validação de entrada/saída por domínio (Zod)
│   └── utils/
│       ├── jwt.ts                     # Assinatura/verificação de JWT (Web Crypto)
│       ├── password.ts                # Hash de senha (PBKDF2)
│       ├── cloudinary-signature.ts    # Assinatura de upload do Cloudinary (SHA-1)
│       └── security-log.ts            # Log estruturado de negações de autorização (403 cross-tenant)
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

| Método | Rota | Auth | Descrição                               |
| ------ | ---- | ---- | --------------------------------------- |
| `GET`  | `/`  | —    | Retorna `{ message: "API is running" }` |

---

### Sessões `/sessions`

| Método   | Rota                                 | Auth | Descrição                     |
| -------- | ------------------------------------ | ---- | ----------------------------- |
| `GET`    | `/v1/public/sessions`                | —    | Lista todas as sessões        |
| `GET`    | `/v1/public/sessions/:sessionNumber` | —    | Busca sessão por número       |
| `POST`   | `/v1/admin/sessions`                 | ✅   | Cria uma nova sessão          |
| `PUT`    | `/v1/admin/sessions/:sessionNumber`  | ✅   | Atualiza uma sessão existente |
| `DELETE` | `/v1/admin/sessions/:sessionNumber`  | ✅   | Remove uma sessão             |

**POST /v1/admin/sessions — body:**

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

| Método | Rota                         | Auth | Descrição                  |
| ------ | ---------------------------- | ---- | -------------------------- |
| `GET`  | `/v1/public/items`           | —    | Lista todos os itens       |
| `GET`  | `/v1/public/items/:itemName` | —    | Busca item pelo nome exato |
| `POST` | `/v1/admin/items`            | ✅   | Cria um novo item          |

**Tipos de item (`item_type`):** `arma`, `armadura`, `escudo`, `acessorio`, `artefato`, `outros`

**POST /v1/admin/items — body (arma):**

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

**POST /v1/admin/items — body (armadura):**

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

| Método | Rota                       | Auth | Descrição                                          |
| ------ | -------------------------- | ---- | -------------------------------------------------- |
| `GET`  | `/v1/public/jobs`          | —    | Lista profissões (com suporte a `?include=`)       |
| `GET`  | `/v1/public/jobs/catalog`  | —    | Lista resumida de profissões                       |
| `GET`  | `/v1/public/jobs/:id`      | —    | Busca profissão por ID (com suporte a `?include=`) |
| `POST` | `/v1/admin/jobs`           | ✅   | Cria uma nova profissão                            |
| `POST` | `/v1/admin/jobs/questions` | ✅   | Adiciona pergunta de background a uma profissão    |
| `POST` | `/v1/admin/jobs/aliases`   | ✅   | Adiciona nome alternativo a uma profissão          |

**Query param `?include=`** para `/v1/public/jobs` e `/v1/public/jobs/:id`:

| Valor        | Descrição                                      |
| ------------ | ---------------------------------------------- |
| `background` | Inclui perguntas e aliases da profissão        |
| `powers`     | Inclui poderes da profissão                    |
| `spells`     | Inclui feitiços e arcanas (se `allows_arcane`) |

Exemplo: `GET /v1/public/jobs/1?include=powers,spells`

**POST /v1/admin/jobs — body:**

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

| Método | Rota                | Auth | Descrição                                  |
| ------ | ------------------- | ---- | ------------------------------------------ |
| `GET`  | `/v1/public/powers` | —    | Lista todos os poderes com suas profissões |
| `POST` | `/v1/admin/powers`  | ✅   | Cria um novo poder                         |

**POST /v1/admin/powers — body:**

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

| Método | Rota                | Auth | Descrição               |
| ------ | ------------------- | ---- | ----------------------- |
| `GET`  | `/v1/public/spells` | —    | Lista todos os feitiços |
| `POST` | `/v1/admin/spells`  | ✅   | Cria um novo feitiço    |

**POST /v1/admin/spells — body:**

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

| Método | Rota                 | Auth | Descrição              |
| ------ | -------------------- | ---- | ---------------------- |
| `GET`  | `/v1/public/arcanas` | —    | Lista todas as arcanas |
| `POST` | `/v1/admin/arcanas`  | ✅   | Cria uma nova arcana   |

**POST /v1/admin/arcanas — body:**

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

| Método | Rota                       | Auth | Descrição                   |
| ------ | -------------------------- | ---- | --------------------------- |
| `GET`  | `/v1/public/locations`     | —    | Lista todas as localizações |
| `GET`  | `/v1/public/locations/:id` | —    | Busca localização por ID    |
| `POST` | `/v1/admin/locations`      | ✅   | Cria uma nova localização   |

---

### Facções `/factions`

| Método | Rota                             | Auth | Descrição              |
| ------ | -------------------------------- | ---- | ---------------------- |
| `GET`  | `/v1/public/factions`            | —    | Lista todas as facções |
| `GET`  | `/v1/public/factions/:factionId` | —    | Busca facção por ID    |
| `POST` | `/v1/admin/factions`             | ✅   | Cria uma nova facção   |

---

### Monstros `/monsters`

| Método | Rota                            | Auth | Descrição                                           |
| ------ | ------------------------------- | ---- | --------------------------------------------------- |
| `GET`  | `/v1/public/monsters`           | —    | Lista todos os monstros                             |
| `GET`  | `/v1/public/monsters/summary`   | —    | Lista resumo dos monstros                           |
| `GET`  | `/v1/public/monsters/:id`       | —    | Busca monstro por ID (com suporte a `?include=`)    |
| `GET`  | `/v1/public/monsters/actions`   | —    | Lista ações de monstros (com suporte a `?include=`) |
| `POST` | `/v1/admin/monsters`            | ✅   | Cria um novo monstro                                |
| `POST` | `/v1/admin/monsters/traits`     | ✅   | Adiciona trait a um monstro                         |
| `POST` | `/v1/admin/monsters/affinities` | ✅   | Adiciona afinidade a um monstro                     |
| `POST` | `/v1/admin/monsters/actions`    | ✅   | Adiciona ação a um monstro                          |

**Query param `?include=`** para `/v1/public/monsters/:id`:  
`traits`, `affinities`, `actions`

**Query param `?include=`** para `/v1/public/monsters/actions`:  
`basic_attack`, `spell`, `other_action`, `special_rule`

---

### NPCs `/npcs`

| Método | Rota                       | Auth | Descrição                                    |
| ------ | -------------------------- | ---- | -------------------------------------------- |
| `GET`  | `/v1/public/npcs/summary`  | —    | Lista resumo de todos os NPCs                |
| `GET`  | `/v1/public/npcs/:id`      | —    | Busca NPC por ID (com suporte a `?include=`) |
| `POST` | `/v1/admin/npcs`           | ✅   | Cria um novo NPC                             |
| `POST` | `/v1/admin/npcs/special`   | ✅   | Adiciona regra especial a um NPC             |
| `POST` | `/v1/admin/npcs/inventory` | ✅   | Adiciona item ao inventário de um NPC        |
| `POST` | `/v1/admin/npcs/equipment` | ✅   | Define equipamento de um NPC                 |

**Query param `?include=`** para `/v1/public/npcs/:id`:  
`rules`, `inventories`, `equipments`

---

### Personagens Jogáveis

#### Leitura pública

| Método | Rota                     | Auth | Descrição                    |
| ------ | ------------------------ | ---- | ---------------------------- |
| `GET`  | `/v1/public/pcs/summary` | —    | Lista resumo de todos os PCs |
| `GET`  | `/v1/public/pcs/:id`     | —    | Busca PC completo por ID     |

#### Criação (contexto de campanha)

A criação de um PC é feita dentro de uma campanha. O `user_id` é inferido do JWT — nunca vem do body.

| Método | Rota                            | Auth       | Descrição                                    |
| ------ | ------------------------------- | ---------- | -------------------------------------------- |
| `POST` | `/v1/campaigns/:campaignId/pcs` | JWT membro | Cria PC e vincula à campanha automaticamente |

**Body:**

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

#### Relações do PC (dono ou super_user)

Rotas protegidas por `userAuthMiddleware` + `pcOwnerMiddleware`. Retornam `403` se o JWT não pertencer ao dono do PC. O `pc_id` vai na URL — não no body.

| Método | Rota                           | Auth     | Descrição                         |
| ------ | ------------------------------ | -------- | --------------------------------- |
| `POST` | `/v1/pcs/:pcId/jobs`           | JWT dono | Vincula profissão ao PC           |
| `POST` | `/v1/pcs/:pcId/powers`         | JWT dono | Vincula poder ao PC               |
| `POST` | `/v1/pcs/:pcId/spells`         | JWT dono | Vincula feitiço ao PC             |
| `POST` | `/v1/pcs/:pcId/arcanas`        | JWT dono | Vincula arcana ao PC              |
| `POST` | `/v1/pcs/:pcId/equipments`     | JWT dono | Define equipamento do PC          |
| `POST` | `/v1/pcs/:pcId/inventories`    | JWT dono | Adiciona item ao inventário do PC |
| `POST` | `/v1/pcs/:pcId/bonds`          | JWT dono | Cria vínculo do PC                |
| `POST` | `/v1/pcs/:pcId/monster-spells` | JWT dono | Vincula feitiço de monstro ao PC  |

**POST /v1/pcs/:pcId/jobs — body:**

```json
{
	"job_id": 2,
	"level": 5,
	"ignore_hp_bonus": false,
	"ignore_mp_bonus": false
}
```

**POST /v1/pcs/:pcId/bonds — body:**

```json
{
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

#### Quem pode modificar relações de um PC

| Perfil             | Pode? | Como                             |
| ------------------ | ----- | -------------------------------- |
| Dono do PC         | ✅    | JWT com `pcs.user_id === userId` |
| Super-user         | ✅    | JWT com `isSuperUser === true`   |
| Master de campanha | ❌    | Sem acesso às rotas `/v1/pcs/*`  |
| Outro jogador      | ❌    |                                  |

**Atributos válidos (`dexterity_die`, `insight_die`, `might_die`, `willpower_die`):**  
`"d6"`, `"d8"`, `"d10"`, `"d12"`

**Resposta de `GET /v1/public/pcs/:id`** inclui estatísticas calculadas automaticamente:

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

| Método | Rota                           | Auth | Descrição                                                           |
| ------ | ------------------------------ | ---- | ------------------------------------------------------------------- |
| `GET`  | `/v1/public/scenario/entities` | —    | Lista todas as entidades do cenário (localizações + facções + NPCs) |

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

| Status | Código              | Quando ocorre                                                                           |
| ------ | ------------------- | --------------------------------------------------------------------------------------- |
| `200`  | —                   | Leitura bem-sucedida                                                                    |
| `201`  | —                   | Criação bem-sucedida                                                                    |
| `204`  | —                   | Deleção bem-sucedida (sem corpo)                                                        |
| `400`  | `BAD_REQUEST`       | Parâmetro inválido na URL ou query string                                               |
| `400`  | `BAD_REQUEST`       | Valor de enum inválido no body                                                          |
| `400`  | `BAD_REQUEST`       | Referência a um ID inexistente (violação de FOREIGN KEY no D1, ex.: `job_id` inválido)  |
| `400`  | `BAD_REQUEST`       | Convite de campanha expirado (`campaign_invitations.expires_at` passado, TTL de 7 dias) |
| `401`  | `UNAUTHORIZED`      | Token ausente ou inválido                                                               |
| `404`  | `NOT_FOUND`         | Recurso não encontrado                                                                  |
| `409`  | `CONFLICT`          | Recurso já existe (violação de unicidade)                                               |
| `429`  | `TOO_MANY_REQUESTS` | Rate limit excedido (ex.: assinaturas de upload — ver seção de Upload de Imagens)       |
| `500`  | `INTERNAL_ERROR`    | Erro inesperado no servidor                                                             |

---

## Autenticação

### Bearer token estático — rotas `/v1/admin/*`

```
Authorization: Bearer <API_TOKEN>
```

A comparação é feita com `timingSafeEqual` de `node:crypto` para mitigar timing attacks. Respostas inválidas retornam `401` com o header:

```
WWW-Authenticate: Bearer realm="secure-area"
```

### JWT de usuário — rotas `/v1/pcs/*` e `/v1/campaigns/*`

O token JWT é obtido via `POST /v1/auth/login` e pode ser enviado de dois modos (suportados em paralelo):

**Modo 1 — cookie HttpOnly (padrão para clientes browser):**

O cookie `token` é definido automaticamente pelo backend no login (quando `AUTH_COOKIE_ENABLED=true`) e enviado pelo navegador em cada requisição — nenhum código JavaScript toca no JWT. Este é o modo mais seguro: o cookie é `HttpOnly; Secure; SameSite=Lax`, portanto inacessível a scripts maliciosos (XSS não consegue exfiltrar o token).

**Modo 2 — header Authorization: Bearer (para clientes não-browser):**

```
Authorization: Bearer <JWT>
```

O `userAuthMiddleware` aceita ambos os modos, com prioridade para o header `Authorization` quando presente. Se ausente e `AUTH_COOKIE_ENABLED=true`, lê o token do cookie. Se nenhum dos dois estiver presente, retorna `401`.

O middleware verifica a assinatura com `JWT_SECRET`, confirma que o usuário ainda existe no banco e injeta `userId`, `userEmail` e `isSuperUser` nas variáveis do contexto Hono.

**Endpoints de autenticação:**

| Método | Rota                | Auth | Descrição                                                     |
| ------ | ------------------- | ---- | ------------------------------------------------------------- |
| `POST` | `/v1/auth/register` | —    | Cria uma conta de usuário comum (sem `is_super_user`)         |
| `POST` | `/v1/auth/login`    | —    | Autentica, retorna JWT no corpo e seta cookie de sessão       |
| `POST` | `/v1/auth/logout`   | —    | Invalida o cookie de sessão (`Set-Cookie: token=; Max-Age=0`) |

**POST /v1/auth/register — body:**

```json
{ "email": "usuario@exemplo.com", "name": "Nome", "nickname": "apelido", "password": "senha123" }
```

**Resposta (201):**

```json
{ "success": true, "data": { "message": "Cadastro realizado com sucesso." } }
```

**POST /v1/auth/login — body:**

```json
{ "email": "usuario@exemplo.com", "password": "senha123" }
```

**Resposta (200):** retorna token e dados do usuário. Quando `AUTH_COOKIE_ENABLED=true`, também emite `Set-Cookie: token=<JWT>; HttpOnly; Secure; SameSite=Lax; Path=/`.

```json
{ "success": true, "data": { "token": "<JWT>", "user": { "id": 1, "email": "...", "name": "..." } } }
```

**Erro de credenciais (401):** código estável para o cliente identificar o tipo de falha:

```json
{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "E-mail ou senha inválidos." } }
```

### Autorização de ownership — rotas `/v1/pcs/:pcId/*`

O `pcOwnerMiddleware` (aplicado após `userAuthMiddleware`) verifica que `pcs.user_id` é igual ao `userId` do JWT. Super-users passam sem verificação. Retorna `404` se o PC não existir, `403` se não for o dono.

---

## Cache

Os endpoints públicos de dados de referência (que mudam raramente) retornam o header:

```
Cache-Control: public, max-age=300, stale-while-revalidate=60
```

Endpoints com cache habilitado: `/v1/public/jobs`, `/v1/public/items`, `/v1/public/spells`, `/v1/public/powers`, `/v1/public/arcanas`, `/v1/public/monsters`, `/v1/public/locations`, `/v1/public/factions`.

Endpoints **sem** cache: `/v1/public/pcs/*`, `/v1/public/sessions`, `/v1/public/scenario/entities`, `/v1/public/npcs/*`.

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
