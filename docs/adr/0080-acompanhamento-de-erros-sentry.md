# 0080 — Acompanhamento de erros com Sentry

- Data: 2026-10-29
- Status: aceito
- Especificação: [104](../../specs/104-acompanhamento-de-erros/spec.md)

## Contexto
Erros e travamentos no aparelho das pessoas não chegavam à equipe.

## Decisão
Usar `@sentry/react-native` (SDK oficial com suporte a Expo, Android, iOS e Web), atrás do contrato `IErrorReporter` em `src/model/services`, criado só no container. Ligado apenas com `EXPO_PUBLIC_SENTRY_DSN`; sem PII e com o filtro do `SafeLogger`. O pacote é instalado com npm (gerenciador e lock oficiais do projeto).

## Alternativas consideradas
- Firebase Crashlytics: exige `@react-native-firebase` e não cobre a Web.
- Só logs no console: invisíveis em produção.

## Consequências
- Mais uma dependência nativa: precisa de build nova para valer no Android.
- Plano gratuito do Sentry tem cota mensal de eventos; acima dela, eventos são descartados.
- Nos testes o SDK é substituído por `tests/mocks/sentry-react-native.ts`.
