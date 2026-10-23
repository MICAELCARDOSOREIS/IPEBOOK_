# 41. Consulta de metadados de livro por ISBN (Figma 04.01)

- **Data:** 2026-10-23
- **Status:** Aceito
- **Contexto:**
  O fluxo do Figma `04.01 · Anunciar — etapa 1` destaca o recurso "Ler ISBN com a câmera / Preenche título e autor automaticamente".
  Até o momento, a interface exibia esse card apenas como elemento visual estático, sem qualquer lógica de busca ou preenchimento de metadados. O anúncio de novos livros demandava digitação manual completa de título e autor por parte dos membros da comunidade de Piripiri.

- **Decisão:**
  1. Criar o contrato de serviço `IBookMetadataService` em `src/usecase/iBookMetadataService.ts` com o método `lookupByIsbn(isbn: string): Promise<BookMetadata | null>`.
  2. Implementar a validação e sanitização do código ISBN (formatos ISBN-10 e ISBN-13, aceitando ou removendo hifens e espaços).
  3. Implementar `OpenLibraryBookMetadataService` em `src/infra/services/openLibraryBookMetadataService.ts`, que consulta a API pública e aberta da Open Library (`https://openlibrary.org/api/books?bibkeys=ISBN:...&format=json&jscmd=data`) e, para testes locais, um adaptador em memória `MemoryBookMetadataService`.
  4. Expandir `useCreateListingViewModel` com ação de consulta por ISBN (`lookupIsbn(isbn)`), preenchendo automaticamente `title`, `author` e `photoUrl` (quando disponível), com tratamento de erros compreensíveis e fallback offline.
  5. Integrar a funcionalidade na etapa 1 do cadastro de anúncios (`CreateListingStep1.tsx`), permitindo busca rápida por código de barras / ISBN digitado.

- **Consequências:**
  - Reduz drasticamente o atrito e o tempo para publicar livros no catálogo comunitário.
  - Não obriga o uso de hardware de câmera (funciona por digitação ou leitor de código de barras USB/Bluetooth/teclado).
  - Resiliente: se a API estiver fora do ar ou o livro não constar no catálogo global da Open Library, o usuário continua livre para preencher título e autor manualmente.
