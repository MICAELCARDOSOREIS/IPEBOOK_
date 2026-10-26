#!/usr/bin/env node
// Verificação de prontidão da configuração nativa e de release do Ipebook (CA da Spec 074).
// Falha com código 1 quando qualquer invariante de build estiver quebrado, para que o
// `npm run validate` e a CI impeçam a integração. Não requer o Expo rodando: lê os arquivos.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const falhas = [];

/** Registra um achado: passa em silêncio, falha com mensagem objetiva. */
function conferir(descricao, ok, detalhe) {
  if (ok) {
    console.log(`\x1b[32m✔\x1b[0m ${descricao}`);
  } else {
    falhas.push(`${descricao} — ${detalhe}`);
    console.log(`\x1b[31m✖\x1b[0m ${descricao} — ${detalhe}`);
  }
}

function lerJson(caminho) {
  return JSON.parse(readFileSync(join(raiz, caminho), "utf-8"));
}

/** Largura e altura de um PNG lidas do cabeçalho IHDR (bytes 16-23), sem dependência externa. */
function dimensoesPng(caminho) {
  const buffer = readFileSync(join(raiz, caminho));
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return null;
  return { largura: buffer.readUInt32BE(16), altura: buffer.readUInt32BE(20) };
}

const app = lerJson("app.json").expo;
const manifest = lerJson("public/manifest.json");
const eas = lerJson("eas.json");

console.log("\x1b[36m▶ Identidade do aplicativo (pré-requisito de qualquer build nativo)\x1b[0m");
conferir(
  "android.package definido",
  typeof app.android?.package === "string" && /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(app.android.package),
  `android.package está "${app.android?.package}" — precisa ser um identificador de domínio invertido (ex.: com.ipebook.app).`,
);
conferir(
  "android.versionCode é inteiro positivo",
  Number.isInteger(app.android?.versionCode) && app.android.versionCode >= 1,
  `versionCode = ${app.android?.versionCode} — a Play Store exige inteiro ≥ 1 e crescente.`,
);
conferir(
  "ios.bundleIdentifier igual ao package Android",
  !app.ios?.bundleIdentifier || app.ios.bundleIdentifier === app.android?.package,
  `iOS usa "${app.ios?.bundleIdentifier}" e Android usa "${app.android?.package}" — identidades divergentes confundem a loja e o suporte.`,
);
conferir(
  "expo.version presente e no formato x.y.z",
  /^\d+\.\d+\.\d+$/.test(String(app.version)),
  `version = ${app.version}.`,
);
conferir(
  "scheme definido para link profundo (ipebook://)",
  typeof app.scheme === "string" && app.scheme.length > 0,
  "sem `scheme` o link de redefinição de senha não abre o app no Android.",
);

console.log("\n\x1b[36m▶ Cores da marca consistentes entre app.json e o manifesto PWA\x1b[0m");
conferir(
  "web.themeColor == manifest.theme_color",
  app.web?.themeColor === manifest.theme_color,
  `app.json traz "${app.web?.themeColor}" e public/manifest.json traz "${manifest.theme_color}" — a barra do navegador sairia numa cor que não é a da marca.`,
);
conferir(
  "web.backgroundColor == manifest.background_color",
  app.web?.backgroundColor === manifest.background_color,
  `app.json traz "${app.web?.backgroundColor}" e public/manifest.json traz "${manifest.background_color}".`,
);

console.log("\n\x1b[36m▶ Config plugins nativos exigidos pelas bibliotecas em uso\x1b[0m");
const plugins = (app.plugins ?? []).map((p) => (Array.isArray(p) ? p[0] : p));
for (const necessario of ["expo-camera", "expo-notifications"]) {
  conferir(
    `plugin ${necessario} registrado`,
    plugins.includes(necessario),
    `${necessario} é usado em runtime; sem o plugin o \`expo prebuild\` não gera permissões nem recursos nativos e a funcionalidade quebra no app instalado.`,
  );
}
const pluginCamera = (app.plugins ?? []).find((p) => (Array.isArray(p) ? p[0] : p) === "expo-camera");
conferir(
  "expo-camera sem permissão de áudio e com justificativa em português",
  Array.isArray(pluginCamera) &&
    pluginCamera[1]?.recordAudioAndroid === false &&
    typeof pluginCamera[1]?.cameraPermission === "string",
  "o leitor de ISBN não grava áudio: a permissão deve ser mínima, e a frase de justificativa é exigência da Play Store.",
);

console.log("\n\x1b[36m▶ Assets nativos presentes e com tamanho mínimo de loja\x1b[0m");
const assetsEsperados = [
  ["icon", app.icon, 512],
  ["android.adaptiveIcon.foregroundImage", app.android?.adaptiveIcon?.foregroundImage, 432],
  ["assets/android-icon-monochrome.png", app.android?.adaptiveIcon?.monochromeImage, 432],
  ["splash.image", app.splash?.image, 512],
];
for (const [rotulo, caminho, minimo] of assetsEsperados) {
  if (!caminho) {
    conferir(rotulo, false, "não declarado no app.json.");
    continue;
  }
  const arquivo = caminho.startsWith("./") ? caminho.slice(2) : caminho;
  if (!existsSync(join(raiz, arquivo))) {
    conferir(rotulo, false, `arquivo ${arquivo} não existe.`);
    continue;
  }
  const dim = dimensoesPng(arquivo);
  conferir(
    `${rotulo} (${arquivo}) com no mínimo ${minimo}px`,
    dim !== null && dim.largura >= minimo && dim.altura >= minimo,
    dim ? `${dim.largura}x${dim.altura}px` : "não é um PNG legível.",
  );
}

console.log("\n\x1b[36m▶ Perfis de build (eas.json)\x1b[0m");
for (const perfil of ["development", "preview", "production"]) {
  const config = eas.build?.[perfil];
  conferir(
    `perfil "${perfil}" existe`,
    Boolean(config),
    "o eas.json precisa dos três perfis para separar Expo Go, teste interno e loja.",
  );
  conferir(
    `perfil "${perfil}" aponta para o backend Supabase`,
    config?.env?.EXPO_PUBLIC_BACKEND === "supabase",
    `EXPO_PUBLIC_BACKEND = ${config?.env?.EXPO_PUBLIC_BACKEND ?? "ausente"} — sem "supabase" o container de DI usa memória e os dados somem ao fechar o app.`,
  );
}
conferir(
  "perfil production gera app-bundle (.aab)",
  eas.build?.production?.android?.buildType === "app-bundle",
  "a Play Store não aceita APK para apps novos; produção deve gerar .aab.",
);
conferir(
  "perfil production incrementa versão automaticamente",
  eas.build?.production?.autoIncrement === true,
  "sem autoIncrement dois envios seguidos reusam o mesmo versionCode e a loja recusa.",
);

console.log("\n\x1b[36m▶ Segredos fora do repositório\x1b[0m");
const envExemplo = readFileSync(join(raiz, ".env.example"), "utf-8");
conferir(
  ".env.example documenta EXPO_PUBLIC_BACKEND",
  envExemplo.includes("EXPO_PUBLIC_BACKEND"),
  "quem configura o ambiente precisa saber que o build usa Supabase.",
);
const appJsonCru = readFileSync(join(raiz, "app.json"), "utf-8");
conferir(
  "app.json e eas.json sem valores de chave",
  !/sb_[a-zA-Z0-9]{10,}|supabase\.co\/rest|eyJ[A-Za-z0-9_-]{20,}/.test(`${appJsonCru}${readFileSync(join(raiz, "eas.json"), "utf-8")}`),
  "credenciais embutidas em arquivo versionado vazam no git; use segredos do EAS.",
);

if (falhas.length > 0) {
  console.error(`\n\x1b[31m✖ Configuração de build reprovada (${falhas.length} achado(s)).\x1b[0m`);
  process.exit(1);
}
console.log("\x1b[32m✔ Configuração de build nativo aprovada.\x1b[0m");
