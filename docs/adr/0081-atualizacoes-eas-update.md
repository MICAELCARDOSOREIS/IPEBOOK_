# 0081 — Atualizações pelo EAS Update com runtime pela versão do app

- Data: 2026-10-29
- Status: aceito
- Especificação: [105](../../specs/105-avaliacao-na-loja-e-atualizacoes/spec.md)

## Contexto
Toda correção exigia build nova e revisão da Play Store.

## Decisão
Usar `expo-updates` com EAS Update (o projeto já usa EAS Build), `runtimeVersion.policy = appVersion` e um canal por perfil de build. Busca ao abrir, sem bloquear a abertura (`fallbackToCacheTimeout: 0`).

## Alternativas consideradas
- Política `fingerprint`: mais automática, mas menos previsível para quem publica manualmente.
- Sem atualização remota: correções lentas.

## Consequências
- Mudar dependência nativa exige subir `version` no `app.json` e gerar build nova.
- O plano gratuito do EAS Update tem limite mensal de usuários ativos com atualização.
