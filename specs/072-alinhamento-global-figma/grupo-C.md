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

