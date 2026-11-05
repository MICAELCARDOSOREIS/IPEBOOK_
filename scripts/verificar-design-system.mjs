#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const raiz = resolve(import.meta.dirname, "..");
const falhas = [];

function conferir(descricao, ok, detalhe) {
  if (ok) {
    console.log(`\x1b[32m✔\x1b[0m ${descricao}`);
  } else {
    falhas.push(`${descricao} — ${detalhe}`);
    console.error(`\x1b[31m✖\x1b[0m ${descricao} — ${detalhe}`);
  }
}

function ler(caminho) {
  return readFileSync(join(raiz, caminho), "utf8");
}

function json(caminho) {
  return JSON.parse(ler(caminho));
}

function luminancia(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((valor) => Number.parseInt(valor, 16) / 255)
    .map((valor) => (valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contraste(primeiro, segundo) {
  const a = luminancia(primeiro);
  const b = luminancia(segundo);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function arquivosTsx(dir, acumulado = []) {
  for (const entrada of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const caminho = `${dir}/${entrada.name}`;
    if (entrada.isDirectory()) arquivosTsx(caminho, acumulado);
    else if (entrada.name.endsWith(".tsx")) acumulado.push(caminho);
  }
  return acumulado;
}

const tokens = json("design-system/tokens.json");
const tokenPorNome = new Map(tokens.color.tokens.map((token) => [token.name, token.value]));
const tokensTs = ler("src/view/tokens.ts");
const readme = ler("design-system/README.md");
const acessibilidade = ler("design-system/06-acessibilidade.md");
const componentesDir = join(raiz, "design-system/04-componentes");
const componentes = readdirSync(componentesDir).filter((arquivo) => arquivo.endsWith(".md"));

console.log("\x1b[36m▶ Tokens canônicos\x1b[0m");
for (const nome of ["primary", "secondary-container", "on-secondary-container", "focus-ring", "surface"]) {
  const token = tokenPorNome.get(nome);
  conferir(`Token ${nome} existe no JSON`, Boolean(token), "token ausente em tokens.json");
  if (token) {
    conferir(
      `Token ${nome} claro aparece no espelho TypeScript`,
      tokensTs.toLowerCase().includes(token.light.toLowerCase()),
      `valor ${token.light} não encontrado em src/view/tokens.ts`,
    );
  }
}
conferir("JSON declara os temas claro e escuro", tokens.color.themes.some((tema) => tema.id === "light") && tokens.color.themes.some((tema) => tema.id === "dark"), "temas incompletos");
conferir("README declara tokens.json como fonte canônica", readme.includes("Fonte canônica") || ler("design-system/02-tokens.md").includes("Fonte canônica"), "governança dos tokens não documentada");

console.log("\x1b[36m▶ Contraste documentado\x1b[0m");
const pares = [
  ["on-surface", "surface", 4.5],
  ["on-surface-variant", "surface", 4.5],
  ["error", "surface", 4.5],
  ["focus-ring", "surface", 3],
  ["on-secondary-container", "secondary-container", 4.5],
  ["on-doacao-container", "doacao-container", 4.5],
];
for (const [texto, fundo, minimo] of pares) {
  const textoToken = tokenPorNome.get(texto)?.light;
  const fundoToken = tokenPorNome.get(fundo)?.light;
  const valor = textoToken && fundoToken ? contraste(textoToken, fundoToken) : 0;
  conferir(`Contraste ${texto} sobre ${fundo}`, valor >= minimo, `razão calculada ${valor.toFixed(2)}; mínimo ${minimo}`);
  conferir(`Contraste ${texto} documentado`, acessibilidade.includes(textoToken ?? "__ausente__") && acessibilidade.includes(fundoToken ?? "__ausente__"), "par ausente na documentação");
}

console.log("\x1b[36m▶ Inventário e exemplos\x1b[0m");
conferir("Inventário declara 28 documentos", componentes.length === 28, `encontrados ${componentes.length}`);
conferir("README declara 28 componentes", readme.includes("28 componentes"), "contagem desatualizada");
const exemplo = ler("design-system/ExplorarScreen.tsx");
conferir("Exemplo histórico usa aliases M3 válidos", exemplo.includes("tokens.colors.m3.surfaceContainerHigh") && exemplo.includes("tokens.colors.m3.surfaceContainerLow"), "alias inexistente usado no exemplo");
conferir("Exports do Figma são classificados como históricos", ler("design-system/figma-exports/README.md").includes("fallbacks de tokens históricos"), "limitação não documentada");

console.log("\x1b[36m▶ Barreira de acessibilidade dos modais\x1b[0m");
const modaisSemBarreira = arquivosTsx("src/view").filter((caminho) => {
  const fonte = ler(caminho);
  // "<Modal" seguido de espaço, ">" ou "/" — não confunde com <ModalityCoverArea e afins.
  return /<Modal[\s>/]/.test(fonte) && !fonte.includes("accessibilityViewIsModal");
});
conferir(
  "Todo <Modal> declara accessibilityViewIsModal",
  modaisSemBarreira.length === 0,
  modaisSemBarreira.length === 0 ? "todos os modais barreados" : `${modaisSemBarreira.length} arquivo(s): ${modaisSemBarreira.join(", ")}`,
);

if (falhas.length > 0) {
  console.error(`\n${falhas.length} verificação(ões) falharam.`);
  process.exitCode = 1;
} else {
  console.log("\nDesign system: todas as verificações passaram.");
}
