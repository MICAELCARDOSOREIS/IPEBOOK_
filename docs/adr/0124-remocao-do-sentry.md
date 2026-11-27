# ADR 0124 — Remoção do Sentry e manutenção exclusiva de tratamento local de erros

- **Data:** 2026-11-27
- **Status:** Aceito (substitui o [ADR 0080](0080-acompanhamento-de-erros-sentry.md))
- **Relacionados:** [Spec 145](../../specs/145-remocao-do-sentry/spec.md), [Spec 137](../../specs/137-ios-nativo-apple-hig/spec.md), [ADR 0080](0080-acompanhamento-de-erros-sentry.md)

## Contexto

O [ADR 0080](0080-acompanhamento-de-erros-sentry.md) introduziu `@sentry/react-native` atrás do contrato `IErrorReporter`. Na prática, o projeto não utiliza o painel do Sentry no fluxo operacional e o plugin nativo `@sentry/react-native/expo` adiciona atrito na compilação iOS (Xcode / Archive por colaborador externo) e nas builds locais Android (`SENTRY_AUTH_TOKEN` / `SENTRY_DISABLE_AUTO_UPLOAD`), além de exigir declaração de compartilhamento de dados de diagnóstico com fornecedor externo na Política de Privacidade (LGPD) e nos questionários das lojas.

## Decisão

Remover `@sentry/react-native`, o plugin `@sentry/react-native/expo` de `app.json`, o adaptador `SentryErrorReporter` e as variáveis `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_APP_ENV`, `SENTRY_AUTH_TOKEN` e `SENTRY_DISABLE_AUTO_UPLOAD`.

Manter o contrato `IErrorReporter`, a implementação `MemoryErrorReporter`, a filtragem de dados sensíveis do `SafeLogger` (`reportingSink`) e a fronteira visual `AppErrorFallback` (`ErrorBoundary` do Expo Router), garantindo que qualquer falha de renderização continue apresentando uma tela amigável com botão de nova tentativa sem enviar dados para fora do aparelho.

## Consequências

- Builds de iOS (Xcode e EAS) e Android locais ou em nuvem não dependem mais de tokens ou hooks de upload de source maps do Sentry.
- Menos código nativo compilado no iOS/Android, bundle JS menor e menos dependências transitivas.
- A Política de Privacidade (LGPD) em `src/model/legalContent.ts` deixa de listar o Sentry entre os operadores externos de dados.
