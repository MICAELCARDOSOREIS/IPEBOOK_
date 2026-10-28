# 0079 — Limites contra abuso por gatilho no banco

- Data: 2026-10-29
- Status: aceito
- Especificação: [103](../../specs/103-limites-anti-abuso/spec.md)

## Contexto
Nada impedia uma conta de criar centenas de anúncios, pedidos, mensagens ou denúncias.

## Decisão
Um gatilho `BEFORE INSERT` conta as ações recentes da conta (janela deslizante sobre `created_at`) e recusa com o código próprio `IBLIM`. O app traduz esse código em `ValidationError` com a mensagem do banco (`src/infra/supabaseErrors.ts`).

## Alternativas consideradas
- Limite na Edge Function ou num gateway: o app grava direto pelo PostgREST, então só o banco vê todas as gravações.
- Limite só no app: contornável chamando a API.

## Consequências
- Cada gravação limitada faz uma contagem indexada a mais.
- Os números são um ponto de partida e podem ser ajustados numa nova migração.
