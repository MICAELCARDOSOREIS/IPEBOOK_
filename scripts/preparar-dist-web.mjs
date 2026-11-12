#!/usr/bin/env node
// Ajusta `dist/` depois do `expo export` para publicação no Cloudflare Pages (ADR 0065).
// 1. O wrangler ignora pastas `node_modules`, então as fontes em `assets/node_modules/` nunca
//    eram publicadas. Elas passam para `assets/vendor/` e as referências são reescritas.
// 2. Sem `404.html`, o Pages responde 200 com o HTML do app para arquivos inexistentes, e o
//    cabeçalho `immutable` de `/_expo/static/*` faz a borda guardar esse HTML no lugar do JS.
import { copyFileSync, existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const origem = "assets/node_modules/";
const destino = "assets/vendor/";

/** Lista os arquivos de `dir` recursivamente. */
function listar(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? listar(caminho) : [caminho];
  });
}

if (!existsSync(dist)) {
  console.error("dist/ não encontrado; rode `expo export --platform web` antes.");
  process.exit(1);
}

const pastaOrigem = join(dist, origem);
if (existsSync(pastaOrigem)) {
  renameSync(pastaOrigem, join(dist, destino));
}

let reescritos = 0;
for (const arquivo of listar(dist)) {
  if (!/\.(html|js|css|json)$/.test(arquivo)) continue;
  let conteudo = readFileSync(arquivo, "utf8");
  let mudou = false;
  if (conteudo.includes(origem)) {
    conteudo = conteudo.replaceAll(origem, destino);
    mudou = true;
  }
  if (arquivo.endsWith(".html") && conteudo.includes('<link rel="icon" href="/favicon.ico"/>')) {
    conteudo = conteudo.replaceAll(
      '<link rel="icon" href="/favicon.ico"/>',
      '<link rel="icon" href="/favicon.ico?v=2"/>',
    );
    mudou = true;
  }
  if (arquivo.endsWith(".html") && !conteudo.includes('property="og:')) {
    const fallbackOg = [
      '<meta property="og:site_name" content="IpêBook Piripiri"/>',
      '<meta property="og:type" content="website"/>',
      '<meta property="og:title" content="IpêBook · Circulação Comunitária de Livros em Piripiri"/>',
      '<meta property="og:description" content="Compre, troque ou receba livros sob a florada do Ipê em Piripiri, PI. Negociação direta e pontos de encontro seguros!"/>',
      '<meta property="og:image" content="https://ipebook.app/icone-512.png"/>',
      '<meta property="og:image:width" content="512"/>',
      '<meta property="og:image:height" content="512"/>',
      '<meta name="twitter:card" content="summary"/>',
      '<meta name="twitter:title" content="IpêBook · Livros em Piripiri"/>',
      '<meta name="twitter:description" content="Marketplace comunitário de livros em Piripiri, PI (venda, troca e doação)."/>',
      '<meta name="twitter:image" content="https://ipebook.app/icone-512.png"/>',
    ].join("");
    conteudo = conteudo.replace("</head>", `${fallbackOg}</head>`);
    mudou = true;
  }
  if (mudou) {
    writeFileSync(arquivo, conteudo);
    reescritos += 1;
  }
}

const naoEncontrado = join(dist, "+not-found.html");
if (existsSync(naoEncontrado)) {
  copyFileSync(naoEncontrado, join(dist, "404.html"));
}

const restantes = listar(dist).filter((arquivo) => arquivo.includes(`${join("dist", "assets", "node_modules")}`));
if (restantes.length > 0) {
  console.error(`Ainda há ${restantes.length} arquivo(s) em assets/node_modules.`);
  process.exit(1);
}
console.log(`dist/ preparado: ${reescritos} arquivo(s) com referências reescritas para ${destino}.`);
