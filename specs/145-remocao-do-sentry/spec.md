# Especificação 145 — Remoção do Sentry e acompanhamento de erros apenas local

**Estado:** Implementada  
**ADR:** [0124](../../docs/adr/0124-remocao-do-sentry.md) (substitui o [ADR 0080](../../docs/adr/0080-acompanhamento-de-erros-sentry.md) e revoga a [Spec 104](../104-acompanhamento-de-erros/spec.md))

## 1. Contexto e Objetivo

Remover completamente a dependência nativa `@sentry/react-native`, seu config plugin do Expo e o adaptador `SentryErrorReporter` do IpêBook. O acompanhamento de erros no cliente passa a operar exclusivamente em memória (`MemoryErrorReporter` + `SafeLogger`) e a tela amigável de erro (`AppErrorFallback` / `ErrorBoundary`) continua funcionando sem enviar dados a serviços externos de telemetria.

Essa decisão elimina:
- A necessidade de `SENTRY_AUTH_TOKEN` ou `SENTRY_DISABLE_AUTO_UPLOAD` em builds locais de Android e em builds de iOS compiladas no Xcode/EAS por colaboradores externos.
- O compartilhamento de dados de diagnóstico com terceiros fora do Brasil (simplificando a Política de Privacidade LGPD e o manifesto de privacidade da App Store e Google Play).
- Peso nativo adicional no bundle Android/iOS/Web e dependências transitivas do SDK do Sentry.

## 2. Escopo

- Remover `@sentry/react-native` de `package.json` e `package-lock.json`.
- Remover o plugin `@sentry/react-native/expo` de `app.json` e a variável `SENTRY_DISABLE_AUTO_UPLOAD` de `eas.json`, `scripts/gerar-aab-local.sh` e `scripts/gerar-apk-release.sh`.
- Remover `src/infra/services/sentryErrorReporter.ts`, `tests/mocks/sentry-react-native.ts` e o fallback `RNSentry` em `src/infra/services/googlePlayInAppUpdateService.ts`.
- Manter o contrato `IErrorReporter`, `MemoryErrorReporter`, `reportingSink` do `SafeLogger` e `AppErrorFallback` para preservar a arquitetura limpa e a recuperação amigável de falhas na UI.
- Atualizar `src/model/legalContent.ts` (Política de Privacidade LGPD) e os testes correspondentes para não listar o Sentry como fornecedor nem coleta externa de relatórios de erro.

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | `@sentry/react-native` removido de `package.json`, `app.json`, `eas.json` e scripts de build. | `npm run check:build-config` |
| CA2 | `errorReporter` no container DI usa `MemoryErrorReporter` em todos os ambientes, mantendo `SafeLogger` e `AppErrorFallback` funcionais. | `tests/unit/errorReporting.test.ts` e `tests/components/appErrorFallback.test.tsx` |
| CA3 | Política de Privacidade (`legalContent.ts`) atualizada sem menção ao Sentry. | `tests/components/termsAndPrivacyView.test.tsx` |
| CA4 | Toda a suíte de validação (`npm run validate`) aprovada sem regressões. | `npm run validate` |
