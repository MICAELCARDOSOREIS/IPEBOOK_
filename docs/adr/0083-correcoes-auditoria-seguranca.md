# 0083 — Correções da auditoria de segurança

- Data: 2026-10-28
- Status: aceito
- Especificação: [107](../../specs/107-correcoes-auditoria-seguranca/spec.md)
- Complementa: [0078](0078-moderacao.md)

## Contexto
A auditoria encontrou login forçado por link, suspensão incompleta e contornável pela exclusão da conta, consulta de suspensão alheia, fotos que ficavam públicas após excluir a conta e `photo_url` aceitando qualquer link.

## Decisão
- Retorno de login: tokens crus só no `#` e nunca substituindo a sessão de outra conta.
- Suspensão: função sem argumento `v2_current_user_suspended()` nas políticas restritivas, estendidas a encontros, avaliações, denúncias e perfil; gatilho impede aceitar pedido; `v2_is_suspended(uuid)` deixa de ser chamável pelo app; `delete_user_account` recusa conta suspensa.
- Fotos: o app apaga a pasta da pessoa no bucket antes da RPC de exclusão (o banco não apaga arquivos do storage).
- `photo_url`: CHECK `https://` `not valid`, para não reprovar dados antigos.

## Alternativas consideradas
- Guardar hash do e-mail banido: exige base legal e Auth Hook; bloquear a exclusão é mais simples.
- Apagar `storage.objects` em SQL: o Supabase bloqueia exclusão direta; tem de ser pela Storage API.

## Consequências
- Conta suspensa pede a exclusão por e-mail; a moderação decide.
- Limitações registradas na Spec 107.
