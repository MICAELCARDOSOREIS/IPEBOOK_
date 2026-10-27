# Spec 080 — Refinos do acompanhamento do encontro

**Data:** 26 de outubro de 2026
**Tela afetada:** `src/view/requests/requestDetail.tsx` (`06.06 · Acompanhar encontro`). Continua a Spec 079.

## Problema

Para ver se a outra pessoa confirmou era preciso sair e voltar à tela; recarregar trocava todo o conteúdo
por um indicador de carregamento; um convite aguardando a minha confirmação ficava escondido no meio da
página; e a lista de pontos seguros continuava inteira mesmo com o local já combinado.

## Escopo

1. Puxar para atualizar recarrega a negociação e o encontro, sem esconder o conteúdo já exibido.
2. Aviso "Sua vez: … sugeriu um encontro" abaixo do andamento quando o convite da outra pessoa espera
   confirmação.
3. Com o encontro combinado, os pontos seguros ficam recolhidos atrás de "Ver pontos seguros de
   Piripiri" (botão com estado expandido para leitores de tela); as dicas de segurança continuam.

## Fora do escopo

Atualização em tempo real e notificações.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | "Sua vez" com convite da outra pessoa | `requestDetailView.test.tsx` |
| CA2 | Pontos recolhidos e expansíveis com encontro combinado | `requestDetailView.test.tsx` |
| CA3 | Puxar para atualizar chama o recarregamento sem trocar o conteúdo | `requestDetailView.test.tsx` |

## Validação

`npm run validate`: 178 arquivos e 1.299 testes passando. Sem conferência em aparelho.
