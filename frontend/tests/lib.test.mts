/**
 * Tests des modules purs (sans React ni alias de chemin).
 * Usage : node --test tests/   (Node ≥ 22.18)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizeText, matchesQuery } from "../src/lib/search.ts";
import { escapeCsvCell, toCsv } from "../src/lib/export.ts";
import { weatherCodeToCondition } from "../src/lib/weather.ts";
import { runDataQualityChecks } from "../src/lib/dataQuality.ts";

const dataset = JSON.parse(
  readFileSync(new URL("../data/cameroon.json", import.meta.url), "utf8")
);

test("normalizeText retire accents, casse et espaces", () => {
  assert.equal(normalizeText("  Extrême-Nord "), "extreme-nord");
  assert.equal(normalizeText("Ngaoundéré"), "ngaoundere");
});

test("matchesQuery est insensible aux accents et accepte une requête vide", () => {
  assert.ok(matchesQuery("Université de Yaoundé I", "yaounde"));
  assert.ok(matchesQuery("Mbéré", "MBERE"));
  assert.ok(matchesQuery("Centre", ""));
  assert.ok(!matchesQuery("Centre", "nord"));
});

test("escapeCsvCell neutralise les formules et échappe les séparateurs", () => {
  assert.equal(escapeCsvCell("=HYPERLINK(1)"), "'=HYPERLINK(1)");
  assert.equal(escapeCsvCell("@cmd"), "'@cmd");
  assert.equal(escapeCsvCell(-12), "-12"); // les nombres négatifs restent des nombres
  assert.equal(escapeCsvCell('Dit "bonjour", ok'), '"Dit ""bonjour"", ok"');
  assert.equal(escapeCsvCell(["a", "b"]), "a | b");
  assert.equal(escapeCsvCell(undefined), "");
});

test("toCsv produit une ligne d'en-tête puis une ligne par objet", () => {
  const csv = toCsv([
    { region: "Centre", population: 10 },
    { region: "Sud", population: 5 },
  ]);
  assert.equal(csv, "region,population\nCentre,10\nSud,5");
  assert.equal(toCsv([]), "");
});

test("weatherCodeToCondition couvre les grandes familles WMO", () => {
  assert.equal(weatherCodeToCondition(0), "Ensoleillé");
  assert.equal(weatherCodeToCondition(2), "Partiellement nuageux");
  assert.equal(weatherCodeToCondition(45), "Nuageux");
  assert.equal(weatherCodeToCondition(63), "Pluvieux");
  assert.equal(weatherCodeToCondition(81), "Pluvieux");
  assert.equal(weatherCodeToCondition(95), "Orageux");
});

test("le jeu de données embarqué ne contient aucune erreur bloquante", () => {
  const errors = runDataQualityChecks(dataset).filter((c) => c.level === "error");
  assert.deepEqual(errors, []);
});

test("les contrôles détectent doublons, région inconnue et incohérences", () => {
  const broken = structuredClone(dataset);
  broken.regions[1].id = broken.regions[0].id;
  broken.universities[0].region = "Atlantide";
  broken.overview.totalDepartments = 1;
  const ids = runDataQualityChecks(broken)
    .filter((c) => c.level === "error")
    .map((c) => c.id);
  assert.ok(ids.includes("regions-dup-id"));
  assert.ok(ids.includes(`university-${broken.universities[0].id}-region`));
  assert.ok(ids.includes("overview-departments"));
});

test("chaque université est rattachée à une région existante", () => {
  const names = new Set(dataset.regions.map((r: { name: string }) => r.name));
  for (const u of dataset.universities) assert.ok(names.has(u.region), u.name);
});
