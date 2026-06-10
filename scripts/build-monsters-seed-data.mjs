// Script de uso único: extrai e normaliza os dados de monstros (monstros,
// traits, afinidades e ações) do fabula_helper (fabula_helper/jsons/*.json)
// para fudb/seed/data/*.json, no formato aceito pelo gerador de seeds
// (scripts/generate-seed.mjs).
//
// Uso: node scripts/build-monsters-seed-data.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(__dirname, "..", "..", "fabula_helper", "jsons");
const outputDir = join(__dirname, "..", "seed", "data");

function readSource(file) {
    return JSON.parse(readFileSync(join(sourceDir, file), "utf-8").replace(/^﻿/, ""));
}

function write(file, data) {
    const outputPath = join(outputDir, file);
    writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    console.log(`Gerado ${outputPath} com ${data.length} linhas.`);
}

const monsters = readSource("monster_request.json").map((m) => ({
    name: m.name,
    description: m.description,
    monster_type: m.monster_type,
    level: m.level,
    dexterity_die: m.dexterity_die,
    insight_die: m.insight_die,
    might_die: m.might_die,
    willpower_die: m.willpower_die,
    hp: m.hp,
    mp: m.mp,
    initiative: m.initiative,
    defense: m.defense,
    magic_defense: m.magic_defense,
    equipment: m.equipment ?? null,
    img_key: m.img_key ?? null,
    is_villain: Boolean(m.is_villain),
    ultima_points: m.ultima_point ?? 0,
    strategy: m.strategy ?? null,
    source_page: m.source_page ?? null,
}));
write("monsters.json", monsters);

const monsterTraits = readSource("monster_traits_request.json").map((t) => ({
    monster_id: t.monster_id,
    trait: t.trait,
}));
write("monster_traits.json", monsterTraits);

const AFFINITY_TYPES = ["physical", "air", "bolt", "dark", "earth", "fire", "ice", "light", "poison"];

const monsterAffinities = readSource("monster_affinities_request.json").map((a) => {
    const affinity = { monster_id: a.monster_id };
    for (const type of AFFINITY_TYPES) {
        affinity[type] = a[type] ?? "normal";
    }
    return affinity;
});
write("monster_affinities.json", monsterAffinities);

const monsterActions = readSource("monster_actions_request.json").map((a) => ({
    monster_id: a.monster_id,
    action_type: a.action_type,
    action_icon: a.action_icon ?? null,
    name: a.name,
    description: a.description,
    check_formula: a.check_formula ?? null,
    accuracy_bonus: a.accuracy_bonus ?? null,
    damage_formula: null,
    damage_type: a.damage_type ?? null,
    cost: a.cost ?? null,
    target: a.target ?? null,
    duration: a.duration ?? null,
    is_offensive: Boolean(a.is_offensive),
}));
write("monster_actions.json", monsterActions);
