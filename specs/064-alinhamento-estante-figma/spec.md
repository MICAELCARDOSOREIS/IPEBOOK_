# Especificação 064 — Alinhamento Visual da Estante ao Figma 05.01 e 05.02

## 1. Visão Geral

Esta especificação define o alinhamento visual e estrutural da tela **Minha estante** (`src/view/listings/myListings.tsx`) com os designs canônicos do Figma:
- `05.01 · Estante` (nó `25:302`)
- `05.02 · Estante vazia` (nó `25:430`)

O objetivo é proporcionar uma experiência editorial e imersiva para a gestão dos livros do usuário em Piripiri, alinhada à identidade visual do IpêBook (serifa da marca, Material 3 Tabs, capas ilustradas em miniatura e Extended FAB).

---

## 2. Requisitos de Usuário e Negócio

### RN-01: Cabeçalho Editorial "Minha estante"
- A tela deve exibir no topo a manchete editorial `"Minha estante"` usando a tipografia serifada da marca (`tokens.fontFamily.brand`, tamanho 32-34px, cor `tokens.colors.primary` / `tokens.colors.onSurface`).
- Quando a tela for visualizada como destino principal da navegação inferior, não deve apresentar botão de retorno (`←`), preservando o layout limpo e direto do Figma. Botão de voltar só é exibido se `onBack` for explicitamente acionado fora da navegação raiz.

### RN-02: Abas de Navegação Material 3
- A tela deve disponibilizar 3 abas horizontais com divisória inferior e indicador de seleção ativo:
  1. **Anúncios (n):** lista os livros cadastrados pelo usuário.
  2. **Propostas (n):** lista as propostas de troca, compra ou doação recebidas em aberto.
  3. **Concluídos:** lista livros com negociações concluídas ou histórico finalizado.
- O indicador ativo deve ter altura e cor de destaque (`tokens.colors.primary`), e a divisória inferior deve usar `tokens.colors.outlineVariant`.

### RN-03: Formatação e Identidade Visual das Linhas de Livro
- Cada linha de livro (`ShelfRow`) deve seguir o formato M3 `ListItem`:
  - Capa (`BookCover`): 56x80px com cantos suaves, lombada e moldura.
  - Título do livro: destaque com tipografia `titleMedium` / `onSurface`.
  - Supporting text: `<Preço/Modalidade> · <Bairro> · <Status> · <Modalidade>` (ou equivalente semântico), em 14px `onSurfaceVariant`.
  - Trailing element: ícone de seta (`chevronRight`), cor `onSurfaceVariant`.

### RN-04: Dica de Orientação e Extended FAB
- Abaixo da lista de livros deve constar a dica de rodapé do Figma:
  *"Toque em um livro para editar, pausar ou marcar como concluído."*
- Botão de ação flutuante (`ExtendedFAB`):
  - Rótulo `"Anunciar livro"` com ícone `add` (`+`).
  - Estilo M3 Primary/Secondary Container com sombra e acessibilidade garantida.

### RN-05: Estado Vazio Alinhado ao Figma 05.02
- Quando o usuário não tiver livros cadastrados, exibir o estado `05.02 · Estante vazia`:
  - Ilustração em container circular (`secondaryContainer`).
  - Título serifado *"Sua estante começa com um livro"*.
  - Subtítulo explicativo: *"Anuncie um livro para vender, trocar ou doar na sua região."*.
  - Botão principal *"Anunciar livro"* e botão secundário/link *"Como funciona"*.

---

## 3. Critérios de Aceite

1. O cabeçalho exibe `"Minha estante"` na tipografia serifada da marca sem botão de voltar na visualização de aba raiz.
2. As 3 abas (`Anúncios`, `Propostas`, `Concluídos`) estão presentes com contadores dinâmicos e indicador M3.
3. Cada linha de anúncio exibe capa compacta (56x80px), título, detalhes de bairro/modalidade/status e chevron.
4. A dica *"Toque em um livro para editar, pausar ou marcar como concluído."* aparece após a lista.
5. O botão flutuante `"Anunciar livro"` está presente e acessível quando há anúncios.
6. 100% dos testes unitários e de componente passam na suíte (`npm test`).
