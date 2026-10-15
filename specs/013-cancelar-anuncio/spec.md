# Especificação 013: Cancelamento e Remoção de Anúncio Próprio

## 1. Contexto e Motivação
Na tela "Meus Anúncios" (`/meus-anuncios`), a pessoa usuária visualiza seus livros cadastrados no catálogo. Caso ela tenha doado o livro fora do aplicativo, decidido não mais se desfazer do exemplar ou cadastrado informações erradas, deve ser possível cancelar e remover o anúncio diretamente pela lista, mantendo o catálogo da comunidade de Piripiri sempre confiável e sem anúncios fantasmas.

## 2. Escopo
- **Incluído:**
  - Método `delete(id: string): Promise<void>` no contrato `IBookDataSource` e suas implementações (`MemoryBookDataSource` e `SupabaseBookDataSource`).
  - Caso de uso `cancelListing(bookId: string, sessionUserId: string | null)` em `IBookUseCases` e `BookUseCases`.
  - Regra de domínio: impedir exclusão se o livro estiver no status `"reserved"` (com negociação aceita em andamento), instruindo a resolver a negociação primeiro.
  - Regra de domínio: verificar propriedade do anúncio (`ownerId === sessionUserId`).
  - ViewModel `useMyListingsViewModel` expondo ação `cancelListing(bookId)`.
  - View `MyListings` exibindo botão acessível "Remover anúncio" em itens disponíveis com feedback de carregamento e remoção.
  - Testes unitários, de hook e de componentes.
- **Fora de escopo:**
  - Alterações no Perfil da Maria Clara (Issue #55).

## 3. Critérios de Aceite
1. **CA1 — Autorização de remoção:** Apenas a pessoa dona do anúncio pode removê-lo. Tentativas não autorizadas lançam erro de autenticação/permissão.
2. **CA2 — Proteção de negociação ativa:** Se o livro estiver reservado (`status: "reserved"`), a exclusão é bloqueada com mensagem clara: *"Não é possível remover anúncio com negociação aceita em andamento."*.
3. **CA3 — Atualização imediata da lista:** Ao remover com sucesso, o anúncio sai imediatamente da listagem da tela "Meus Anúncios" e do catálogo geral.
4. **CA4 — Acessibilidade e confirmação:** O botão "Remover anúncio" possui rótulo acessível e área de toque mínima de 48dp.
