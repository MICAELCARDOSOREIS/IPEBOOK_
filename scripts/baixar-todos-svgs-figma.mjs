#!/usr/bin/env node
/**
 * Extração em Lote de SVGs de Todas as Telas Android do Figma (137 Telas)
 */

import fs from "node:fs";
import path from "node:path";
import { callFigmaMcpTool } from "./figma-mcp.mjs";

const FILE_KEY = "cxEisNRzOQR6krv8Ow7HCa";
const OUTPUT_DIR = path.resolve(process.cwd(), "design-system/figma-exports/svgs");
const INVENTORY_FILE = path.resolve(process.cwd(), "design-system/telas-android-figma.md");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseScreens() {
  const content = fs.readFileSync(INVENTORY_FILE, "utf8");
  const lines = content.split("\n");
  const screens = [];

  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    const parts = line.split("|").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const titleCol = parts[0];
      const nodeIdCol = parts[1];
      if (titleCol.includes("·") && nodeIdCol.includes(":")) {
        const [code, ...nameParts] = titleCol.split("·");
        const cleanCode = code.trim();
        const cleanName = nameParts.join("·").trim();
        const cleanNodeId = nodeIdCol.replace(/`/g, "").trim();
        const slug = `${cleanCode}-${slugify(cleanName)}`;
        screens.push({
          code: cleanCode,
          name: cleanName,
          nodeId: cleanNodeId,
          slug,
          filename: `${slug}.svg`,
        });
      }
    }
  }
  return screens;
}

async function baixarSvg(url, destino) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar asset SVG (${res.status}): ${res.statusText}`);
  const content = await res.text();
  fs.writeFileSync(destino, content, "utf8");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const screens = parseScreens();
  console.log(`📋 Total de telas no inventário Android: ${screens.length}`);

  const existingFiles = new Set(fs.readdirSync(OUTPUT_DIR));

  const pending = screens.filter((s) => {
    // Verificar se já existe arquivo com o mesmo prefixo de código
    for (const f of existingFiles) {
      if (f.startsWith(`${s.code}-`) && f.endsWith(".svg")) {
        const stat = fs.statSync(path.join(OUTPUT_DIR, f));
        if (stat.size > 200) return false;
      }
    }
    return true;
  });

  console.log(`✅ Já baixados: ${screens.length - pending.length}`);
  console.log(`⏳ Faltam baixar: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log("🎉 Todos os SVGs do Android já foram baixados!");
    return;
  }

  let baixados = 0;
  let erros = 0;

  for (let i = 0; i < pending.length; i++) {
    const s = pending[i];
    const prefix = `[${i + 1}/${pending.length}] (${s.code} · ${s.name})`;
    process.stdout.write(`→ ${prefix}... `);

    let sucesso = false;
    let tentativas = 0;

    while (!sucesso && tentativas < 3) {
      tentativas++;
      try {
        const assetRes = await callFigmaMcpTool("download_assets", {
          fileKey: FILE_KEY,
          nodeId: s.nodeId,
          defaultFormat: "svg",
        });

        let svgUrl = null;
        if (assetRes?.content) {
          for (const item of assetRes.content) {
            try {
              const parsed = JSON.parse(item.text);
              if (parsed.export?.url) {
                svgUrl = parsed.export.url;
                break;
              }
            } catch {
              const match = item.text.match(/curl -f -L -o \S+ "([^"]+)"/);
              if (match) {
                svgUrl = match[1];
                break;
              }
            }
          }
        }

        if (!svgUrl) {
          throw new Error("URL de exportação SVG não encontrada na resposta do MCP.");
        }

        const destino = path.join(OUTPUT_DIR, s.filename);
        await baixarSvg(svgUrl, destino);
        const stat = fs.statSync(destino);
        console.log(`OK (${(stat.size / 1024).toFixed(1)} KB)`);
        baixados++;
        sucesso = true;
        // Intervalo suave de 600ms entre requisições
        await sleep(600);
      } catch (err) {
        if (tentativas < 3) {
          process.stdout.write(`[retry ${tentativas}] `);
          await sleep(tentativas * 2500);
        } else {
          console.log(`ERRO: ${err.message}`);
          erros++;
        }
      }
    }
  }

  console.log("\n==========================================");
  console.log(`🏁 Concluído! Baixados com sucesso: ${baixados} | Erros: ${erros}`);
  console.log(`📁 Diretório: ${OUTPUT_DIR}`);
  console.log("==========================================");
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
