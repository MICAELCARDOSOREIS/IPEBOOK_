#!/usr/bin/env node

/**
 * Script de verificação de release e prontidão para entrega pré-deploy.
 * Executa todas as checagens técnicas fundamentais do Ipebook em ordem cronológica estrita.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT_DIR = resolve(process.cwd());

function logPass(msg) {
  console.log(`\x1b[32m✔ [PASS]\x1b[0m ${msg}`);
}

function logFail(msg) {
  console.error(`\x1b[31m✖ [FAIL]\x1b[0m ${msg}`);
}

function runStep(title, command) {
  console.log(`\n\x1b[36m▶ Executando:\x1b[0m ${title}...`);
  try {
    execSync(command, { stdio: "inherit", cwd: ROOT_DIR });
    logPass(title);
  } catch (error) {
    logFail(`${title} falhou com código de erro.`);
    process.exit(1);
  }
}

console.log("==================================================");
console.log("   IPEBOOK — VERIFICAÇÃO DE RELEASE E PRÉ-DEPLOY   ");
console.log("==================================================");

// 1. Verificação de Integridade de Variáveis de Ambiente
console.log("\n\x1b[36m▶ Verificando documentação de variáveis de ambiente (.env.example)...\x1b[0m");
const envExamplePath = resolve(ROOT_DIR, ".env.example");
if (!existsSync(envExamplePath)) {
  logFail(".env.example não foi encontrado.");
  process.exit(1);
}
const envContent = readFileSync(envExamplePath, "utf-8");
const requiredVars = [
  "EXPO_PUBLIC_BACKEND",
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_AUTH_REDIRECT_URL",
];

for (const variable of requiredVars) {
  if (!envContent.includes(variable)) {
    logFail(`Variável obrigatória ${variable} não documentada em .env.example.`);
    process.exit(1);
  }
}
logPass("Todas as variáveis de ambiente essenciais estão presentes no .env.example.");

// 2. Verificação de Tipos TypeScript
runStep("Verificação estrita de tipos TypeScript", "npm run typecheck");

// 3. Verificação de Integridade Arquitetural
runStep("Barreiras arquiteturais em 7 camadas (scripts/verificar-arquitetura.mjs)", "npm run check:architecture");

// 4. Verificação de Migrações SQL e Políticas RLS (PostgreSQL via PGlite)
runStep("Migrações de banco e segurança RLS (scripts/verificar-migracoes.mjs)", "npm run test:sql");

// 5. Suíte de Testes Automatizados
runStep("Testes automatizados unitários e de integração", "npm test");

// 6. Build Estático para Web (Cloudflare Pages)
runStep("Compilação estática do pacote Web (expo export --platform web)", "npm run build:web");

// 7. Verificação dos Artefatos em dist/
console.log("\n\x1b[36m▶ Verificando artefatos gerados em dist/...\x1b[0m");
const distDir = resolve(ROOT_DIR, "dist");
const requiredDistFiles = [
  "index.html",
  "manifest.json",
  "_headers",
  "_redirects",
];

for (const file of requiredDistFiles) {
  const filePath = resolve(distDir, file);
  if (!existsSync(filePath)) {
    logFail(`Arquivo de distribuição obrigatório dist/${file} não foi gerado.`);
    process.exit(1);
  }
}
logPass("Todos os artefatos estáticos de Web e PWA estão presentes e íntegros em dist/.");

console.log("\n==================================================");
console.log("\x1b[32m✔ TODAS AS ETAPAS DE RELEASE FORAM APROVADAS COM SUCESSO!\x1b[0m");
console.log("==================================================");
