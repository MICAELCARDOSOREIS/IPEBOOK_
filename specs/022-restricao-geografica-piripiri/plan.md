# Plano de Implementação — Restrição a Piripiri, PI (Spec 022)

## 1. Arquitetura MVVM e Camadas Afetadas

1. **Camada Model (Domínio):**
   - Criar `src/model/entities/location.ts`: constantes com os bairros de Piripiri (`PIRIPIRI_NEIGHBORHOODS`), cidade padrão e validação.
   - Atualizar `src/model/entities/book.ts`: estender tipo `Book` com `city?: string; state?: string; neighborhood?: string;`.
   - Atualizar `src/model/validators/bookValidator.ts`: validar que se `city`/`state` forem informados, devem ser `"Piripiri"` e `"PI"`.
2. **Camada Caso de Uso:**
   - Atualizar `src/usecase/iBookUseCases.ts`: adicionar `neighborhood?: string; city?: string; state?: string;` em `CreateListingInput`.
   - Atualizar `src/usecase/bookUseCases.ts`: aplicar regras geográficas na criação do anúncio, atribuindo `"Piripiri"` e `"PI"` como padrão confiável.
3. **Camada Infraestrutura / DataSources:**
   - Atualizar `src/infra/datasources/memoryBookDataSource.ts` para persistir `city`, `state`, `neighborhood`.
   - Atualizar `src/infra/datasources/supabaseBookDataSource.ts` para mapear colunas caso existam ou preservar compatibilidade retrocompatível sem quebra.
4. **Camada ViewModel:**
   - Atualizar `src/viewmodel/useCreateListingViewModel.ts`: incluir estado e ação de seleção de bairro (`neighborhood`).
5. **Camada View:**
   - Atualizar `src/view/listings/createListing.tsx`: incluir indicador de localidade "Piripiri, PI" e seleção de bairro.
6. **Camada de Testes:**
   - Teste unitário de domínio/validador (`bookValidator.test.ts`).
   - Teste unitário do caso de uso (`bookUseCases.test.ts`).
   - Teste de componente / ViewModel da tela de anúncio.
