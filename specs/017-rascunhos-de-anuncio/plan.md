# Plano de Implementação: Rascunhos de Anúncio (Spec 017)

## Arquitetura em 7 Camadas (MVVM)

1. **Model:**
   - Estender `Book["status"]` (`src/model/entities/book.ts`) de `"available" | "reserved"` para
     incluir `"draft"`. Avaliar se os campos opcionais do rascunho (etapa em que parou, campos
     ainda não existentes na entidade — ver "O que NÃO faz parte" da spec) exigem um tipo próprio
     `DraftBook` em vez de reaproveitar `Book` — decidir no início da implementação, não aqui.
2. **Infra:**
   - Reaproveitar `MemoryBookDataSource`/`SupabaseBookDataSource` se `Book` for estendido, ou
     criar `memoryDraftDataSource.ts`/`supabaseDraftDataSource.ts` se for um tipo próprio.
3. **DI:**
   - Nenhuma mudança se reaproveitar `bookUseCases`; caso contrário, registrar `draftUseCases`
     em `src/di/container.ts`.
4. **UseCase:**
   - Estender `src/usecase/bookUseCases.ts` com `saveDraft`, `resumeDraft`, `discardDraft`,
     `listDrafts`, ou criar `src/usecase/draftUseCases.ts` equivalente.
5. **ViewModel:**
   - `src/viewmodel/useDraftsViewModel.ts` (listagem/descartar).
   - Ajuste em `src/viewmodel/useCreateListingViewModel.ts` para salvar/retomar rascunho por
     etapa.
6. **View:**
   - `src/view/listings/drafts.tsx` + `draftsScreen.tsx`.
   - Ação "Salvar para depois" na tela de anunciar existente (`src/view/listings/` ou
     equivalente usado por `src/app/anunciar.tsx`).
7. **App (Expo Router):**
   - `src/app/rascunhos.tsx`.
   - Atalho na tela "Meus anúncios" (`src/app/meus-anuncios.tsx`) e no fluxo de anunciar.
8. **Testes e Validação:**
   - Testes de usecase (salvar/retomar/descartar), viewmodel e view.
   - `npm run validate` e `npm run build:web`; registrar em `validacao.md` ao final.
