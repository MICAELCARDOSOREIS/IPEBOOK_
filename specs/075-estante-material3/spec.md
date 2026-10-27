# Spec 075 — Estante no padrão Figma `05.04`–`05.08`, Material 3 no Android e visual do Figma no iPhone

**Data:** 26 de outubro de 2026
**Telas no Figma:** `05.04 · Estante · Concluídos`, `05.05 · Propostas vazia`, `05.06 · Concluídos vazio`, `05.07 · Estante após…`, `05.08 · Estante após…`.
**Tela afetada:** `src/view/listings/myListings.tsx` e submódulos (aba Estante).

## Escopo

1. **Cabeçalho**: título "Estante" em serifa, subtítulo "Seus livros em Piripiri" e botão de ícone "+"
   ("Anunciar livro") no canto superior direito, no lugar do FAB estendido.
2. **Resumo em três cartões** com a cor de cada modalidade: anúncios à venda, em troca e para doar.
3. **Seletor de abas Anúncios / Propostas / Concluídos**:
   - Android: *segmented buttons* do Material 3 (contorno, seleção em `secondaryContainer` com ✓).
   - iPhone: controle segmentado do Figma (trilho cinza, segmento selecionado em superfície clara).
   - Propostas mostra um distintivo com a quantidade em aberto (antes "Propostas (n)").
4. **"Precisa da sua atenção"** no topo da aba Anúncios quando há proposta pendente: nome de quem pediu,
   livro e botão "Ver proposta", que abre os pedidos recebidos.
5. **Lista de anúncios** em cartão `surface-container-low`, com cabeçalho "n anúncios" e linhas com capa,
   título, resumo e etiqueta de situação (Disponível, Pausado, Reservado). Filtros por situação mantidos.
6. **Estados vazios** de Propostas ("Nenhuma proposta agora.") e Concluídos ("Nada concluído ainda.")
   com ícone em círculo, manchete em serifa, texto e botão "Ver meus anúncios", que volta à aba Anúncios.

## Fora do escopo / desvios

- "Recusar" direto no cartão de atenção: recusar continua na tela de pedidos recebidos.
- O cartão "doados" do Figma conta doações concluídas, que o app não totaliza por modalidade; o terceiro
  cartão mostra os anúncios **para doar**.
- "Editar" em lote não existe; cada anúncio continua sendo editado pela tela de gerenciamento.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Cabeçalho "Estante", subtítulo e "+" que abre o anúncio | teste de componente |
| CA2 | Cartões contam anúncios por modalidade | teste de componente |
| CA3 | Abas trocam o conteúdo; Propostas mostra a quantidade em aberto | teste de componente |
| CA4 | Proposta pendente gera "Precisa da sua atenção" com "Ver proposta" | teste de componente |
| CA5 | Estados vazios de Propostas e Concluídos voltam para Anúncios | teste de componente |
| CA6 | Android com aparência M3, conferida no Galaxy A16 | captura via ADB |
| CA7 | iPhone com o controle segmentado do Figma | teste por plataforma (sem aparelho iOS) |
