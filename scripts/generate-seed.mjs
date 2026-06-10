// Gera arquivos .sql de seed (idempotentes, INSERT OR IGNORE) a partir dos
// dados curados em seed/data/*.json.
//
// Uso: node scripts/generate-seed.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "seed", "data");
const sqlDir = join(__dirname, "..", "seed", "sql");

function sqlValue(value) {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "boolean") return value ? "1" : "0";
    if (typeof value === "number") return String(value);
    return `'${String(value).replace(/'/g, "''")}'`;
}

// Resolve uma FK pelo nome natural da entidade referenciada via subquery,
// evitando depender de IDs fixos (que mudam conforme a ordem de inserção).
function fkByName(table, name) {
    return `(SELECT id FROM ${table} WHERE name = ${sqlValue(name)})`;
}

function resolveColumn(row, column) {
    if (typeof column === "string") {
        return { name: column, value: sqlValue(row[column]) };
    }
    return { name: column.name, value: fkByName(column.fk, column.value(row)) };
}

function generateInserts(table, columns, rows) {
    return rows
        .map((row) => {
            const resolved = columns.map((column) => resolveColumn(row, column));
            const names = resolved.map((c) => c.name);
            const values = resolved.map((c) => c.value);
            return `INSERT OR IGNORE INTO ${table} (${names.join(", ")}) VALUES (${values.join(", ")});`;
        })
        .join("\n") + "\n";
}

const SEEDS = [
    {
        output: "001_arcanas.sql",
        table: "arcanas",
        data: "arcanas.json",
        columns: ["name", "domain", "merge_effect", "dismiss_effect", "special_rule"],
    },
    {
        output: "002_items.sql",
        table: "items",
        data: "items.json",
        columns: [
            "name",
            "item_type",
            "description",
            "img_key",
            "cost",
            "weapon_category",
            "accuracy",
            "damage",
            "damage_type",
            "grip",
            "distance",
            "defense_dice",
            "defense_bonus",
            "magic_defense_dice",
            "magic_defense_bonus",
            "initiative",
            "is_martial",
        ],
    },
    {
        output: "003_jobs.sql",
        table: "jobs",
        data: "jobs.json",
        columns: [
            "name",
            "tagline",
            "description",
            "img_key",
            "hp_bonus",
            "mp_bonus",
            "ip_bonus",
            "allows_martial_armor",
            "allows_martial_shield",
            "allows_martial_ranged_weapon",
            "allows_martial_melee_weapon",
            "allows_monster_spells",
            "allows_arcane",
            "allows_rituals",
            "can_start_projects",
            "can_cooking",
        ],
    },
    {
        output: "004_job_questions.sql",
        table: "job_questions",
        data: "job_questions.json",
        columns: [
            { name: "job_id", fk: "jobs", value: (row) => row.job_id },
            "question",
            "sort_order",
        ],
    },
    {
        output: "005_job_aliases.sql",
        table: "job_aliases",
        data: "job_aliases.json",
        columns: [
            { name: "job_id", fk: "jobs", value: (row) => row.job_id },
            "alias",
        ],
    },
    {
        output: "006_job_powers.sql",
        table: "job_powers",
        data: "job_powers.json",
        columns: ["name", "description", "type", "is_global", "max_level", "prerequisites"],
    },
    {
        output: "007_job_power_jobs.sql",
        table: "job_power_jobs",
        data: "job_powers.json",
        expand: (rows) =>
            rows.flatMap((power) =>
                (power.job_id ?? []).map((jobName) => ({ job_name: jobName, power_name: power.name })),
            ),
        columns: [
            { name: "job_id", fk: "jobs", value: (row) => row.job_name },
            { name: "power_id", fk: "job_powers", value: (row) => row.power_name },
        ],
    },
    {
        output: "008_job_spells.sql",
        table: "job_spells",
        data: "job_spells.json",
        columns: [
            "name",
            "description",
            { name: "job_id", fk: "jobs", value: (row) => row.job_id },
            "is_offensive",
            "cost",
            "target",
            "duration",
        ],
    },
    {
        output: "009_monsters.sql",
        table: "monsters",
        data: "monsters.json",
        columns: [
            "name",
            "description",
            "monster_type",
            "level",
            "dexterity_die",
            "insight_die",
            "might_die",
            "willpower_die",
            "hp",
            "mp",
            "initiative",
            "defense",
            "magic_defense",
            "equipment",
            "img_key",
            "is_villain",
            "ultima_points",
            "strategy",
            "source_page",
        ],
    },
    {
        output: "010_monster_traits.sql",
        table: "monster_traits",
        data: "monster_traits.json",
        columns: [
            { name: "monster_id", fk: "monsters", value: (row) => row.monster_id },
            "trait",
        ],
    },
    {
        output: "011_monster_affinities.sql",
        table: "monster_affinities",
        data: "monster_affinities.json",
        columns: [
            { name: "monster_id", fk: "monsters", value: (row) => row.monster_id },
            "physical",
            "air",
            "bolt",
            "dark",
            "earth",
            "fire",
            "ice",
            "light",
            "poison",
        ],
    },
    {
        output: "012_monster_actions.sql",
        table: "monster_actions",
        data: "monster_actions.json",
        columns: [
            { name: "monster_id", fk: "monsters", value: (row) => row.monster_id },
            "action_type",
            "action_icon",
            "name",
            "description",
            "check_formula",
            "accuracy_bonus",
            "damage_formula",
            "damage_type",
            "cost",
            "target",
            "duration",
            "is_offensive",
        ],
    },
];

for (const seed of SEEDS) {
    let rows = JSON.parse(readFileSync(join(dataDir, seed.data), "utf-8"));
    if (seed.expand) rows = seed.expand(rows);
    const header = `-- Gerado automaticamente por scripts/generate-seed.mjs a partir de seed/data/${seed.data}\n-- Não editar manualmente.\n\n`;
    const sql = header + generateInserts(seed.table, seed.columns, rows);
    writeFileSync(join(sqlDir, seed.output), sql, "utf-8");
    console.log(`Gerado seed/sql/${seed.output} (${rows.length} linhas)`);
}
