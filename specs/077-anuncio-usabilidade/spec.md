# Spec 077 — Usabilidade do fluxo de anúncio

**Data:** 26 de outubro de 2026
**Tela afetada:** `src/view/listings/createListing.tsx` e `createListingStep1.tsx`.

## Problema

"Continuar" avançava com título, autor ou preço vazios; o erro só surgia ao publicar, na etapa 3,
longe do campo. A rolagem não voltava ao topo entre etapas e o Voltar do Android abandonava o fluxo.

## Escopo

1. Validar a etapa 1 ao tocar "Continuar" (`validateListingBasics` em
   `src/viewmodel/listingBasicsValidation.ts`): título, autor e, na venda, preço maior que zero
   (aceita vírgula). Erros aparecem no próprio campo, só depois da primeira tentativa.
2. Rolar ao topo a cada troca de etapa.
3. Voltar do Android (botão/gesto) recua uma etapa nas etapas 2 e 3.
4. "Buscar" ISBN desativado com o campo vazio; ícone do leitor passa a ser câmera.
5. Tocar no espaço da foto leva às fotos sem exigir os textos.

## Fora do escopo

Validação das etapas 2 e 3 (continua no caso de uso ao publicar) e aceitação do dígito `X` no ISBN.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Etapa 1 incompleta não avança e mostra erro em cada campo | teste de componente |
| CA2 | Sem erros antes da primeira tentativa | teste de componente |
| CA3 | Regras de título, autor e preço | `tests/hooks/createListingStepValidation.test.ts` |
| CA4 | "Buscar" desativado com ISBN vazio | teste de componente |
| CA5 | Rolagem ao topo e Voltar do Android | revisão de código (sem aparelho nesta entrega) |

## Validação

`npm run validate`: 177 arquivos e 1.291 testes passando. Sem conferência em aparelho.
