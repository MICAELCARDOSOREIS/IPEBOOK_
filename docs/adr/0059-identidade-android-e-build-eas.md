# ADR 0059 — Identidade do aplicativo e distribuição Android via EAS Build

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 074 (preparação de build nativo Android), ADR 0002 (Expo + MVVM),
  ADR 0020 (publicação Web na Cloudflare Pages), ADR 0023 (CI GitHub Actions),
  ADR 0042 (leitor de ISBN com câmera), ADR 0043 (notificações locais e lembretes).
- **Relacionado a:** ADR 0008 (escopo da beta: Android Material 3 + Web responsiva) e ADR 0017
  (fotos de anúncio no Supabase Storage).

## Contexto

Até aqui o Ipebook só existia em duas formas executáveis: o app aberto pelo Metro/Expo Go durante o
desenvolvimento e o pacote estático Web publicado em `https://ipebook.pages.dev` (ADR 0020). Não
havia como produzir um instalável Android. Ao tentar definir esse build, a auditoria do `app.json`
encontrou quatro bloqueios reais:

1. **Sem identidade de aplicativo.** `android.package` e `android.versionCode` não existiam. Sem
   package não há build nativo possível (o `expo prebuild` falha), e sem `versionCode` a Play Store
   recusa qualquer envio. Não existia também nenhum `eas.json`, ou seja, nenhum perfil de build.
2. **Config plugins ausentes para bibliotecas nativas.** `plugins` listava apenas `expo-router`,
   `expo-status-bar` e `expo-font`. `expo-camera` (Spec 059, leitor de ISBN) e `expo-notifications`
   (Spec 060, lembretes de encontro) estavam instalados e usados em runtime, mas sem plugin: num
   build de produção a câmera nasce sem `android.permission.CAMERA` nem frase de justificativa
   (exigência da loja) e o canal de notificação nasce sem ícone nem cor. Em Expo Go isso é invisível,
   porque o Expo Go já traz as permissões — o problema apareceria **somente no app instalado**, que é
   exatamente o artefato que ainda não existia.
3. **O build sairia com persistência em memória.** `src/di/container.ts:123` só escolhe Supabase
   quando `EXPO_PUBLIC_BACKEND === "supabase"`. A variável está documentada em `.env.example`, mas
   **não estava no `.env`** local e não seria definida em nenhum build remoto. O app instalável
   funcionaria normalmente e perderia todos os dados ao fechar — pior falha possível, porque passa em
   todos os testes (que rodam em memória por design).
4. **Cor da marca divergente.** `web.themeColor` ainda era `#0D47A1` (azul do protótipo) enquanto
   `public/manifest.json` já havia sido corrigido para o verde `#2C5E45` pela Spec 030. Na Web
   instalada como PWA a barra do navegador sai na cor do `app.json`, não do manifesto.

Ainda pesando na decisão: a máquina de desenvolvimento não tem Android SDK (`expo prebuild` + Gradle
local seria o caminho alternativo) e a política do projeto (ADR 0020, ADR 0023) é não adicionar
serviços pagos nem depender de infraestrutura externa desnecessária.

## Decisão

1. **Identidade:** `android.package = com.ipebook.app` (e `ios.bundleIdentifier` igual, mantendo uma
   única identidade por produto). O domínio próprio ainda não existe — a beta está em
   `ipebook.pages.dev`, que não serve de base para um package. Assumimos `com.ipebook.app` e
   registramos o risco na seção de consequências: **antes do primeiro envio à Play Store** convém
   revisar o nome, porque depois de publicado o package é imutável.
2. **Versionamento:** `android.versionCode = 1` no repositório como valor mínimo legível por
   verificação, com `appVersionSource: "remote"` e `autoIncrement: true` no perfil `production` do
   `eas.json`, que é quem decide o número efetivo dos envios.
3. **Perfis de build (`eas.json`):** três perfis explícitos — `development` (Expo Go/dev client,
   APK), `preview` (teste interno distribuído por link, APK) e `production` (`.aab`,
   `autoIncrement`). Todos os três definem `env.EXPO_PUBLIC_BACKEND = "supabase"`: a escolha de
   backend passa a ser **propriedade do perfil de build**, não da sorte de quem tinha um `.env`
   completo. As credenciais em si não entram no `eas.json` nem no git.
4. **Segredos fora do repositório:** `EXPO_PUBLIC_SUPABASE_URL` e
   `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` são fornecidos ao build pela conta EAS (variáveis de
   ambiente/segredos do projeto), nunca por arquivo versionado. O mesmo raciocínio do ADR 0023 para
   CI: a CI compila a Web com valores fictícios e backend em memória; o build nativo é o único lugar
   que vê credencial real, e nem ali ela é commitada.
5. **Config plugins declarados, com permissão mínima:** `expo-camera` com
   `recordAudioAndroid: false` (o leitor de ISBN não grava áudio) e frase de justificativa em
   português, e `expo-notifications` com `color: #2C5E45`. `android.permissions` traz apenas
   `INTERNET`, que é a permissão que o app realmente usa além da câmera (`POST_NOTIFICATIONS` já vem
   da própria biblioteca `expo-notifications`, e `READ/WRITE_EXTERNAL_STORAGE` vêm de
   `expo-file-system` com `maxSdkVersion=32`). Permissão não usada é passaporte para recusa na
   revisão da loja.
6. **Teclado tratado na camada nativa:** `android.softwareKeyboardLayoutMode = "resize"`. Os
   formulários (`/anunciar`, `/criar-conta`, `/denunciar`) não usam `KeyboardAvoidingView`, e com
   `pan` o teclado cobre o campo ativo em telas pequenas. `resize` é a correção que vale para todas
   as telas de uma vez, sem tocar em componente algum.
7. **Tema do sistema e cor da marca:** `userInterfaceStyle: "automatic"` (o app já tem tema escuro
   desde a Spec 054) e `web.themeColor` alinhado ao manifesto (`#2C5E45`), com
   `backgroundColor: #FCFAF5` no nível raiz.
8. **Verificação executável, não intenção:** `npm run check:build-config`
   (`scripts/verificar-config-build.mjs`) lê `app.json`, `eas.json`, `public/manifest.json` e
   `.env.example` e falha com código 1 se qualquer invariante acima se perder (identidade, perfis,
   plugins obrigatórios, cores consistentes, assets com tamanho mínimo de loja, ausência de
   credencial em arquivo versionado). Entra no `npm run validate` e na CI, junto do
   `npx expo config --type prebuild` como checagem de schema contra o SDK 58.

## Consequências

- O projeto passa a depender da conta Expo/EAS (`owner: ipebook` em `app.json`) para gerar instalável
  Android. Build na nuvem consome minutos do plano; nada é cobrado automaticamente, mas o plano
  gratuito tem cota mensal limitada, e um estouro bloqueia build até a renovação da cota.
- O build nativo **valida em produção o que o Expo Go esconde**: permissões, canais de notificação e
  o backend escolhido. Toda regressão nesse eixo agora é pega por `check:build-config` antes do push.
- Notificação **push remota** ainda não funciona num build de produção no Android:
  `ExpoPushNotificationService.registerForPushNotifications()` chama `getExpoPushTokenAsync()`, que
  exige `google-services.json` (projeto Firebase) no build. O chamado já é protegido por `try/catch`
  com log sanitizado e devolve `null`, então o app não quebra — o que deixa de existir é o lembrete
  agendado remotamente. As notificações **locais agendadas** (Spec 060) funcionam sem Firebase.
  Provisionar Firebase fica como pendência de release, não desta decisão.
- `com.ipebook.app` é um package não ancorado num domínio controlado. Para a verificação de
  desenvolvedor da Play Console, o caminho é registrar domínio próprio e, se necessário, mover para
  algo como `br.com.ipebook.app` **antes** do primeiro envio — depois de publicado, a troca significa
  outro aplicativo na loja.
- `ios.bundleIdentifier` foi declarado só para manter uma identidade única e permitir build futuro; a
  beta continua Android + Web (ADR 0008) e não há submissão iOS planejada.
- A verificação de assets impõe tamanho mínimo (512 px para ícone e splash, 432 px para as camadas do
  ícone adaptativo). Trocar a arte por uma imagem menor passa a falhar no pipeline, não na loja.
- Nada nesta decisão altera código de `src/` além do container de DI (que já lia a variável
  corretamente); o risco de regressão funcional é limitado ao arquivo de configuração e ao pipeline.

## Alternativas consideradas

- **`expo prebuild` + Gradle local (`assembleRelease`):** mantém tudo dentro da máquina e não depende
  de serviço algum, mas não há Android SDK instalado, e a instalação (SDK, build-tools, NDK, JDK
  compatível) é infra nova e pesada para ganhar só o artefato. Registrado como alternativa caso o
  projeto precise de build 100% offline.
- **Distribuir apenas Expo Go para a comunidade de Piripiri:** Expo Go não é instalável nem
  configurável (sem permissões próprias, sem canal de notificação, sem deep link estável). Serviria
  para dois ou três testers, não para uma beta com dezenas de pessoas.
- **Manter `EXPO_PUBLIC_BACKEND` apenas no `.env` de cada máquina:** mais simples, mas é a causa
  raiz do item 3 do Contexto — um build sem a variável produz um app aparentemente saudável e
  completamente volátil. Fixar por perfil de build e verificar por script elimina a classe de erro.
- **Escrever as credenciais Supabase no `eas.json`:** funciona, mas publica no git a chave do projeto
  e contradiz a política de segredo deste repositório. A chave publicável é entregável ao cliente,
  contudo continua sendo controle de acesso ao projeto; mantê-la fora do histórico é mais barato que
  explicá-la depois.
- **`eas submit` direto na Play Store nesta entrega:** a conta da Play Console, a ficha do app, as
  fotos de store e a declaração de privacidade ainda não existem. Deixar o submit para quando a beta
  tiver página de loja; por ora o artefato é distribuído por link interno.
