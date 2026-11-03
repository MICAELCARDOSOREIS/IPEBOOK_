# 0091. Padronização Universal de Rolagem e Blindagem contra Duplo Toque

**Data:** 3 de novembro de 2026  
**Status:** Aceito  
**Contexto Técnico:** `src/view/scrollProps.ts`, `src/view/components/ScreenContainer.tsx`, `src/view/home.tsx`, `src/view/search/search.tsx`, `src/view/listings/myListings.tsx`, `src/view/conversations/conversations.tsx`, `src/view/profile/profileHub.tsx`, `src/view/profile/settings.tsx`, `src/view/listings/bookDetail.tsx`, `src/view/conversations/chat.tsx`, `src/view/requests/requestDetail.tsx`, `src/view/requests/delivery.tsx`, `src/view/requests/scheduleMeeting.tsx`  
**Spec vinculada:** [117](../../specs/117-padronizacao-rolagem-e-blindagem-duplo-toque/spec.md)

## Contexto

Ao navegar pelo IpêBook em dispositivos móveis e emuladores, foram identificados dois pontos de atrito na experiência de uso (UX):
1. **Comportamento e estética de rolagem despadronizados:** Diversas telas (`ScrollView`, `FlatList`) não dispensavam o teclado virtual ao arrastar (`keyboardDismissMode="on-drag"` ausente em 44 arquivos), exibiam barras de rolagem cinzas nativas do sistema operacional sobrepondo cartões e badges (`showsVerticalScrollIndicator={false}` ausente em 92% das telas), causavam efeito elástico excessivo no Android (`overScrollMode="never"` ausente) e não reservavam espaçamento seguro de rodapé (`paddingBottom`) acima da barra inferior de abas flutuante, resultando em conteúdo final cortado ou colado à barra.
2. **Duplo toque abrindo telas repetidas:** Em aparelhos móveis, toques rápidos consecutivos em cards de livros, itens de conversa, atalhos de navegação do perfil ou botões de retorno disparavam múltiplos eventos de navegação. Embora a pilha do roteador possuísse mitigação parcial em algumas rotas, no nível do componente o evento disparava repetidamente, gerando cintilação visual e instabilidade de transição.

## Decisão

1. **Criação do módulo unificado `src/view/scrollProps.ts`:**
   - Centralizar as propriedades canônicas de rolagem vertical: `keyboardDismissMode: "on-drag"`, `keyboardShouldPersistTaps: "handled"`, `showsVerticalScrollIndicator: false`, `overScrollMode: "never"`.
   - Centralizar as propriedades canônicas de rolagem horizontal: `showsHorizontalScrollIndicator: false`, `keyboardShouldPersistTaps: "handled"`, `overScrollMode: "never"`.
   - Definir constantes de espaçamento seguro de rodapé (`scrollBottomPadding`): `withBottomBar: 96` (garantindo folga de 96px acima da barra inferior de abas) e `withoutBottomBar: 32` (para telas de fluxo/detalhe).
2. **Propagação no `ScreenContainer` e Telas Principais:**
   - O `ScreenContainer` incorpora nativamente `standardVerticalScrollProps` em seu `ScrollView` interno quando `scrollable` for verdadeiro.
   - Aplicação consistente nas telas centrais com abas (`Home`, `Busca`, `Meus Livros`, `Conversas`, `Central do Perfil`) e telas de fluxo (`Configurações`, `Detalhe do Livro`, `Chat`, `Detalhe do Pedido`, `Entrega do Livro`, `Combinar Encontro`).
3. **Blindagem contra Duplo Toque (`useGuardedPress`):**
   - Envolver todos os callbacks de navegação e abertura de detalhes com o hook `useGuardedPress(callback, 600)` no nível do componente.
   - Toques subsequentes dentro da janela de debounce de 600ms são descartados no hardware imediatamente antes de qualquer tentativa de troca de rota ou re-render.

## Consequências

- **Positivas:** A rolagem torna-se suave, limpa e uniforme em todo o aplicativo; o teclado fecha naturalmente ao rolar listas ou resultados de busca; o conteúdo final nunca fica escondido atrás da barra de navegação inferior; toques duplos acidentais são neutralizados sem abrir telas duplicadas ou causar cintilações.
- **Limitações:** Componentes com comportamentos de rolagem especializados (como carrosséis paginados) devem usar `standardHorizontalScrollProps` preservando suas propriedades específicas de paginação (`pagingEnabled`, `snapToInterval`).
