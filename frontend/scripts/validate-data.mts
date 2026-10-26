/**
 * Valide data/cameroon.json (source canonique de l'application).
 * Usage : node scripts/validate-data.mts   (Node ≥ 22.18, typage retiré nativement)
 * Code de sortie 1 si au moins une erreur bloquante est détectée.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runDataQualityChecks } from "../src/lib/dataQuality.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "data/cameroon.json"), "utf8"));

const checks = runDataQualityChecks(data, {
  fileExists: (p: string) => existsSync(join(root, "public", p)),
});

const icon = { error: "✖", warning: "⚠", info: "ℹ" } as const;
for (const c of checks) console.log(`${icon[c.level]} [${c.level}] ${c.message}`);

const errors = checks.filter((c) => c.level === "error").length;
console.log(
  `\n${data.regions.length} régions, ${data.universities.length} universités — ${errors} erreur(s), ${
    checks.filter((c) => c.level === "warning").length
  } avertissement(s).`
);
process.exit(errors ? 1 : 0);
