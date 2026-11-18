#!/usr/bin/env node

/**
 * Executa localmente os mesmos passos do workflow `.github/workflows/validacao.yml`
 * para validar o código antes de enviar alterações ao GitHub.
 *
 * Modos:
 * - padrão (`npm run ci:local`): bateria completa do CI/CD (tipos, lint, checagens, SQL,
 *   Jest com cobertura V8, sincronia documental, build Web e suíte E2E Chrome CDP).
 * - `--rapido` (`npm run ci:rapido`): checagens rápidas usadas no `pre-commit`.
 */

import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cpus, totalmem } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NPM_BIN = process.platform === "win32" ? "npm.cmd" : "npm";
const args = new Set(process.argv.slice(2));
const MODO_RAPIDO = args.has("--rapido") || args.has("--fast");
const AVISO_PUSH = args.has("--aviso-push");

const ENV_WEB_MEMORIA = {
  CI: "1",
  EXPO_PUBLIC_BACKEND: "memory",
  EXPO_PUBLIC_AUTH_REDIRECT_URL: "http://127.0.0.1/auth/callback",
  EXPO_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co",
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_dummy",
};

function resolverWorkersJest() {
  const manual = process.env.IPEBOOK_JEST_WORKERS;
  if (manual && /^\d+$/.test(manual) && Number(manual) > 0) {
    return manual;
  }
  const ramGb = totalmem() / 1024 ** 3;
  const nucleos = cpus().length;
  // Evita troca excessiva de memória/OOM em notebooks com vários processos abertos.
  if (!process.env.CI && (ramGb <= 14 || nucleos > 8)) {
    return String(Math.min(3, Math.max(1, nucleos - 1)));
  }
  return null;
}

function verificarAmbiente() {
  if (!existsSync(resolve(RAIZ, "node_modules"))) {
    console.error("\x1b[31m✖ node_modules não encontrado. Execute `npm ci` antes.\x1b[0m");
    process.exit(1);
  }

  if (AVISO_PUSH) {
    try {
      const pendentes = execSync("git status --porcelain --untracked-files=no", {
        cwd: RAIZ,
        encoding: "utf8",
      }).trim();
      if (pendentes.length > 0) {
        console.warn(
          "\x1b[33m⚠ Atenção: existem alterações rastreadas não commitadas no working tree.\x1b[0m",
        );
        console.warn(
          "\x1b[33m  Os testes validam o diretório atual, enquanto o push envia apenas commits já gravados.\x1b[0m\n",
        );
      }
    } catch {
      // Ignora caso seja executado fora de um repositório Git padrão.
    }
  }
}

function criarEtapas() {
  const etapasRapidas = [
    { nome: "Verificar tipagem TypeScript", args: ["run", "typecheck"] },
    { nome: "Verificar lint (Biome)", args: ["run", "lint"] },
    { nome: "Verificar conformidade arquitetural (7 camadas MVVM)", args: ["run", "check:architecture"] },
    { nome: "Verificar Design System (tokens, contraste e acessibilidade)", args: ["run", "check:design-system"] },
    { nome: "Verificar numeração de specs e ADRs", args: ["run", "check:numbering"] },
    { nome: "Verificar configuração de build e publicação Web", args: ["run", "check:build-config"] },
  ];

  if (MODO_RAPIDO) {
    return etapasRapidas;
  }

  const workersJest = resolverWorkersJest();
  const argsJest = workersJest
    ? ["run", "test:coverage", "--", `--maxWorkers=${workersJest}`]
    : ["run", "test:coverage"];

  return [
    ...etapasRapidas,
    { nome: "Executar testes de banco e migrações SQL (PGlite)", args: ["run", "test:sql"] },
    {
      nome: workersJest
        ? `Executar testes unitários e cobertura V8 (Jest, maxWorkers=${workersJest})`
        : "Executar testes unitários e cobertura V8 (Jest)",
      args: argsJest,
    },
    { nome: "Verificar sincronia das métricas documentadas", args: ["run", "check:docs"] },
    {
      nome: "Compilar pacote Web estático (modo memória igual à CI)",
      args: ["run", "build:web"],
      env: ENV_WEB_MEMORIA,
    },
    {
      nome: "Executar suíte E2E Web via Chrome CDP (com build isolado)",
      args: ["run", "test:e2e:build"],
      env: ENV_WEB_MEMORIA,
    },
  ];
}

function executar() {
  verificarAmbiente();
  const etapas = criarEtapas();
  const total = etapas.length;
  const inicioTotal = Date.now();
  const titulo = MODO_RAPIDO
    ? "IPEBOOK — VERIFICAÇÃO RÁPIDA LOCAL (PRÉ-COMMIT)"
    : "IPEBOOK — SIMULAÇÃO LOCAL DO CI/CD (PRÉ-PUSH)";

  console.log("==================================================");
  console.log(`  ${titulo}`);
  console.log("==================================================");

  for (let i = 0; i < total; i += 1) {
    const etapa = etapas[i];
    const inicio = Date.now();
    console.log(`\n\x1b[36m[${i + 1}/${total}] ${etapa.nome}...\x1b[0m`);

    const res = spawnSync(NPM_BIN, etapa.args, {
      cwd: RAIZ,
      stdio: ["ignore", "inherit", "inherit"],
      shell: process.platform === "win32",
      env: etapa.env ? { ...process.env, ...etapa.env } : process.env,
    });

    const duracao = ((Date.now() - inicio) / 1000).toFixed(1);
    if (res.status !== 0) {
      console.error(`\n\x1b[31m✖ Falha em [${i + 1}/${total}] ${etapa.nome} (${duracao}s).\x1b[0m`);
      console.error(
        "\x1b[31m  Validação local interrompida antes de enviar ao GitHub CI/CD.\x1b[0m",
      );
      process.exit(res.status ?? 1);
    }

    console.log(`\x1b[32m✔ [${i + 1}/${total}] ${etapa.nome} (${duracao}s)\x1b[0m`);
  }

  const duracaoTotal = ((Date.now() - inicioTotal) / 1000).toFixed(1);
  console.log("\n==================================================");
  console.log(
    `\x1b[32m✔ TODAS AS ${total} ETAPAS LOCAIS PASSARAM EM ${duracaoTotal}s!\x1b[0m`,
  );
  console.log("==================================================");
}

executar();
