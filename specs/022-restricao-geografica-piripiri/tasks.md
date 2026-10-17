# Tarefas — Restrição Geográfica a Piripiri, PI (Spec 022)

- [x] T001: Definir ADR 0016 sobre a restrição territorial por declaração comunitária (versus GPS/geolocalização) e conformidade LGPD.
- [x] T002: Criar entidade de localização `src/model/entities/location.ts` com os bairros de Piripiri, PI.
- [x] T003: Estender entidade `Book` e validador `bookValidator.ts` com validação de cidade e estado.
- [x] T004: Atualizar caso de uso `BookUseCases` para validar e aplicar a restrição territorial no cadastro de anúncio.
- [x] T005: Atualizar `useCreateListingViewModel` e `createListing.tsx` para exibir a localidade de Piripiri e seleção de bairro.
- [x] T006: Criar e atualizar testes unitários e de integração cobrindo cenários de sucesso e rejeição fora de Piripiri.
- [x] T007: Validar suíte com `npm run validate` e `npm run build:web`.
