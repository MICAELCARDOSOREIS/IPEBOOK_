# Validação — Spec 058 (Busca e preenchimento automático por ISBN)

**Data:** 23 de outubro de 2026
**Branch:** `feature/busca-livro-isbn-figma-04`
**ADR Vinculado:** `docs/adr/0041-consulta-metadados-isbn.md`
**Figma Vinculado:** `04.01 · Anunciar — etapa 1`

---

## 1. O que foi implementado e testado

- **Validação e Normalização de ISBN (`src/model/isbn.ts`)**:
  - `normalizeIsbn`: Limpa hífens, espaços e padroniza dígito verificador 'X'.
  - `isValidIsbn10`: Cálculo do algoritmo oficial módulo 11.
  - `isValidIsbn13`: Cálculo do algoritmo oficial EAN-13 módulo 10 com pesos 1 e 3.
  - Testes unitários completos em `tests/unit/isbnValidator.test.ts`.

- **Serviços de Metadados (`src/model/services/iBookMetadataService.ts`)**:
  - `MemoryBookMetadataService` (`src/infra/services/memoryBookMetadataService.ts`): Catálogo em memória pré-populado para testes e ambiente offline.
  - `OpenLibraryBookMetadataService` (`src/infra/services/openLibraryBookMetadataService.ts`): Consulta assíncrona com timeout de 5 segundos via `AbortController`, extraindo título, autor e capa pública.
  - Testes unitários em `tests/unit/bookMetadataService.test.ts`.

- **ViewModel de Criação de Anúncio (`src/viewmodel/useCreateListingViewModel.ts`)**:
  - Estados `isbn`, `lookingUpIsbn` e `isbnFeedback`.
  - Ação `lookupIsbn()`: valida o código, consulta o serviço injetado e popula automaticamente `title`, `author` e `photoUrl`.
  - Tratamento resiliente de livro não encontrado e erros de conexão sem travar o formulário.
  - Testes de hook em `tests/hooks/useCreateListingViewModelIsbn.test.tsx`.

- **Interface da Etapa 1 (`src/view/listings/createListingStep1.tsx`)**:
  - Card interativo com campo de busca de ISBN, botão com loading e feedback visual e por voz (`accessibilityLiveRegion="polite"`).
  - Testes de componente atualizados em `tests/components/createListingView.test.tsx`.

---

## 2. Comandos Executados

| Verificação | Comando | Resultado |
| :--- | :--- | :--- |
| **Tipagem TypeScript** | `npm run typecheck` | ✅ **0 erros** |
| **Arquitetura (7 camadas)** | `npm run check:architecture` | ✅ **292 arquivos auditados sem violações** |
| **Anti-colisão de numeração** | `npm run check:numbering` | ✅ **58 specs e 42 ADRs sem colisão** |
| **Banco e RLS (PGlite)** | `npm run test:sql` | ✅ **100% dos testes SQL aprovados** |
| **Testes unitários e cobertura** | `npm run test:coverage` | ✅ **155 arquivos de teste com cobertura completa** |
| **Compilação estática Web** | `npm run build:web` | ✅ **34 rotas estáticas compiladas com sucesso** |
