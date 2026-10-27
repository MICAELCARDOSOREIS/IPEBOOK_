# Spec 082 — Conversa em tela cheia (Figma `06.02`) e Conversas vazia (`06.09`)

**Data:** 26 de outubro de 2026 · **Base:** Spec 061 (chat), Spec 076 (lista de Conversas), ADR 0044.

## Problema

O chat da negociação abre como modal dentro de "Acompanhar encontro": o título é genérico, não mostra o livro,
os horários vêm no formato do sistema ("15:50"), não há separação por dia e a lista não rola sozinha para a
última mensagem. Da aba Conversas, tocar numa conversa abria o detalhe da negociação, não a conversa.

## Escopo

1. **Rota `/conversa/[id]`** em tela cheia: barra superior com voltar e o nome da outra pessoa; cartão do livro
   (capa, título, etiqueta da modalidade) com a ação **"Combinar"**, que abre a negociação (`/negociacao/[id]`).
2. **Balões** do Figma: os meus à direita em `secondaryContainer`, os da outra pessoa à esquerda em
   `surfaceContainerHigh`, horário "8h40" no balão; **separadores de dia** ("Hoje", "Ontem", "sáb, 24 out").
3. Lista **rola até a última mensagem** ao abrir e ao chegar mensagem nova.
4. Conversa vazia com **sugestões de primeira mensagem** que preenchem o campo.
5. Campo contornado "Escreva uma mensagem" com botão de enviar em ícone; falha de envio com "Reenviar".
6. **Conversas → conversa**: negociação aceita abre `/conversa/[id]`; em "Acompanhar encontro", "Abrir conversa"
   também navega para a tela (o modal sai).
7. **Conversas vazia** como no `06.09`: "Nenhuma conversa ainda", "Encontre um livro e converse com a pessoa
   para combinar os detalhes." e "Encontrar um livro".

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Horário "8h40" e separadores Hoje/Ontem/data corretos | teste unitário |
| CA2 | Tela mostra nome, livro, modalidade e "Combinar" abre a negociação | teste de componente |
| CA3 | Balões meus/da outra pessoa e envio pelo botão | teste de componente |
| CA4 | Sugestão preenche o campo na conversa vazia | teste de componente |
| CA5 | Conversas aceitas e "Abrir conversa" levam a `/conversa/[id]` | teste de componente |
| CA6 | Conferência no Galaxy A16 | ADB |
