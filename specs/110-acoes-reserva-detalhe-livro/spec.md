# Spec 110 — Ações Interativas de Reserva e Acompanhamento no Detalhe do Livro (Material 3 Expressive)

**Data:** 30 de outubro de 2026  
**Status:** Em implementação  
**Telas afetadas:**  
- `src/view/listings/bookDetail.tsx` (rota `/livro/[id]`)  
- `src/view/listings/ReservedListingSheet.tsx` (novo componente de folha M3)  
- `src/view/components/Book3D.tsx` (dica visual de affordance 3D)  
- `src/app/livro/[id].tsx` (conexão de rotas)  
- `src/app/pesquisa.tsx` e `src/view/search/search.tsx` (suporte a `categoria` inicial)  

---

## 1. Problema

Na tela de Detalhes do Livro (`BookDetail`), quando um exemplar está com o status `reserved` (Reservado) ou `delivered` (Entregue), a barra de ações inferior exibe apenas um texto estático dentro de uma `View` (`statusPill`). Quando o leitor toca em "Reservado", nada acontece:
1. O **dono do anúncio** não consegue acessar rapidamente a proposta aceita ou a gestão da negociação a partir do detalhe do livro.
2. O **leitor que solicitou o livro** não tem atalho para acompanhar o pedido ou abrir o chat de entrega.
3. **Outros leitores e visitantes** ficam sem contexto sobre o que significa a reserva, não têm opção de favoritar para entrar em lista de espera (caso a reserva caia em até 7 dias) e não recebem sugestões para encontrar outros livros similares em Piripiri.
4. Além disso, o modelo do livro 3D não possui indicação visual evidente de que é interativo e responde ao toque/rotação para exibir a contracapa e sinopse.

---

## 2. Escopo

1. **Pílula de Status Interativa no Design System (M3 Expressive)**:
   - Substituir a `View` estática `statusPill` por um botão interativo expressivo com `Pressable`, feedback tátil `withPress`, efeito de mola e cantos arredondados do M3.
   - Apresentar rótulo acessível e indicador visual claro.
2. **Navegação Contextual por Papel**:
   - **Dono do anúncio** (`sessionUserId === book.ownerId`):
     - Rótulo: `"Reservado · Acompanhar"`.
     - Ação: navega para Gerenciar Anúncio (`/gerenciar-anuncio/[id]`) ou Meus Anúncios.
   - **Solicitante / Participante da negociação**:
     - Rótulo: `"Negociação solicitada"` ou `"Reservado · Ver pedido"`.
     - Ação: navega diretamente para Meus Pedidos (`/meus-pedidos`).
   - **Terceiro Leitor / Visitante**:
     - Rótulo: `"Reservado · Saiba mais"`.
     - Ação: abre a folha informativa do Material 3 Expressive (`ReservedListingSheet`).
3. **Folha Informativa de Reserva (`ReservedListingSheet`)**:
   - Modal com alça (`handle`), título e ícone temático (`bookmark` para reserva, `check_circle` para entregue).
   - Explicação em português claro sobre o ciclo da reserva (encontros confirmados em até 7 dias).
   - **Ação 1 — Favoritar / Lista de Espera**: permite favoritar o livro com 1 toque diretamente na folha para ser notificado se o anúncio for reativado (ou exibe que já está nos favoritos).
   - **Ação 2 — Explorar Semelhantes**: atalho para buscar outros livros na mesma categoria em Piripiri (`/pesquisa?categoria=...`).
   - **Ação 3 — Perfil do Anunciante**: atalho para ver outros livros do mesmo leitor (`/perfil/[ownerId]`).
   - **Ação Fechar**: botão "Entendi" com estilo tonal/text.
4. **Dica Interativa no Livro 3D (Affordance)**:
   - Adicionar uma badge sutil e elegante com texto `"3D · Toque para virar"` no container da capa 3D, facilitando o descobrimento da contracapa e sinopse.
5. **Suporte a categoria inicial na rota de pesquisa**:
   - Atualizar `src/app/pesquisa.tsx` e `src/view/search/search.tsx` para aceitar parâmetro `categoria` inicial vindo dos atalhos.

---

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| **CA1** | Pílula "Reservado" é interativa com papel `button`, feedback `withPress` e rótulo acessível | Teste de componente e TalkBack |
| **CA2** | Dono do anúncio é direcionado para gerenciar anúncio/propostas ao tocar | Teste de componente e navegação |
| **CA3** | Leitor que solicitou o livro é direcionado para Meus Pedidos ao tocar | Teste de componente e navegação |
| **CA4** | Terceiro leitor abre a folha `ReservedListingSheet` ao tocar em "Reservado" | Teste de componente |
| **CA5** | `ReservedListingSheet` permite favoritar diretamente, buscar na categoria e abrir perfil do anunciante | Testes unitários e de componente |
| **CA6** | Livro 3D exibe badge interativa "3D · Toque para virar" | Teste de componente |
| **CA7** | 100% de conformidade arquitetural (`check:architecture`), tipagem estrita (`typecheck`) e numeração (`check:numbering`) | Scripts de validação |
