# Tarefas — Spec 129: Google Play In-App Updates

- [x] **T001** Atualizar `StoreUpdateInfo` (`src/model/services/iInAppUpdateService.ts`) e `AppVersionPolicy` / `evaluateAppUpdateStatus` (`src/model/entities/appUpdate.ts`) com suporte a `versionCode`.
- [x] **T002** Atualizar `AppUpdateUseCases` (`src/usecase/appUpdateUseCases.ts`) para compor versão `${installedVersion}+${versionCode}` nas atualizações da Play Store e repassar `installedVersionCode` ao fallback remoto.
- [x] **T003** Implementar a integração nativa real em `GooglePlayInAppUpdateService` (`src/infra/services/googlePlayInAppUpdateService.ts`) via `NativeModules.IpebookPlayUpdate` com fallback de leitura de build via `RNSentry.fetchNativeRelease`.
- [x] **T004** Atualizar `SupabaseAppVersionPolicyDataSource` (`src/infra/datasources/supabaseAppVersionPolicyDataSource.ts`) para ler `latest_version_code` e `min_supported_version_code` opcionalmente via `.select("*")`.
- [x] **T005** Implementar `IpebookPlayUpdateModule.kt`, `IpebookPlayUpdatePackage.kt` e o config plugin `withPlayInAppUpdates` em `app.config.js`.
- [x] **T006** Expandir testes unitários em `tests/unit/inAppUpdateService.test.ts` e `tests/unit/appUpdateUseCases.test.ts` e validar com `npm run validate`.
