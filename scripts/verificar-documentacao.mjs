#!/usr/bin/env node
// Confere se as métricas ATUAIS documentadas batem com o repositório (regra de sincronia do AGENTS.md).
// Só verifica o bloco "Conferência atual" e a Seção 1 de docs/estado.md e o parágrafo de abertura do
// README.md: as demais linhas do estado são crônica de entregas, cujos números históricos mudam a cada spec.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Números em português usam ponto como separador de milhar: "2.047" -> 2047. */
function paraNumero(texto) {
  return Number(texto.replace(/\./g, ""));
}

function listar(dir, regex) {
  const encontrados = [];
  for (const entrada of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      encontrados.push(...listar(caminho, regex));
    } else if (regex.test(entrada.name)) {
      encontrados.push(caminho);
    }
  }
  return encontrados;
}

const reais = {
  "arquivos de teste": listar("tests", /\.test\.tsx?$/).length,
  "arquivos de código": listar("src", /\.tsx?$/).length,
  "rotas em src/app": listar("src/app", /\.tsx$/).length,
  migrações: readdirSync(join(raiz, "supabase", "migrations")).filter((n) => n.endsWith(".sql")).length,
  specs: readdirSync(join(raiz, "specs"), { withFileTypes: true }).filter((d) => /^\d{3}-/.test(d.name)).length,
  ADRs: readdirSync(join(raiz, "docs", "adr")).filter((n) => /^\d{4}-.+\.md$/.test(n)).length,
};

// O total de testes vem do relatório do Vitest, produzido pelo mesmo executador da suíte de cobertura.
// Sem relatório (clonagem recente, checagem isolada) o total não é conferido; os demais números são.
const relatorioTestes = join(raiz, "coverage", "relatorio-testes.json");
if (existsSync(relatorioTestes)) {
  reais.testes = JSON.parse(readFileSync(relatorioTestes, "utf8")).numTotalTests;
}

const verificacoes = [
  { rotulo: "testes em arquivos", regex: /([\d.]+) testes em ([\d.]+) arquivos/g, campos: ["testes", "arquivos de teste"] },
  { rotulo: "migrações", regex: /([\d.]+) de ([\d.]+) migrações/g, campos: ["migrações", "migrações"] },
  { rotulo: "rotas estáticas", regex: /([\d.]+) rotas estáticas/g, campos: ["rotas em src/app"] },
  { rotulo: "arquitetura limpa", regex: /([\d.]+) arquivos com arquitetura limpa/g, campos: ["arquivos de código"] },
  { rotulo: "specs e ADRs", regex: /([\d.]+) specs e ([\d.]+) ADRs/g, campos: ["specs", "ADRs"] },
];

function trechos(doc) {
  const texto = readFileSync(join(raiz, doc), "utf8");
  const blocos = [];
  const atual = texto.match(/^Conferência atual:.*$/m);
  if (atual) blocos.push({ origem: `${doc} (Conferência atual)`, texto: atual[0] });
  const secao1 = texto.match(/^## 1\. Estado Verificado em Execução[\s\S]*?(?=^## )/m);
  if (secao1) blocos.push({ origem: `${doc} (Seção 1)`, texto: secao1[0] });
  if (!atual && !secao1) blocos.push({ origem: `${doc} (abertura)`, texto: texto.split("\n").slice(0, 6).join("\n") });
  return blocos;
}

const falhas = [];
for (const doc of ["docs/estado.md", "README.md"]) {
  for (const bloco of trechos(doc)) {
    for (const { rotulo, regex, campos } of verificacoes) {
      regex.lastIndex = 0;
      let achado = regex.exec(bloco.texto);
      while (achado !== null) {
        for (const [i, campo] of campos.entries()) {
          if (reais[campo] === undefined) continue;
          const documentado = paraNumero(achado[i + 1]);
          if (documentado !== reais[campo]) {
            falhas.push(`${bloco.origem}: ${rotulo} documentado como ${achado[i + 1]}, mas o repositório tem ${reais[campo]}.`);
          }
        }
        achado = regex.exec(bloco.texto);
      }
    }
  }
}

if (falhas.length) {
  console.error(falhas.join("\n"));
  console.error("\nAtualize a conferência atual do documento (não as entradas históricas da crônica).");
  process.exit(1);
}

console.log(
  `Documentação sincronizada: ${reais.testes ?? "??"} testes em ${reais["arquivos de teste"]} arquivos, ` +
    `${reais.migrações} migrações, ${reais["rotas em src/app"]} rotas, ${reais.specs} specs, ${reais.ADRs} ADRs.`,
);
