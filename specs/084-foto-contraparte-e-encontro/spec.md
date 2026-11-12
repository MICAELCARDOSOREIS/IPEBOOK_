# Spec 084 — Foto da outra pessoa na negociação e encontro mais leve

**Data:** 26 de outubro de 2026 · **Telas:** Acompanhar encontro, Conversas.

## Problemas

1. **Foto não aparecia**: quem vendeu colou/enviou foto, mas em Acompanhar encontro e na lista de Conversas o
   avatar mostrava o ipê padrão. `NegotiationDetail` e os pedidos recebidos traziam só o nome; o Avatar nunca
   recebia `photoUrl`.
2. "Concluir e avaliar" aparecia como botão principal antes de qualquer encontro, e cada ponto seguro tinha um
   botão verde cheio "Como chegar", deixando o fim da tela pesado.

## Decisão

- Casos de uso devolvem `counterpartPhotoUrl` (detalhe) e `requesterPhotoUrl` (recebidos); a lista de Conversas
  busca nome e foto de quem anunciou nos enviados. Avatar usa a foto e cai no ipê sem foto.
- Antes do encontro acontecer, o cartão de conclusão fica neutro com o atalho "Já fizemos a entrega"; depois,
  volta o botão principal "Concluir e avaliar".
- Pontos seguros viram linhas tocáveis (ícone, nome, endereço, horário e "Rota"); "Ver pontos seguros" fica tonal.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Detalhe e recebidos trazem a foto da outra pessoa | teste unitário |
| CA2 | Conversas traz a foto em enviados e recebidos | teste do viewmodel |
| CA3 | Antes do encontro: sem botão principal, com "Já fizemos a entrega"; depois: botão principal | teste de componente |
| CA4 | Linha do ponto abre o mapa ("Como chegar à …") | teste de componente existente |
| CA5 | Galaxy A16: foto do vendedor na linha da pessoa e pontos em linhas | ADB |

## Validação

`npm run validate` aprovado (186 arquivos / 1.374 testes). CA1 falhou antes da correção. No Galaxy A16 a foto do
vendedor aparece em "Anunciou o livro" e os pontos seguros aparecem como linhas com "Rota".
