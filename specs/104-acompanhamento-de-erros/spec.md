# Especificação 104 — Acompanhamento de erros com Sentry

Status: implementada e testada localmente; projeto `ipebook` criado no Sentry e DSN no `.env` local; **pendente DSN no EAS e build nova**. ADR: [0080](../../docs/adr/0080-acompanhamento-de-erros-sentry.md).

## Objetivo
Saber quando o app quebra no aparelho das pessoas, sem expor dados pessoais.

## Escopo
- `@sentry/react-native` (versão indicada pelo Expo) atrás do contrato `IErrorReporter`.
- Logs de erro do `SafeLogger` seguem para o Sentry; telas que quebram mostram um aviso amigável (`ErrorBoundary` do expo-router) e enviam o erro.
- Fora do escopo: envio de mapas de código (source maps), rastreamento de desempenho e replay de sessão.

## Regras
- **RN-01** Sem `EXPO_PUBLIC_SENTRY_DSN`, nada é enviado (implementação em memória).
- **RN-02** `sendDefaultPii` desligado; o usuário enviado fica só com o id; o contexto passa pelo filtro do `SafeLogger` (senhas, tokens, chaves).
- **RN-03** A tela de erro não mostra detalhes técnicos e permite tentar de novo.

## Como ligar
1. Criar projeto React Native em sentry.io e copiar o DSN.
2. Pôr `EXPO_PUBLIC_SENTRY_DSN` no `.env` local e nas variáveis do EAS (`eas env:create`).
3. Gerar nova build (o plugin `@sentry/react-native` em `app.json` exige build nativa).

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Inicia uma vez, sem PII e sem desempenho; filtra extras | `tests/unit/sentryErrorReporter.test.ts` |
| CA2 | Logs de erro vão ao Sentry; avisos não | `tests/unit/sentryErrorReporter.test.ts` |
| CA3 | Tela de erro amigável, envia e tenta de novo | `tests/components/appErrorFallback.test.tsx` |
| CA4 | Build web continua funcionando | `npm run build:web` (43 rotas estáticas) |
