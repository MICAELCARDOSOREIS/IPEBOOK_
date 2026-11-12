# 0078 — Moderação por RPCs no banco e moderadores cadastrados no Supabase

- Data: 2026-10-29
- Status: aceito
- Especificação: [102](../../specs/102-moderacao/spec.md)

## Contexto
As denúncias eram gravadas, mas não havia quem as analisasse nem como agir sobre elas.

## Decisão
- Moderadores ficam em `v2_moderators`, sem acesso do app: cadastro só pelo SQL do Supabase.
- Fila e decisões são RPCs `SECURITY DEFINER` que conferem `v2_is_moderator()`; as tabelas de denúncia continuam fechadas para leitura alheia.
- Suspensão por políticas RLS restritivas (anunciar, pedir, mandar mensagem) e um gatilho que impede reativar anúncio retido ou de conta suspensa.
- Pausa automática com três denunciantes distintos, para conter abuso antes da análise.

## Alternativas consideradas
- Painel separado (web admin): mais um sistema para manter e publicar.
- Papel no JWT (`app_metadata`): exige Edge Function ou painel para conceder; a tabela é mais simples de auditar.

## Consequências
- Remover anúncio é definitivo (apaga a linha e as denúncias em cascata).
- Três contas combinadas podem pausar um anúncio até a análise; o moderador o devolve ao arquivar.
