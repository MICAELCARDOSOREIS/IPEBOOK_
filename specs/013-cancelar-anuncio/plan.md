# Plano de Implementação: Cancelamento e Remoção de Anúncio (Spec 013)

## Arquitetura MVVM Sofisticada em 7 Camadas

1. **Camada Model (Domínio):**
   - Atualizar `src/model/datasources/iBookDataSource.ts` adicionando `delete(id: string): Promise<void>`.
2. **Camada Infraestrutura:**
   - Implementar `delete` em `src/infra/datasources/memoryBookDataSource.ts`.
   - Implementar `delete` em `src/infra/datasources/supabaseBookDataSource.ts`.
3. **Camada Caso de Uso:**
   - Atualizar `src/usecase/iBookUseCases.ts` com `cancelListing(bookId: string, sessionUserId: string | null): Promise<void>`.
   - Implementar regras em `src/usecase/bookUseCases.ts`.
4. **Camada ViewModel:**
   - Atualizar `src/viewmodel/useMyListingsViewModel.ts` com estado de remoção (`cancellingId: string | null`) e ação `cancelListing(bookId: string)`.
5. **Camada View:**
   - Atualizar `src/view/listings/myListings.tsx` exibindo botão "Remover anúncio" para itens disponíveis.
6. **Testes e Validação:**
   - Teste unitário do caso de uso em `tests/unit/bookUseCases.test.ts`.
   - Teste de hook em `tests/hooks/useMyListingsViewModel.test.tsx`.
   - Teste de componente em `tests/components/myListingsView.test.tsx`.
   - Validação completa (`npm run validate` e `npm run build:web`).
