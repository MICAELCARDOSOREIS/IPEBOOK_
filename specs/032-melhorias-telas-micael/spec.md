# Especificação de Funcionalidade: Melhorias de Experiência e Filtros nas Telas do Micael (Issues #160 a #165)

**Branch**: `feat/032-melhorias-telas-micael`  
**Data**: 2026-10-20  
**Status**: Em implementação  
**Issues vinculadas**: #160, #161, #162, #163, #164, #165 (`pessoa:micael`)

## 1. Contexto e Objetivo

Entregar seis melhorias de usabilidade, acessibilidade e conformidade LGPD exclusivamente nas telas e fluxos sob responsabilidade do Micael (`pessoa:micael`), mantendo separação absoluta dos arquivos e issues da Maria Clara (`pessoa:maria-clara`):

1. **Issue #160 (Fluxo 05 — Publicar e Editar Anúncio)**: Contador regressivo de caracteres (`0/280`) em tempo real no campo de descrição de `createListing.tsx` e `editListing.tsx`, aviso quando o limite de 280 caracteres é excedido e indicador de rascunho ativo com ação acessível de limpar rascunho em `createListing.tsx`.
2. **Issue #161 (Fluxo 07 — Minha Estante)**: Filtro rápido por status do anúncio (`Todos`, `Ativos`, `Pausados`, `Concluídos`) em `myListings.tsx` com contadores por filtro e estado vazio contextual.
3. **Issue #162 (Fluxo 06 — Meus Pedidos e Pedidos Recebidos)**: Filtro rápido por status do pedido (`Todos`, `Pendentes`, `Aceitos`, `Histórico`) em `requestListLayout.tsx` (atendendo `/meus-pedidos` e `/pedidos-recebidos`) com contadores e estado vazio contextual.
4. **Issue #163 (Fluxo 09 — Central de Notificações)**: Alternância rápida entre `Todas` e `Não lidas` em `notifications.tsx`, contador de pendências e estado vazio específico quando todas as notificações estiverem lidas.
5. **Issue #164 (Fluxo 11 — Central de Ajuda e FAQ)**: Busca instantânea por palavra-chave em `helpAndFaq.tsx` filtrando perguntas e respostas (insensível a maiúsculas/minúsculas e acentos) com estado vazio e botão para limpar busca.
6. **Issue #165 (Fluxo 07/11 — Portabilidade LGPD na Exclusão de Conta)**: Botão acessível para exportar/visualizar os próprios dados pessoais estruturados (Art. 18, V da LGPD) em `deleteAccount.tsx`, integrado ao `ExportUserDataUseCase` via `useDeleteAccountViewModel.ts` e `src/app/excluir-conta.tsx`.

## 2. Fronteira de Escopo (Isolamento Estrito)

- **Arquivos permitidos (Micael)**:
  - `src/view/listings/createListing.tsx`, `src/view/listings/editListing.tsx`, `src/view/listings/myListings.tsx`
  - `src/view/requests/requestListLayout.tsx`
  - `src/view/notifications/notifications.tsx`
  - `src/view/help/helpAndFaq.tsx`
  - `src/view/auth/deleteAccount.tsx`, `src/viewmodel/useDeleteAccountViewModel.ts`, `src/app/excluir-conta.tsx`
  - Arquivos de teste correspondentes em `tests/components/` e `tests/hooks/`.
- **Arquivos proibidos (Maria Clara)**:
  - `src/view/home.tsx`, `src/app/index.tsx`, `src/view/search/search.tsx`, `src/app/pesquisa.tsx`, `src/view/listings/bookDetail.tsx`, `src/view/listings/publicProfile.tsx`, `src/view/listings/photoGallery.tsx`, `src/app/perfil.tsx`, `src/view/profile/*`, `src/view/components/NavigationBar.tsx`, `src/app/_layout.tsx`.

## 3. Critérios de Aceite

- **CA-01 (#160)**: `CreateListingView` e `EditListingView` exibem `${description.length}/280 caracteres` no texto de apoio da descrição, destacam erro caso `description.length > 280` e `CreateListingView` permite limpar o rascunho em andamento quando houver dados preenchidos.
- **CA-02 (#161)**: `MyListingsView` exibe chips de filtro (`Todos`, `Ativos`, `Pausados`, `Concluídos`) com `accessibilityRole="button"` e `accessibilityState={{ selected }}`, filtra a lista de livros anunciados e mostra estado vazio contextual quando o filtro não possui itens.
- **CA-03 (#162)**: `RequestListLayout` exibe chips de filtro (`Todos`, `Pendentes`, `Aceitos`, `Histórico`), filtra pedidos enviados/recebidos e exibe estado vazio contextual quando o filtro selecionado estiver vazio.
- **CA-04 (#163)**: `NotificationsView` permite alternar entre `Todas` e `Não lidas`, mostra a contagem de não lidas e exibe mensagem contextual quando não há notificações não lidas.
- **CA-05 (#164)**: `HelpAndFaqView` possui campo de busca por palavra-chave que filtra o acordeão de perguntas frequentes por pergunta ou resposta (sem diferenciar acentos ou caixa) e botão de limpar busca quando não houver resultados.
- **CA-06 (#165)**: `DeleteAccountView` exibe botão acessível `"Exportar meus dados (LGPD)"` antes da exclusão definitiva e apresenta o resumo/confirmação dos dados exportados.
- **CA-07**: Todos os tokens visuais vêm exclusivamente de `src/view/tokens.ts`, respeitando as 7 camadas da arquitetura MVVM (`npm run check:architecture`) e passando em `npm run verify:release`.
