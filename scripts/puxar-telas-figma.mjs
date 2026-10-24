#!/usr/bin/env node
/**
 * Script para extrair SVGs e Contexto de Design das Telas Implementadas via Figma MCP
 */

import fs from "node:fs";
import path from "node:path";
import { callFigmaMcpTool } from "./figma-mcp.mjs";

const FILE_KEY = "cxEisNRzOQR6krv8Ow7HCa";
const OUTPUT_DIR = path.resolve(process.cwd(), "design-system/figma-exports");
const SVGS_DIR = path.join(OUTPUT_DIR, "svgs");
const CONTEXT_DIR = path.join(OUTPUT_DIR, "context");

const TELAS_PRIORITARIAS = [
  { id: "9:525", nome: "02.01-inicio", titulo: "02.01 · Início", view: "src/view/home.tsx" },
  { id: "10:2", nome: "02.02-explorar", titulo: "02.02 · Explorar / Pesquisa", view: "src/view/search/search.tsx" },
  { id: "10:227", nome: "02.06-favoritos", titulo: "02.06 · Favoritos", view: "src/view/favorites/favorites.tsx" },
  { id: "12:210", nome: "04.01-anunciar-livro", titulo: "04.01 · Anunciar etapa 1 (Livro)", view: "src/view/listings/createListingStep1.tsx" },
  { id: "28:685", nome: "04.04-anunciar-fotos", titulo: "04.04 · Anunciar etapa 2 (Fotos)", view: "src/view/listings/createListingStep2.tsx" },
  { id: "12:360", nome: "04.05-anunciar-detalhes", titulo: "04.05 · Anunciar etapa 3 (Detalhes)", view: "src/view/listings/createListingStep3.tsx" },
  { id: "12:418", nome: "04.07-anuncio-publicado", titulo: "04.07 · Anúncio publicado", view: "src/view/listings/createListing.tsx" },
  { id: "149:3348", nome: "04.08-gerenciar-anuncio", titulo: "04.08 · Gerenciar anúncio", view: "src/view/listings/manageListing.tsx" },
  { id: "25:302", nome: "05.01-estante", titulo: "05.01 · Minha estante", view: "src/view/listings/myListings.tsx" },
  { id: "27:519", nome: "06.01-conversas", titulo: "06.01 · Conversas", view: "src/view/requests/NegotiationChatModal.tsx" },
  { id: "27:612", nome: "06.02-chat-negociacao", titulo: "06.02 · Chat da Negociação", view: "src/view/requests/NegotiationChatModal.tsx" },
  { id: "27:921", nome: "06.05-encontro-combinado", titulo: "06.05 · Detalhe do Pedido e Encontro", view: "src/view/requests/requestDetail.tsx" },
  { id: "25:524", nome: "07.01-meu-perfil", titulo: "07.01 · Meu perfil", view: "src/view/profile/profileHub.tsx" },
  { id: "25:812", nome: "07.04-notificacoes", titulo: "07.04 · Notificações", view: "src/view/notifications/notifications.tsx" },
  { id: "324:38", nome: "01.01-boas-vindas", titulo: "01.01 · Boas-vindas", view: "src/view/onboarding/welcome.tsx" },
  { id: "332:38", nome: "01.02-entrar", titulo: "01.02 · Entrar", view: "src/view/auth/signIn.tsx" },
  { id: "336:118", nome: "01.03-criar-conta", titulo: "01.03 · Criar conta", view: "src/view/auth/signUp.tsx" },
];

async function baixarSvg(url, destino) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar asset SVG: ${res.statusText}`);
  const content = await res.text();
  fs.writeFileSync(destino, content, "utf8");
}

async function main() {
  fs.mkdirSync(SVGS_DIR, { recursive: true });
  fs.mkdirSync(CONTEXT_DIR, { recursive: true });

  console.log(`Iniciando extração de ${TELAS_PRIORITARIAS.length} telas via Figma MCP...\n`);
  const sumario = [];

  for (const tela of TELAS_PRIORITARIAS) {
    process.stdout.write(`→ Extraindo [${tela.id}] ${tela.titulo}... `);
    try {
      // 1. Download de Assets / SVG
      const assetRes = await callFigmaMcpTool("download_assets", {
        fileKey: FILE_KEY,
        nodeId: tela.id,
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
            // regex fallback
            const match = item.text.match(/curl -f -L -o \S+ "([^"]+)"/);
            if (match) {
              svgUrl = match[1];
              break;
            }
          }
        }
      }

      const svgPath = path.join(SVGS_DIR, `${tela.nome}.svg`);
      if (svgUrl) {
        await baixarSvg(svgUrl, svgPath);
      }

      // 2. Extração de Contexto de Design (estrutura de componentes e tokens)
      const contextRes = await callFigmaMcpTool("get_design_context", {
        fileKey: FILE_KEY,
        nodeId: tela.id,
      });

      const contextText = contextRes?.content?.[0]?.text || "// sem contexto retornado";
      const contextPath = path.join(CONTEXT_DIR, `${tela.nome}.tsx`);
      fs.writeFileSync(contextPath, contextText, "utf8");

      sumario.push({
        ...tela,
        status: "OK",
        svgPath: path.relative(process.cwd(), svgPath),
        contextPath: path.relative(process.cwd(), contextPath),
      });

      console.log(`OK (SVG + Contexto salvos)`);
    } catch (err) {
      console.log(`FALHA: ${err.message}`);
      sumario.push({
        ...tela,
        status: "ERRO",
        erro: err.message,
      });
    }

    // Pequena pausa para respeitar rate limits do MCP
    await new Promise((r) => setTimeout(r, 600));
  }

  // Gera README de mapeamento
  let readme = `# Telas Exportadas do Figma via MCP

> Extraído via Figma MCP Server em ${new Date().toISOString().split("T")[0]}.
> Arquivo canônico: [IpêBook (Figma)](https://www.figma.com/design/${FILE_KEY}/Ip%C3%AABook)

| Tela | Node ID | SVG Canônico | Contexto / Layout | Arquivo no App (View) |
| --- | --- | --- | --- | --- |
`;

  for (const s of sumario) {
    if (s.status === "OK") {
      readme += `| **${s.titulo}** | \`${s.id}\` | [SVG](${path.relative(OUTPUT_DIR, path.resolve(process.cwd(), s.svgPath))}) | [Contexto](${path.relative(OUTPUT_DIR, path.resolve(process.cwd(), s.contextPath))}) | [\`${s.view}\`](../../${s.view}) |\n`;
    } else {
      readme += `| **${s.titulo}** | \`${s.id}\` | *Falha* | *Falha* | [\`${s.view}\`](../../${s.view}) |\n`;
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, "README.md"), readme, "utf8");
  console.log(`\nExtração concluída com sucesso! Sumário gerado em design-system/figma-exports/README.md`);
}

main();
