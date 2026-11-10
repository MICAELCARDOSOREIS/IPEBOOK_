# Plano de Implementação — Spec 129: Google Play In-App Updates

## 1. Arquitetura e Camadas Afetadas

1. **Domínio (`src/model/`):**
   - `src/model/services/iInAppUpdateService.ts`: estender `StoreUpdateInfo` com `installedVersionCode?: number` e `installedVersionName?: string`.
   - `src/model/entities/appUpdate.ts`: estender `AppVersionPolicy` com `latestVersionCode?: number` e `minSupportedVersionCode?: number`; atualizar `evaluateAppUpdateStatus` para avaliar `installedVersionCode` quando o semver for idêntico; adicionar `formatPolicyVersionKey`.

2. **Casos de Uso (`src/usecase/`):**
   - `src/usecase/appUpdateUseCases.ts`: utilizar `installedVersionName` e `installedVersionCode` vindos do serviço nativo (ou do construtor), gerar identificador `${installedVersion}+${versionCode}` quando a atualização na Play Store tiver apenas novo `versionCode`, e repassar `installedVersionCode` para a avaliação de fallback da política remota.

3. **Infraestrutura (`src/infra/`):**
   - `src/infra/services/googlePlayInAppUpdateService.ts`: integrar com `NativeModules.IpebookPlayUpdate` (`checkStoreUpdate` e `startUpdateFlow`) no Android, com fallback para `NativeModules.RNSentry.fetchNativeRelease` para leitura de `versionCode` em builds anteriores.
   - `src/infra/datasources/supabaseAppVersionPolicyDataSource.ts`: usar `.select("*")` em `v2_app_version_policy` e mapear `latest_version_code` e `min_supported_version_code` quando disponíveis sem quebrar o esquema remoto atual.

4. **Config Plugin Expo e Android Nativo (`app.config.js` e `android/`):**
   - `app.config.js`: adicionar plugin `withPlayInAppUpdates` que injeta `com.google.android.play:app-update:2.1.0` no `android/app/build.gradle`, gera `IpebookPlayUpdateModule.kt` e `IpebookPlayUpdatePackage.kt` durante o `prebuild` e registra o pacote em `MainApplication.kt`.
   - Sincronizar os mesmos arquivos em `android/app/` para builds locais.

## 2. Estratégia de Testes e Validação

- Testes unitários em `tests/unit/inAppUpdateService.test.ts` exercitando `GooglePlayInAppUpdateService` com mock de `NativeModules.IpebookPlayUpdate`, fallback para `RNSentry.fetchNativeRelease` e tratamento de erros.
- Testes unitários em `tests/unit/appUpdateUseCases.test.ts` cobrindo detecção na Play Store apenas por `versionCode` (`0.1.0+11` vs `0.1.0+12`), dispensa isolada por build e avaliação por `latestVersionCode` / `minSupportedVersionCode`.
- Execução completa de `npm run validate`.
