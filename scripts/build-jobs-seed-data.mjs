// Script de uso único: extrai e normaliza os dados de classes (jobs), poderes
// e magias de classe do fabula_helper (fabula_helper/jsons/*.json) para
// fudb/seed/data/*.json, no formato aceito pelo gerador de seeds
// (scripts/generate-seed.mjs).
//
// Uso: node scripts/build-jobs-seed-data.mjs

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

const JOB_BOOL_FIELDS = [
    "allows_martial_armor",
    "allows_martial_shield",
    "allows_martial_ranged_weapon",
    "allows_martial_melee_weapon",
    "allows_monster_spells",
    "allows_arcane",
    "allows_rituals",
    "can_start_projects",
    "can_cooking",
];

const jobs = readSource("job_request.json").map((j) => {
    const job = {
        name: j.name,
        tagline: j.tagline,
        description: j.description,
        img_key: j.img_key ?? null,
        hp_bonus: j.hp_bonus ?? 0,
        mp_bonus: j.mp_bonus ?? 0,
        ip_bonus: j.ip_bonus ?? 0,
    };
    for (const field of JOB_BOOL_FIELDS) {
        job[field] = Boolean(j[field]);
    }
    return job;
});
write("jobs.json", jobs);

const jobQuestions = readSource("job_question_request.json").map((q) => ({
    job_id: q.job_id,
    question: q.question,
    sort_order: q.sort_order,
}));
write("job_questions.json", jobQuestions);

const jobAliases = readSource("job_alias_request.json").map((a) => ({
    job_id: a.job_id,
    alias: a.alias,
}));
write("job_aliases.json", jobAliases);

const jobPowers = readSource("job_power_request.json").map((p) => ({
    name: p.name,
    description: p.description,
    type: p.type,
    is_global: Boolean(p.is_global),
    max_level: p.max_level ?? 0,
    prerequisites: p.prerequisites ?? null,
    job_id: p.job_id,
}));
write("job_powers.json", jobPowers);

const jobSpells = readSource("job_spell_request.json").map((s) => ({
    name: s.name,
    description: s.description,
    job_id: s.job_id,
    is_offensive: Boolean(s.is_offensive),
    cost: s.cost,
    target: s.target,
    duration: s.duration,
}));
write("job_spells.json", jobSpells);
