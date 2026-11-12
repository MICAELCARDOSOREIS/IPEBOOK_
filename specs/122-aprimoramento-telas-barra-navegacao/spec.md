# Spec 122 — Aprimoramento das Telas da Barra de Navegação e IHC

**Status:** Concluído  
**Data:** 3 de novembro de 2026  
**Contexto:** IHC / Usabilidade Móvel / Material 3 / Microinterações / Acessibilidade  
**ADR vinculada:** [0096](../../docs/adr/0096-aprimoramento-telas-barra-navegacao.md)  

## 1. Problema

A barra inferior de navegação do IpêBook conecta os cinco destinos principais do aplicativo: *Início*, *Explorar*, *Estante*, *Conversas* e *Perfil*. Uma análise aprofundada de Interação Humano-Computador (IHC) e experiência móvel identificou oportunidades concretas para otimizar os fluxos e a clareza de uso nessas telas:

1. **Estante (`/meus-anuncios`):**
   - O leitor precisa clicar no card do livro e abrir a tela de gerenciamento (`manageListing.tsx`) para conseguir compartilhar seu anúncio no WhatsApp.
   - Em Piripiri, onde grupos de bairro e status do WhatsApp são os principais canais de circulação, a ausência de um botão de 1 toque direto na estante gera atrito e reduz o compartilhamento dos livros.
2. **Conversas (`/meus-pedidos`):**
   - Os cards de conversa exibem o nome da pessoa e o título do livro, mas não trazem a etiqueta da modalidade (Venda, Troca, Doação) na lista principal.
   - O leitor precisa memorizar ou abrir a negociação para lembrar se aquele livro estava sendo comprado, trocado ou doado. Falta também maior destaque visual para o status do encontro seguro agendado.
3. **Início (`/`):**
   - O feed comunitário já exibe o seletor de bairro, mas a seção de livros locais pode destacar com mais calor comunitário o bairro ativo do leitor (ex.: contagem de livros disponíveis no bairro) e orientar com clareza quem deseja explorar vizinhos próximos.
4. **Perfil (`/perfil`):**
   - O perfil reúne dados de identidade e métricas numéricas, mas não celebra os marcos comunitários do leitor em Piripiri através de selos visuais (*Leitor de Piripiri*, *Estante Ativa*, *Ponto Seguro*).
   - Selos comunitários incentivam boas práticas de trocas presenciais, pontualidade e doações na cidade.

## 2. Escopo da Solução

1. **Estante (`src/view/listings/myListings.tsx`, `myListingsListingsTab.tsx`, `shelfRow.tsx`):**
   - Adicionar botão de compartilhamento rápido no WhatsApp diretamente no card da estante (`ShelfRow`).
   - Integrar com `useShareListingViewModel` para disparar a mensagem formatada com link do anúncio.
   - Garantir área de toque acessível (mínimo 44x44dp) e evitar que o clique no botão dispare a abertura da tela de gerenciamento.
2. **Conversas (`src/view/conversations/conversations.tsx`):**
   - Exibir a etiqueta da modalidade (`Tag variant={item.listing.modality}`) no card da conversa.
   - Melhorar a hierarquia visual dos dados da negociação (nome da pessoa, modalidade do livro, prévia da mensagem e tempo relativo).
3. **Início (`src/view/home.tsx`):**
   - Refinar a identificação de livros locais no carrossel "Perto de você" com badge/pílula de contagem de livros no bairro selecionado.
4. **Perfil (`src/view/profile/profileHub.tsx`):**
   - Criar seção de **Selos Comunitários de Piripiri**:
     - *Leitor de Piripiri:* Membro registrado com bairro definido na cidade.
     - *Estante Ativa:* Possui publicações disponíveis para circulação.
     - *Ponto Seguro:* Realizou encontros nos pontos de encontro seguros públicos de Piripiri.

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Cada livro na Estante (`ShelfRow`) possui botão acessível de compartilhamento no WhatsApp de 1 toque sem disparar navegação indesejada. | Testes em `tests/components/shelfRow.test.tsx` e `tests/components/myListingsView.test.tsx` |
| CA2 | A lista de Conversas (`conversations.tsx`) exibe a etiqueta de modalidade (Venda/Troca/Doação) no card da negociação. | Testes em `tests/components-mocked/chatView.test.tsx` e `tests/components/conversationsView.test.tsx` |
| CA3 | A tela inicial (`home.tsx`) reforça visualmente o contexto do bairro com contadores e estilo consistente. | Testes em `tests/components-mocked/homeViewMocked.test.tsx` |
| CA4 | O Perfil (`profileHub.tsx`) apresenta a seção de Selos Comunitários de Piripiri com acessibilidade e cores semânticas. | Testes em `tests/components/profileHubView.test.tsx` |
| CA5 | Todas as verificações de TypeScript, arquitetura, numeração e suíte Vitest passam com 100% de sucesso. | `npm run validate` |
