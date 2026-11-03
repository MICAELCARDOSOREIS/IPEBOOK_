# Spec 117 — Padronização Universal de Rolagem e Blindagem contra Duplo Toque

**Status:** Concluída  
**Data:** 3 de novembro de 2026  
**Contexto:** UX / Usabilidade / Mobile / Performance / Acessibilidade  
**ADR vinculada:** [0091](../../docs/adr/0091-padronizacao-de-rolagem-e-blindagem-duplo-toque.md)

## 1. Problema

Em dispositivos móveis e emuladores, dois fatores geravam atrito na usabilidade do IpêBook:
1. **Comportamento e estética de rolagem despadronizados:**
   - 44 das 47 telas com rolagem não dispensavam o teclado ao rolar (`keyboardDismissMode="on-drag"` ausente), deixando o teclado aberto cobrindo livros, botões e mensagens.
   - Barras de rolagem verticais cinzas nativas do sistema ficavam visíveis sobrepondo cards, fotos e badges (`showsVerticalScrollIndicator={false}` ausente).
   - Efeito elástico do Android (`overScrollMode="never"` ausente) causava saltos e quebras de fluidez em transições de lista.
   - Conteúdo final no rodapé ficava escondido ou rente à barra inferior de navegação flutuante por falta de padding seguro padronizado.
2. **Duplo toque abrindo telas e detalhes duplicados:**
   - Toques rápidos consecutivos em cards de livros na Home ou Busca, itens de conversa, atalhos do perfil e botões de navegação disparavam múltiplos eventos no componente, resultando em sobreposição e instabilidade visual.

## 2. Escopo

1. **Módulo Central de Rolagem (`src/view/scrollProps.ts`):**
   - Criação de `standardVerticalScrollProps` com:
     - `keyboardDismissMode: "on-drag"`
     - `keyboardShouldPersistTaps: "handled"`
     - `showsVerticalScrollIndicator: false`
     - `overScrollMode: "never"`
   - Criação de `standardHorizontalScrollProps` com:
     - `showsHorizontalScrollIndicator: false`
     - `keyboardShouldPersistTaps: "handled"`
     - `overScrollMode: "never"`
   - Constantes de padding de rodapé `scrollBottomPadding`:
     - `withBottomBar: 96` (telas com barra inferior de abas)
     - `withoutBottomBar: 32` (telas de detalhes/fluxo sem barra de abas)
2. **Adoção Universal nos Contêineres e Telas:**
   - `ScreenContainer`: incorporar nativamente `standardVerticalScrollProps` quando `scrollable` for verdadeiro.
   - `Home`, `Busca`, `Meus Livros`, `Conversas`, `Central do Perfil`: aplicação dos padrões verticais e horizontais, além de `paddingBottom: 96`.
   - Telas de fluxo: `Configurações`, `Detalhe do Livro`, `Chat`, `Detalhe do Pedido`, `Entrega do Livro`, `Combinar Encontro`.
3. **Blindagem contra Duplo Toque (`useGuardedPress`):**
   - Envolver todos os callbacks de navegação e abertura de telas (`onNavigateToBookDetail`, `onNavigateToSignIn`, `onNavigateToUserProfile`, `onBack`, `onOpenNegotiation`, etc.) com `useGuardedPress(callback, 600)` para descarte imediato no hardware de toques repetidos.
4. **Testes e Validação:**
   - Teste unitário dedicado `tests/unit/scrollProps.test.ts` cobrindo todas as propriedades e constantes.
   - Suíte de 1.976 testes automatizados validada com 100% de sucesso.

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Todas as rolagens verticais das telas principais dispensam teclado no arrasto (`keyboardDismissMode="on-drag"`), ocultam o indicador cinza e desativam o overscroll. | `tests/unit/scrollProps.test.ts` e inspeção de código |
| CA2 | Rolagens horizontais de carrosséis e categorias ocultam o indicador horizontal. | `tests/unit/scrollProps.test.ts` e inspeção de código |
| CA3 | Telas com barra inferior de navegação possuem padding seguro de 96px ao final da rolagem, impedindo sobreposição de conteúdo. | Inspeção de estilos e layouts |
| CA4 | Toques rápidos repetidos em cards de livros, atalhos de perfil e botões de navegação não disparam chamadas duplicadas. | `useGuardedPress.test.ts` e testes de componentes |
| CA5 | 100% dos testes existentes continuam passando sem regressões. | `npm test -- --run` (1976/1976 aprovados) |
