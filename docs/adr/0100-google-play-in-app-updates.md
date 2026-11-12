# 0100. Verificação automática direta de atualizações na Google Play Store

- **Status:** Aceito
- **Data:** 2026-11-09 (atualizado em 2026-11-10)
- **Contexto:** Ciclo de vida do aplicativo Android / Distribuição na Google Play Store / Automação de releases
- **Especificação:** [129](../../specs/129-in-app-updates-google-play/spec.md)

## Contexto

Com a implementação da Spec 128 (ADR 0099), o IpêBook passou a exibir aviso de atualização e redirecionamento para a Google Play Store baseado na tabela remota `v2_app_version_policy` no Supabase.

No entanto, o perfil de produção no `eas.json` utiliza `"autoIncrement": true`, que incrementa automaticamente o `versionCode` inteiro do Android (ex.: de `10` para `11`) mantendo o campo `"version": "0.1.0"` do `app.json`. Além disso, depender exclusivamente do Supabase exige atualizar manualmente o banco a cada nova versão liberada no Google Play Console.

## Decisão

1. **Módulo nativo Android `IpebookPlayUpdate` via Config Plugin (`app.config.js`):**
   - Injetar a biblioteca oficial `com.google.android.play:app-update:2.1.0` no `android/app/build.gradle` e registrar `IpebookPlayUpdatePackage` em `MainApplication.kt` durante o `expo prebuild`.
   - Expor `checkStoreUpdate()` (que consulta `AppUpdateManagerFactory.create(context).appUpdateInfo` na Google Play Store e lê `versionCode` e `versionName` reais do `PackageInfo` instalado) e `startUpdateFlow()` (que inicia o fluxo oficial de atualização da Play Store).

2. **Implementação real em `GooglePlayInAppUpdateService` (`src/infra/services/googlePlayInAppUpdateService.ts`):**
   - No Android, consulta `NativeModules.IpebookPlayUpdate.checkStoreUpdate()`.
   - Quando executado em um binário anterior que ainda não possua `IpebookPlayUpdate`, recorre a `NativeModules.RNSentry.fetchNativeRelease()` para obter o `versionCode` nativo real instalado.
   - Em caso de falha, ausência da Play Store ou ambiente Web, retorna `{ isUpdateAvailable: false }` sem interromper a abertura do aplicativo.

3. **Identificação de versão por `versionCode` em `AppUpdateUseCases` e `evaluateAppUpdateStatus`:**
   - Como a API `AppUpdateInfo` da Google Play informa a disponibilidade por `availableVersionCode()`, `AppUpdateUseCases` compõe a chave da versão disponível como `${installedVersion}+${versionCode}` (ex.: `0.1.0+11`) quando `versionName` não muda. Assim, se a pessoa escolher **"Agora não"** para o build `11`, o aviso é dispensado apenas para `0.1.0+11` e volta a aparecer automaticamente no build `12` (`0.1.0+12`).
   - O fallback da política remota (`v2_app_version_policy`) também passa a considerar `latest_version_code` e `min_supported_version_code` quando presentes.

## Consequências

- **Positivas:** Detecção 100% automática de novas builds na Google Play Store mesmo quando apenas o `versionCode` sobe no EAS Build; zero dependências de pacotes npm de terceiros não mantidos (usa diretamente a biblioteca oficial do Google Play Core via Config Plugin próprio); preservação do fallback via Supabase para bloqueio emergencial (`min_supported_version`).
- **Negativas:** O módulo nativo `IpebookPlayUpdate` passa a integrar o binário Android a partir do próximo build `.aab` gerado com `npm run aab:local`.
