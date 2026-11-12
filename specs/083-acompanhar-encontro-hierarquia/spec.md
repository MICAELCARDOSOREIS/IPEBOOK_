# Spec 083 — Acompanhar encontro: o que fazer agora no topo

**Data:** 26 de outubro de 2026 · **Tela:** `src/view/requests/requestDetail.tsx` (`/negociacao/[id]`).

## Problema

Manchete grande e o aviso "Negociação aceita!" ocupavam meia tela; o cartão "Combine o encontro" — a ação do
momento — ficava abaixo da dobra. O aviso repetia a etapa 1 já marcada, a etapa em andamento tinha o mesmo
visual da futura, e o botão "Abrir conversa com <nome>" cortava nomes longos dentro de um cartão
"Participantes" com uma pessoa só.

## Escopo

1. Manchete menor; sai o aviso "Negociação aceita!" (a etapa "Aceita" já informa). Negociação concluída mantém
   o aviso de conclusão.
2. **Etapa atual destacada** (contorno e número em verde, rótulo em negrito) e anunciada como "Etapa atual".
3. Ordem: livro → etapas → **encontro** (cartão "Combine o encontro") → pessoa → conclusão.
4. **Linha da pessoa** compacta no lugar do cartão "Participantes": avatar, nome, papel ("Anunciou o livro" /
   "Quer o livro") e botão **"Conversar"**, que abre `/conversa/[id]`.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Sem "Negociação aceita!" enquanto a negociação está aceita | teste de componente |
| CA2 | Etapa atual anunciada ("Etapa atual: Combinar encontro") | teste de componente |
| CA3 | Linha da pessoa com nome, papel e "Conversar" abrindo a conversa | teste de componente |
| CA4 | Encontro aparece antes da pessoa | teste de componente (ordem na árvore) |
| CA5 | Conferência no Galaxy A16 | ADB |
