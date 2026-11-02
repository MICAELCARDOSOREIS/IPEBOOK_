# Plano de Implementação — Spec 115 (Melhorias na Entrega do Livro)

## Arquitetura e Decisões
- O componente `Delivery` em `src/view/requests/delivery.tsx` já consome `useRequestDetailViewModel(requestId, sessionUserId)`.
- Adicionar componente interno `DeliveryBookSummary` renderizando capa do livro, título, autor, modalidade (`Tag`) e contraparte.
- Utilizar o hook `useIsWideWeb` para chavear entre layout móvel de coluna única e layout desktop de duas colunas.
- Criar cartão com dicas de segurança e conferência da integridade das páginas do livro em Piripiri.
- Atualizar a suíte de testes de componentes para validar o novo resumo e a visualização desktop.

## Etapas de Execução
1. **Etapa 1:** Atualização da UI em `src/view/requests/delivery.tsx` adicionando resumo do livro, layout responsivo desktop (`useIsWideWeb`), cartão de dicas de conferência presencial e adaptação suave para Web.
2. **Etapa 2:** Atualização e ampliação dos testes em `tests/components-mocked/deliveryView.test.tsx` e validação de regressões.
3. **Etapa 3:** Verificação integral de governança (`typecheck`, `check:architecture`, `check:numbering`, `npm test`, `build:web`).
