#!/usr/bin/env node
// Falha quando duas specs (`specs/NNN-*`) ou dois ADRs (`docs/adr/NNNN-*.md`) usam o mesmo número.
// Evita a colisão recorrente entre PRs paralelos (ver docs/estado.md, higiene de numeração).
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Agrupa nomes pelo prefixo numérico e devolve só os números repetidos. */
function encontrarDuplicados(nomes, padrao) {
  const porNumero = new Map();
  for (const nome of nomes) {
    const m = padrao.exec(nome);
    if (!m) continue;
    const lista = porNumero.get(m[1]) ?? [];
    lista.push(nome);
    porNumero.set(m[1], lista);
  }
  return [...porNumero].filter(([, lista]) => lista.length > 1);
}

function verificar(rotulo, nomes, padrao) {
  const duplicados = encontrarDuplicados(nomes, padrao);
  for (const [numero, lista] of duplicados) {
    console.error(`${rotulo} ${numero} repetido: ${lista.join(", ")}`);
  }
  return duplicados.length;
}

const specs = readdirSync(join(raiz, "specs"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const adrs = readdirSync(join(raiz, "docs", "adr")).filter((n) => n.endsWith(".md"));

const falhas =
  verificar("Spec", specs, /^(\d{3})-/) + verificar("ADR", adrs, /^(\d{4})-/);

if (falhas > 0) {
  console.error("Renumere usando o próximo número livre (ver CONTRIBUTING.md).");
  process.exit(1);
}
console.log(`Numeração: ${specs.length} specs e ${adrs.length} ADRs sem colisão.`);
