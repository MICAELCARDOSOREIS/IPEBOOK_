# Validação — Spec 041

**Data:** 21 de outubro de 2026

## O que foi testado

- `tests/components-mocked/homeViewMocked.test.tsx`: cabeçalhos acessíveis das duas seções;
  "Ver mais" de "Recém-adicionados" sem filtro e de "Doações disponíveis" com
  `{ modality: "donation" }`; a seção de doações exclui itens reservados/pausados (escopo por
  `testID` do carrossel, via `within`); seção de doações ausente quando não há nenhuma disponível;
  botões Anterior/Próximo do carrossel habilitam/desabilitam conforme a posição.
- `tests/components-mocked/searchView.test.tsx`: `initialModality` aciona `setModality` uma única
  vez ao abrir; sem o prop, `setModality` não é chamado.
- Testes pré-existentes de Home (`homeNegotiation.test.tsx`) e de catálogo
  (`homeViewMocked.test.tsx`) ajustados para a duplicação esperada de itens entre os carrosséis e a
  lista vertical (comportamento normal de seções de destaque sobre um catálogo único).

## Comandos executados

- `npx vitest run tests/`: **792 testes em 114 arquivos, todos aprovados.**
- `npm run validate` (typecheck, `check:architecture`, `test:sql` via PGlite, `test:coverage`):
  aprovado, código de saída 0. Uma violação de camada foi encontrada e corrigida no caminho: a
  rota `app/pesquisa.tsx` não pode importar tipos de `model`/`viewmodel` diretamente — a conversão
  do parâmetro de rota (`parseInitialModality`) foi movida para `view/search/search.tsx`.

## Limitações

- Navegação real no dispositivo/navegador (toque em "Ver mais", chegada à Pesquisa com o filtro já
  aplicado) não verificada manualmente nesta entrega; apenas o contrato de navegação foi validado
  por teste automatizado.
