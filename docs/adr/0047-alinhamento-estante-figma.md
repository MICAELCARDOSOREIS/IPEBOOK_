# ADR 0047 — Alinhamento Visual da Tela Minha Estante ao Figma 05.01 e 05.02

- **Status:** Aceito
- **Data:** 23 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 064 (Alinhamento Visual da Estante), Figma `05.01 · Estante` (`25:302`), `05.02 · Estante vazia` (`25:430`).
- **Relacionado a:** ADR 0004 (Design System e Tokens), ADR 0007 (Serifa da Marca), ADR 0011 (Navegação 3 destinos), ADR 0019 (Componentes e MVVM), ADR 0036 (Tema Escuro).

---

## Contexto

A tela da estante (`src/view/listings/myListings.tsx`) gerencia os livros cadastrados pelo usuário e suas propostas recebidas. Inicialmente, a tela utilizava uma `TopAppBar` genérica com botão de retorno (`←`) e um seletor simples de abas com duas opções (`Anúncios` e `Propostas`). No design canônico do Figma (`05.01 · Estante` e `05.02 · Estante vazia`), a estante é um destino de topo que adota o cabeçalho editorial serifado da marca (*"Minha estante"*), abas Material 3 completas com indicador inferior ativo e linha divisória horizontal (`Anúncios`, `Propostas` e `Concluídos`), além de itens de lista em proporções precisas com miniatura de capa 56x80px e Extended FAB destacado.

## Decisão

1. **Cabeçalho Editorial e Ausência de Voltar na Raiz:**
   - Adotar o título editorial em tipografia serifada da marca (`tokens.fontFamily.brand`, 34px, cor primária da marca `#58331f`).
   - Omitir o botão de voltar quando a tela estiver atuando como aba raiz da navegação inferior, preservando a coerência com as demais telas raiz (Home e Perfil). Caso `onBack` seja fornecido e a tela esteja em pilha de navegação secundária, um botão de retorno sutil pode ser disponibilizado.

2. **Abas Material 3 com 3 Destinos:**
   - Implementar três abas canônicas:
     - `Anúncios (n)`: livros ativos e pausados do usuário.
     - `Propostas (n)`: negociações e propostas recebidas.
     - `Concluídos`: anúncios finalizados ou histórico de livros doados/trocados.
   - Utilizar linha divisória horizontal (`Divider` em `tokens.colors.outlineVariant`) e indicador de aba ativa (`Indicator` em `tokens.colors.primary`).

3. **Padronização das Linhas de Livro (`ShelfRow`):**
   - Miniatura de capa de 56x80px através de `BookCover` com lombada e cantos suaves.
   - Textos estruturados: título proeminente em `onSurface` e linha de suporte contendo `<Preço/Modalidade> · <Bairro> · <Status> · <Modalidade>` em `onSurfaceVariant`.
   - Seta de navegação trailing (`chevronRight`) para gerenciar o anúncio.

4. **Dica de Orientação e Extended FAB:**
   - Posicionar a dica de orientação após a listagem: *"Toque em um livro para editar, pausar ou marcar como concluído."*.
   - Botão flutuante estendido (`ExtendedFAB`) com ícone `+` e texto `"Anunciar livro"`.

## Consequências

- **Positivas:**
  - Pleno alinhamento com o Figma `05.01` e `05.02`.
  - Clareza na separação entre anúncios vigentes, propostas ativas e negociações concluídas.
  - Experiência visual coerente e sofisticada com a identidade da marca.
- **Negativas / Limitações:**
  - Ajustes pontuais nos testes de componente para refletir as três abas M3 e novos seletores semânticos.
