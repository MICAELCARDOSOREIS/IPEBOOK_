# Relatório do Grupo C · Publicação e Gestão (Spec 072)

**Data:** 25 de outubro de 2026  
**Responsável:** Micael Cardoso Reis  

## 1. Telas Alinhadas

| Tela Figma | Arquivo | Status | O que foi conferido |
| :--- | :--- | :--- | :--- |
| `04.01 · Anunciar — etapa 1` (`12:210`) | `src/view/listings/createListingStep1.tsx` | Alinhada | Topo com botão Voltar e "Anunciar livro", indicador de progresso ("Etapa 1 de 3 / Livro"), atalho para leitura de ISBN com câmera, divisor "ou", seleção de modalidade com abas segmentadas (`Venda`, `Troca`, `Doação`), cartão de foto ao lado dos campos Título e Autor, campo de Preço em reais e nota informativa de boa luz. |
| `04.04 / 04.05 · Detalhes do livro` (`12:360`) | `src/view/listings/createListingStep2.tsx` | Alinhada | Indicador ("Etapa 2 de 3 / Detalhes"), chips de estado de conservação (`Novo`, `Bom estado`, `Com marcas`, `Desgastado`), seleção de categoria, campo de descrição com contador de 280 caracteres e seletor de bairro em Piripiri. |
| `04.06 · Revise o anúncio` (`19:327`) | `src/view/listings/createListingStep3.tsx` | Alinhada | Indicador ("Etapa 3 de 3 / Revisão"), card de resumo do livro com capa miniatura, título, autor, modalidade, preço e metadados, e botão de confirmação "Publicar anúncio". |
| `04.07 · Anúncio publicado` (`308:6058`) | `src/view/listings/createListingSuccess.tsx` | Alinhada | Ícone de confirmação, manchete "Seu livro ganhou um novo começo.", resumo visual do anúncio ativo, lista explicativa de próximos passos e botões de ação ("Ver estante" e "Voltar ao início"). |
| `04.08 · Gerenciar anúncio` (`149:3348`) | `src/view/listings/manageListing.tsx` | Alinhada | Manchete serifada "Seu livro, suas escolhas.", card de visualização do exemplar, indicador de status ativo/pausado/em negociação, opções com ícones ("Editar anúncio", "Pausar anúncio", "Marcar como concluído") e ação destrutiva "Excluir anúncio" com diálogo de confirmação. |
| `04.09 · Editar anúncio` (`254:4879`) | `src/view/listings/editListing.tsx` | Alinhada | Edição de fotos, título, autor, preço, conservação, categoria, descrição e bairro com botões "Salvar alterações" e "Cancelar". |

## 2. Validação Executada
- `tests/components/createListingView.test.tsx` (18 testes): 100% aprovados.
- `tests/components/editListingView.test.tsx` (10 testes): 100% aprovados.
- `tests/components/manageListingView.test.tsx` (8 testes): 100% aprovados.
- `tests/components-mocked/createListingScreen.test.tsx` (3 testes): 100% aprovados.
- Total: 39 testes executados e aprovados.

## 3. Continuação de 2026-10-26 — etapa "Detalhes" e barra de ação

Correção de mapeamento do relatório acima: o fluxo de publicação tem três etapas e
`04.05 · Detalhes do livro` (nó `12:360`) corresponde a `src/view/listings/createListingStep3.tsx`,
não a `createListingStep2.tsx` (esse é o `04.04 · Fotos do livro`, nó `28:685`). O frame
`04.06 · Revise o anúncio` não foi implementado; a revisão acontece na própria etapa de detalhes
e o resultado é exibido em `04.07 · Anúncio publicado`.

Trabalho escrito nessa continuação, tudo contra o frame `12:360`:

- **Bairro como campo** (nó `99:2259`) em vez da fila de 17 chips: abre o `NeighborhoodSelectorModal`
  com `allowAllNeighborhoods={false}`, exibe "Centro, Piripiri", permite limpar a escolha e mantém o
  texto de suporte "Só o bairro aparece no anúncio.".
- **Chips de grupo em 40 dp** (`size="regular"`) em Conservação e Categoria, e rótulo de grupo em
  16/24 peso médio (métrica do Figma), antes 18/26 semibold.
- **Contador da descrição à direita** (`39/280`), por `helperTextAlign` acrescentado a `TextField`.
- **Barra de ação fixa inferior** em `surface-container` (nós `12:269`, `28:750`, `12:413`) renderizada
  por `createListing.tsx` para as três etapas, com `KeyboardAvoidingView` no iOS; os botões deixaram
  as etapas. "Salvar rascunho" do frame fica fora: rascunhos persistidos pertencem à Spec 017.
- Validação: `tests/components/createListingView.test.tsx` com 20 testes (18 anteriores + seletor de
  bairro com modal, limpar bairro e barra de ação), suíte completa em 171 arquivos / 1205 testes,
  `tsc --noEmit` limpo e `check:architecture` sem violações. Conferência visual em dispositivo físico
  Android permanece pendente.

