import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = path.resolve("src");
const allowed = {
  app: ["view"],
  view: ["view", "viewmodel", "model"],
  viewmodel: ["viewmodel", "model", "usecase", "di"],
  usecase: ["usecase", "model"],
  model: ["model"],
  infra: ["infra", "model"],
  di: ["di", "infra", "model", "usecase"],
};
const failures = [];
let count = 0;

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) { await inspect(fullPath); continue; }
    if (!/\.tsx?$/.test(entry.name)) continue;
    count += 1;
    const relative = path.relative(root, fullPath).split(path.sep).join("/");
    const layer = relative.split("/")[0];
    if (!allowed[layer]) { failures.push(`${relative}: camada desconhecida.`); continue; }
    const source = ts.createSourceFile(fullPath, await readFile(fullPath, "utf8"), ts.ScriptTarget.Latest, true);
    function checkImport(specifier) {
      let target;
      if (specifier.startsWith("@/")) target = specifier.slice(2);
      else if (specifier.startsWith(".")) target = path.relative(root, path.resolve(path.dirname(fullPath), specifier));
      else {
        if (["model", "usecase"].includes(layer)) failures.push(`${relative}: dependência externa proibida (${specifier}).`);
        return;
      }
      const destination = target.split(/[\\/]/)[0];
      if (!allowed[layer].includes(destination)) failures.push(`${relative}: importação de ${specifier} viola a camada.`);
      if (destination === "infra" && layer !== "infra" && relative !== "di/container.ts") failures.push(`${relative}: infraestrutura deve ser composta somente no container.`);
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) checkImport(node.moduleSpecifier.text);
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
        const argument = node.arguments[0];
        if (argument && ts.isStringLiteral(argument)) checkImport(argument.text);
        else failures.push(`${relative}: importação dinâmica não verificável.`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}

for (const layer of Object.keys(allowed)) await readdir(path.join(root, layer));
await inspect(root);
if (count === 0) failures.push("Nenhum arquivo de aplicação foi verificado.");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`Arquitetura: ${count} arquivos verificados, sem violações de imports.`);
