# Especificação 129 — Verificação automática de atualizações via Google Play In-App Updates

**Estado:** Implementada e atualizada em 2026-11-10
**ADR:** [0100](../../docs/adr/0100-google-play-in-app-updates.md)

## Objetivo e escopo

Permitir que o aplicativo detecte novas versões disponíveis na Google Play Store de forma 100% direta e automática — inclusive quando apenas o `versionCode` inteiro do Android é incrementado pelo EAS Build (`autoIncrement: true`) mantendo a mesma versão semântica (`version`) — sem exigir atualização manual na tabela `v2_app_version_policy` do Supabase a cada publicação.

Ao abrir o aplicativo em dispositivo Android:
1. O serviço `GooglePlayInAppUpdateService` consulta o módulo nativo `IpebookPlayUpdate` (integrado via Expo Config Plugin em `app.config.js` com a biblioteca oficial `com.google.android.play:app-update:2.1.0`), que verifica `AppUpdateManager` na Google Play Store e lê o `versionCode` e `versionName` reais instalados no sistema.
2. Se a Google Play indicar que há atualização disponível (`UpdateAvailability.UPDATE_AVAILABLE`), o aplicativo exibe o modal acessível (`AppUpdateGate`) e, ao confirmar, aciona o fluxo nativo de atualização da Play Store (`startUpdateFlow`) com fallback automático para `market://details?id=com.ipebook.app`.
3. Caso o módulo nativo não esteja presente no binário ou o dispositivo esteja sem Google Play Services / offline, o serviço obtém a versão nativa instalada (com fallback via `RNSentry.fetchNativeRelease`) e recorre à política remota do Supabase (`v2_app_version_policy`), suportando comparação tanto por versão semântica (`latest_version` / `min_supported_version`) quanto por código de build (`latest_version_code` / `min_supported_version_code`).

## Regras de negócio

- **RN-01 (Detecção direta na Google Play Store):** No Android, `GooglePlayInAppUpdateService.checkStoreUpdate()` invoca `NativeModules.IpebookPlayUpdate.checkStoreUpdate()`, que consulta `AppUpdateManagerFactory.create(context).appUpdateInfo` da Google Play Store e retorna `isUpdateAvailable`, `versionCode` disponível na loja, `installedVersionCode` e `installedVersionName` do pacote instalado.
- **RN-02 (Identificação única por `versionCode` para dispensa opcional):** Como a Play Store identifica releases por `versionCode` (ex.: build `11` sobre a `0.1.0`), quando `storeInfo.isUpdateAvailable` é verdadeiro e `versionName` coincide com a versão instalada ou está ausente, `AppUpdateUseCases` compõe a chave da versão detectada como `${installedVersion}+${versionCode}` (ex.: `0.1.0+11`). Assim, tocar em **"Agora não"** dispensa apenas o build `11`, garantindo que o build `12` (`0.1.0+12`) volte a notificar a pessoa usuária.
- **RN-03 (Fluxo nativo de atualização com fallback para a página da loja):** Ao confirmar a atualização no `AppUpdateGate`, `AppUpdateUseCases.openStore()` tenta primeiro iniciar o fluxo nativo da Play Store (`IpebookPlayUpdate.startUpdateFlow()`); se o fluxo nativo não puder ser iniciado, redireciona para `market://details?id=com.ipebook.app` (ou URL HTTPS) via `ExpoAppStoreLauncherService`.
- **RN-04 (Fallback resiliente com suporte a `versionCode`):** Quando a consulta direta à loja retorna `isUpdateAvailable: false` ou falha, `AppUpdateUseCases` consulta `v2_app_version_policy` no Supabase e avalia `evaluateAppUpdateStatus(installedVersion, policy, installedVersionCode)`, comparando primeiro o semver e, em caso de empate (`0.1.0 === 0.1.0`), comparando `installedVersionCode` com `minSupportedVersionCode` e `latestVersionCode` quando presentes.
- **RN-05 (Paridade Web e testabilidade MVVM):** Na Web (`Platform.OS === "web"`), nenhuma verificação nativa é executada (`up_to_date`). Toda a comunicação nativa permanece encapsulada em `src/infra/services/googlePlayInAppUpdateService.ts` por trás de `IInAppUpdateService`.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Módulo nativo Android `IpebookPlayUpdateModule` e config plugin `withPlayInAppUpdates` em `app.config.js` injetam `com.google.android.play:app-update:2.1.0` e expõem `checkStoreUpdate` e `startUpdateFlow`. | `app.config.js`, `android/app/src/main/java/com/ipebook/app/IpebookPlayUpdateModule.kt` e `npm run check:build-config` |
| CA2 | `GooglePlayInAppUpdateService` consulta `NativeModules.IpebookPlayUpdate`, faz fallback para `RNSentry.fetchNativeRelease` quando o módulo nativo não está compilado e nunca propaga exceções em falha. | `src/infra/services/googlePlayInAppUpdateService.ts` e `tests/unit/inAppUpdateService.test.ts` |
| CA3 | `evaluateAppUpdateStatus` e `AppUpdateUseCases` diferenciam builds pelo `versionCode` (`0.1.0+11`), permitindo dispensar um build opcional sem silenciar o próximo (`0.1.0+12`), e suportam `latestVersionCode` / `minSupportedVersionCode` na política remota. | `tests/unit/appUpdateUseCases.test.ts` |
| CA4 | Suíte de testes automatizados, verificação de arquitetura, tipos e documentação 100% aprovados. | `npm run validate` |
