# Especificação 112 — Suporte a Box e Coleções de Livros

Status: aprovada; implementação em andamento. ADR: [0086](../../docs/adr/0086-suporte-a-box-e-colecoes-de-livros.md).

## Objetivo
Permitir que leitores da comunidade de Piripiri anunciem, gerenciem e encontrem boxes, coleções e conjuntos com múltiplos volumes (ex: trilogias, sagas completas e coleções didáticas) de maneira clara e distinta de livros individuais, com indicação do número de volumes e destaque visual nos cartões e detalhes do livro.

## Escopo
- **Modelo de Dados e Banco de Dados**:
  - Novas colunas em `public.v2_books`:
    - `is_box` (boolean, padrão `false`, obrigatório).
    - `box_volumes_count` (integer, opcional, restrito a valores entre 2 e 100).
  - Restrição de integridade: se `box_volumes_count` for preenchido, `is_box` deve ser verdadeiro.
  - Criação de índice para otimização de consultas de catálogo filtrando por boxes.
- **Camada de Domínio e Casos de Uso**:
  - Propriedades `isBox?: boolean` e `boxVolumesCount?: number` nas entidades `Book`, parâmetros `CreateListingParams`, `EditListingParams` e filtros `BookCatalogFilter`.
  - Validação de entrada: `boxVolumesCount`, quando presente, deve ser inteiro entre 2 e 100.
  - Mapeamento em `MemoryBookDataSource` e `SupabaseBookDataSource`.
- **Camada de Apresentação (MVVM)**:
  - Assistente de cadastro (`createListing.tsx` - Etapa 3 de Detalhes) e edição (`editListing.tsx`):
    - Checkbox/Switch acessível: "É um box ou coleção de livros?".
    - Campo opcional condicional: "Quantidade de volumes" (com contador e validação).
    - Persistência no rascunho de anúncio.
  - Cartão do catálogo e estante (`ReaderCard.tsx` / `BookCard`):
    - Selo / Tag discreta "Box" ou "Box · X vols" na área de identificação.
  - Detalhe do livro (`bookDetail.tsx`):
    - Tag em destaque Material 3 indicando "Box de livros" com a contagem de volumes quando informada.
  - Filtros do catálogo (`WebFilterSidebar.tsx` e filtros rápidos):
    - Opção de filtro "Apenas boxes e coleções".
- **Fora do escopo**:
  - Cadastro de títulos ou ISBNs individuais para cada livro que compõe o box (o box é negociado como um anúncio único).

## Regras de Negócio
- **RN-01**: Um anúncio pode ser marcado como box de livros (`isBox: true`).
- **RN-02**: O número de volumes é opcional. Quando informado, deve ser um número inteiro maior ou igual a 2 e menor ou igual a 100.
- **RN-03**: Ao desmarcar a opção de box, qualquer número de volumes informado anteriormente é limpo (`undefined` / `null`).
- **RN-04**: O catálogo permite filtrar apenas boxes (`onlyBoxes: true`), retornando exclusivamente livros com `is_box = true`.
- **RN-05**: Rascunhos locais e no servidor devem persistir e restaurar o estado do box (`isBox` e `boxVolumesCount`).

## Critérios de Aceite e Verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Banco de dados rejeita `box_volumes_count < 2` ou `> 100` e rejeita volume sem `is_box` | Script SQL PGlite em `verificar-migracoes.mjs` |
| CA2 | Cadastro de anúncio permite marcar box e informar volumes | Teste de unidade / hook em `useCreateListingViewModel.test.tsx` |
| CA3 | Edição de anúncio permite atualizar status de box e volumes | Teste de unidade / hook em `useEditListingViewModel.test.tsx` |
| CA4 | Filtro do catálogo com `onlyBoxes: true` traz apenas boxes | Teste de unidade em `bookCatalogUseCases.test.ts` e `searchFilters.test.ts` |
| CA5 | Cartões e detalhes exibem a indicação visual de Box quando ativo | Testes de componente em `bookDetailInteractiveStatus.test.tsx` e `readerCard.test.tsx` |
