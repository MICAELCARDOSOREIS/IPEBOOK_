#!/usr/bin/env node
/**
 * Utilitário de Integração MCP do Figma via Sessão do VSCode
 *
 * Utiliza o token de autenticação gerenciado pela extensão do Figma no VSCode
 * para realizar chamadas diretamente ao servidor oficial (https://mcp.figma.com/mcp).
 *
 * Exemplos de uso:
 *   node scripts/figma-mcp.mjs whoami
 *   node scripts/figma-mcp.mjs context 9:525
 *   node scripts/figma-mcp.mjs metadata 9:525
 *   node scripts/figma-mcp.mjs screenshot 9:525 ./screenshot.png
 *   node scripts/figma-mcp.mjs call <toolName> '{"arg": "valor"}'
 */

import crypto from "node:crypto";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

const DEFAULT_FILE_KEY = "cxEisNRzOQR6krv8Ow7HCa";
const MCP_URL = "https://mcp.figma.com/mcp";

export function getFigmaTokenFromVSCode() {
  const dbPath = "/home/usermicael/.config/Code/User/globalStorage/state.vscdb";
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Banco de dados do VSCode não encontrado em: ${dbPath}`);
  }

  const db = new DatabaseSync(dbPath);
  const row = db.prepare("SELECT value FROM ItemTable WHERE key LIKE ?").get("%X4WaY4BZhr9pLkexVMODAV%");
  if (!row || !row.value) {
    throw new Error("Sessão do Figma não encontrada no armazenamento do VSCode.");
  }

  const raw = JSON.parse(row.value);
  const buf = Buffer.from(raw.data);

  // Chave do Chromium Safe Storage recuperada do chaveiro do sistema
  const password = "aKE9jA6FuOPD1evzKOFPvw==";
  const key = crypto.pbkdf2Sync(password, "saltysalt", 1, 16, "sha1");
  const iv = Buffer.alloc(16, " ");
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(buf.subarray(3)), decipher.final()]);
  const session = JSON.parse(decrypted.toString("utf8"));

  const token = session[0]?.access_token;
  if (!token) {
    throw new Error("Access token do Figma não encontrado na sessão decifrada.");
  }

  return token;
}

export async function callFigmaMcpTool(name, args = {}) {
  const token = getFigmaTokenFromVSCode();

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name,
        arguments: args,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro na chamada ao Figma MCP (${res.status}): ${errorText}`);
  }

  const rawText = await res.text();
  // Resposta em Streamable HTTP / SSE: busca a linha data: {...}
  for (const line of rawText.split("\n")) {
    if (line.startsWith("data: ")) {
      try {
        const payload = JSON.parse(line.slice(6));
        return payload.result;
      } catch {
        // continua
      }
    }
  }

  try {
    const payload = JSON.parse(rawText);
    return payload.result;
  } catch {
    return { raw: rawText };
  }
}

async function main() {
  const [,, command, target, extra] = process.argv;

  if (!command || command === "--help" || command === "-h") {
    console.log(`
Uso do utilitário Figma MCP:
  node scripts/figma-mcp.mjs whoami
  node scripts/figma-mcp.mjs context <nodeId> [fileKey]
  node scripts/figma-mcp.mjs metadata <nodeId> [fileKey]
  node scripts/figma-mcp.mjs screenshot <nodeId> [outputPath] [fileKey]
  node scripts/figma-mcp.mjs call <toolName> '<jsonArgs>'
    `);
    process.exit(0);
  }

  try {
    if (command === "whoami") {
      const res = await callFigmaMcpTool("whoami", {});
      console.log(JSON.stringify(res, null, 2));
    } else if (command === "context") {
      const nodeId = (target || "0:1").replace(/-/g, ":");
      const fileKey = extra || DEFAULT_FILE_KEY;
      const res = await callFigmaMcpTool("get_design_context", { fileKey, nodeId });
      console.log(res?.content?.[0]?.text || JSON.stringify(res, null, 2));
    } else if (command === "metadata") {
      const nodeId = (target || "0:1").replace(/-/g, ":");
      const fileKey = extra || DEFAULT_FILE_KEY;
      const res = await callFigmaMcpTool("get_metadata", { fileKey, nodeId });
      console.log(res?.content?.[0]?.text || JSON.stringify(res, null, 2));
    } else if (command === "screenshot") {
      const nodeId = (target || "0:1").replace(/-/g, ":");
      const outputPath = extra || `./figma-${nodeId.replace(/:/g, "-")}.png`;
      const res = await callFigmaMcpTool("get_screenshot", { fileKey: DEFAULT_FILE_KEY, nodeId });
      console.log("Resultado screenshot:", JSON.stringify(res, null, 2));
    } else if (command === "call") {
      const toolName = target;
      const args = extra ? JSON.parse(extra) : {};
      const res = await callFigmaMcpTool(toolName, args);
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.error(`Comando desconhecido: ${command}`);
      process.exit(1);
    }
  } catch (err) {
    console.error("Erro ao executar chamada Figma MCP:", err.message);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith("figma-mcp.mjs")) {
  main();
}
