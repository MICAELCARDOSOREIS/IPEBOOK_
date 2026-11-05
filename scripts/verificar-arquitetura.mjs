import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = path.resolve("src");
const allowed = {
  app: ["view"],
  view: ["view", "viewmodel", "model", "di"],
  viewmodel: ["viewmodel", "model", "usecase"],
  usecase: ["usecase", "model"],
  model: ["model"],
  infra: ["infra", "model"],
  di: ["di", "infra", "model", "usecase", "viewmodel"],
};

// Spec 126 / ADR 0098 (T001): lista de exceções decrescente (catraca) para viewmodel -> @/di.
const VIEWMODEL_DI_EXCEPTIONS = new Set([
  "viewmodel/errorReporting.ts",
  "viewmodel/useAuthViewModel.ts",
  "viewmodel/useBetaSignupViewModel.ts",
  "viewmodel/useBlockedUsersViewModel.ts",
  "viewmodel/useBookDetailViewModel.ts",
  "viewmodel/useChatWithUser.ts",
  "viewmodel/useConversationsViewModel.ts",
  "viewmodel/useDeleteAccountViewModel.ts",
  "viewmodel/useDeliveryViewModel.ts",
  "viewmodel/useInviteFriendsViewModel.ts",
  "viewmodel/useListingPhotoViewModel.ts",
  "viewmodel/useMeetingViewModel.ts",
  "viewmodel/useModerationViewModel.ts",
  "viewmodel/useMyListingsViewModel.ts",
  "viewmodel/useNavigationBadgesViewModel.ts",
  "viewmodel/useNegotiationChatViewModel.ts",
  "viewmodel/useNegotiationRatingViewModel.ts",
  "viewmodel/useNetworkStatus.ts",
  "viewmodel/useNotificationPreferencesViewModel.ts",
  "viewmodel/useNotificationsViewModel.ts",
  "viewmodel/useProfilePhotoViewModel.ts",
  "viewmodel/useProfileSafetyViewModel.ts",
  "viewmodel/useProfileViewModel.ts",
  "viewmodel/usePublicProfileViewModel.ts",
  "viewmodel/usePushRegistration.ts",
  "viewmodel/usePwaViewModel.ts",
  "viewmodel/useReceivedRatingsViewModel.ts",
  "viewmodel/useReceivedRequestsViewModel.ts",
  "viewmodel/useReportListingViewModel.ts",
  "viewmodel/useReportUserViewModel.ts",
  "viewmodel/useRequestDetailViewModel.ts",
  "viewmodel/useRequestNegotiationViewModel.ts",
  "viewmodel/useResetPasswordViewModel.ts",
  "viewmodel/useScheduleMeetingViewModel.ts",
  "viewmodel/useSentRequestsViewModel.ts",
  "viewmodel/useSettingsViewModel.ts",
  "viewmodel/useShareListingViewModel.ts",
  "viewmodel/useThemeViewModel.ts",
  "viewmodel/useUserMeetingsViewModel.ts",
  "viewmodel/useUserPreferencesViewModel.ts",
]);
const seenViewModelDiImports = new Set();

// Spec 126 (T003): teto de linhas por arquivo de tela em src/view/ com catraca para as 5 telas acima de 900 linhas.
const VIEW_FILE_LINE_CEILING = 900;
const VIEW_SIZE_EXCEPTIONS = new Map([
  ["view/home.tsx", 1385],
  ["view/profile/profileHub.tsx", 1110],
  ["view/listings/bookDetail.tsx", 1110],
  ["view/requests/scheduleMeeting.tsx", 1070],
  ["view/conversations/chat.tsx", 905],
]);
const seenOversizedViews = new Set();

// Spec 126 (T002 / T017): teto de ocorrências de `.parent!` em tests/components*.
const MAX_COMPONENT_TEST_PARENT_USAGES = 0;

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
    const content = await readFile(fullPath, "utf8");
    if (layer === "view") {
      const lineCount = content.split("\n").length;
      if (lineCount > VIEW_FILE_LINE_CEILING) {
        seenOversizedViews.add(relative);
        const cap = VIEW_SIZE_EXCEPTIONS.get(relative);
        if (cap === undefined) {
          failures.push(`${relative}: ${lineCount} linhas excede o teto de ${VIEW_FILE_LINE_CEILING} linhas (Spec 126 E2).`);
        } else if (lineCount > cap) {
          failures.push(`${relative}: ${lineCount} linhas excede a catraca máxima registrada de ${cap} linhas (Spec 126 E2).`);
        }
      }
    }
    const source = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);
    function checkImport(specifier, node) {
      let target;
      if (specifier.startsWith("@/")) target = specifier.slice(2);
      else if (specifier.startsWith(".")) target = path.relative(root, path.resolve(path.dirname(fullPath), specifier));
      else {
        if (["model", "usecase"].includes(layer)) failures.push(`${relative}: dependência externa proibida (${specifier}).`);
        return;
      }
      const destination = target.split(/[\\/]/)[0];
      if (layer === "viewmodel" && destination === "di") {
        seenViewModelDiImports.add(relative);
        if (!VIEWMODEL_DI_EXCEPTIONS.has(relative)) {
          const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
          failures.push(`${relative}:${line}: importação de ${specifier} viola ADR 0098 (viewmodel não deve importar @/di).`);
        }
        return;
      }
      if (!allowed[layer].includes(destination)) failures.push(`${relative}: importação de ${specifier} viola a camada.`);
      if (destination === "infra" && layer !== "infra" && relative !== "di/container.ts") failures.push(`${relative}: infraestrutura deve ser composta somente no container.`);
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) checkImport(node.moduleSpecifier.text, node);
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
        const argument = node.arguments[0];
        if (argument && ts.isStringLiteral(argument)) checkImport(argument.text, node);
        else failures.push(`${relative}: importação dinâmica não verificável.`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}

async function inspectComponentTestsForParent(directory) {
  let parentUsages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      parentUsages = parentUsages.concat(await inspectComponentTestsForParent(fullPath));
      continue;
    }
    if (!/\.test\.tsx?$/.test(entry.name)) continue;
    const content = await readFile(fullPath, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes(".parent!")) {
        const rel = path.relative(path.resolve("."), fullPath).split(path.sep).join("/");
        parentUsages.push(`${rel}:${idx + 1}`);
      }
    });
  }
  return parentUsages;
}

for (const layer of Object.keys(allowed)) await readdir(path.join(root, layer));
await inspect(root);

for (const exempted of VIEWMODEL_DI_EXCEPTIONS) {
  if (!seenViewModelDiImports.has(exempted)) {
    failures.push(`${exempted}: já não importa @/di; remova da lista VIEWMODEL_DI_EXCEPTIONS em scripts/verificar-arquitetura.mjs.`);
  }
}
for (const [exempted] of VIEW_SIZE_EXCEPTIONS) {
  if (!seenOversizedViews.has(exempted)) {
    failures.push(`${exempted}: já está abaixo de ${VIEW_FILE_LINE_CEILING} linhas; remova de VIEW_SIZE_EXCEPTIONS em scripts/verificar-arquitetura.mjs.`);
  }
}

const componentTestDirs = [path.resolve("tests/components"), path.resolve("tests/components-mocked")];
let allParentUsages = [];
for (const dir of componentTestDirs) {
  allParentUsages = allParentUsages.concat(await inspectComponentTestsForParent(dir));
}
if (allParentUsages.length > MAX_COMPONENT_TEST_PARENT_USAGES) {
  failures.push(
    `Uso proibido de .parent! em testes de componente (${allParentUsages.length} > ${MAX_COMPONENT_TEST_PARENT_USAGES}): ${allParentUsages.join(", ")}`,
  );
}

if (count === 0) failures.push("Nenhum arquivo de aplicação foi verificado.");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`Arquitetura: ${count} arquivos verificados, sem violações de imports.`);
