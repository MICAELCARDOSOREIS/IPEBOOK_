# Relatório do Grupo B · Livro e Comunidade (Spec 072)

**Data:** 25 de outubro de 2026  
**Responsável:** Micael Cardoso Reis  

## 1. Telas Alinhadas

| Tela Figma | Arquivo | Status | O que mudou |
| :--- | :--- | :--- | :--- |
| `03.01 · O Pequeno Príncipe — venda` (`10:563`) | `src/view/listings/bookDetail.tsx` | Alinhada | Barra M3 com Voltar + título "Detalhes" + ícones de ação (favoritar e compartilhar). Destaque de capa em contêiner arredondado suave (`coverContainer`), título em serifa (`fontFamily.brand`, 24px), autor, preço em formato nacional (`R$ 25,00`), badge "À venda", linha de metadados (`Bom estado · Literatura · Centro`), card do anunciante com avatar e chevron, caixa de orientação e barra fixa inferior de solicitação/conversa. |
| `03.02 · Dom Casmurro — troca` (`11:2`) | `src/view/listings/bookDetail.tsx` | Alinhada | Tag "Troca" e indicação de preço como "Por outro livro", orientação de troca no ponto de encontro comunitário. |
| `03.03 · A hora da estrela — doação` (`11:68`) | `src/view/listings/bookDetail.tsx` | Alinhada | Tag "Doação" e indicação de preço como "Gratuito", orientação de doação comunitária. |
| `03.04 · Perfil de Ana Paula` (`19:21`) | `src/view/listings/publicProfile.tsx` | Alinhada | Identidade centralizada com Avatar (80px), nome em serifa (`Source Serif 4`, 26px), subtítulo editorial ("Conheça a pessoa antes de combinar."), 3 cards de superfície (Avaliações/trocas em destaque, Negociações concluídas, Tempo na comunidade) e botões de ação fixos ("Conversar com {nome}", "Denunciar ou bloquear"). |
| `03.06 · Fotos do anúncio` (`424:24630`) | `src/view/listings/photoGallery.tsx` | Alinhada | Visualização em modal de tela cheia com contador, swipe horizontal, acessibilidade e atalhos de teclado. |
| `09.03 · Denunciar anúncio` (`27:1239`) | `src/view/listings/reportListing.tsx` | Alinhada | Layout com motivos em radio group, campo de detalhes opcional e botão "Enviar denúncia". |
| `09.04 · Denúncia enviada` (`370:6727`) | `src/view/listings/reportListing.tsx` | Alinhada | Estado de sucesso com manchete serifada ("Recebemos sua denúncia."), mensagem institucional e botão de retorno. |
| `09.02 · Bloquear usuário` (`27:1211`) | `src/view/profile/blockedUsers.tsx` | Alinhada | Diálogo de confirmação com aviso de consequências comunitárias e lista de pessoas bloqueadas. |

## 2. Validação Executada
- `tests/components-mocked/bookDetailView.test.tsx` (18 testes): 100% aprovados.
- `tests/integration/sc006DetalheLivroIntegration.test.tsx` (2 testes): 100% aprovados.
- `tests/components-mocked/publicProfileView.test.tsx` (13 testes): 100% aprovados.
- `tests/components/reportListingView.test.tsx` (5 testes): 100% aprovados.
- Total: 38 testes executados e aprovados.

