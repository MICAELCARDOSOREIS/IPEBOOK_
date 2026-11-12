# Spec 120 — Refinamentos Visuais e Interativos das Telas

**Status:** Em implementação  
**Data:** 3 de novembro de 2026  
**Contexto:** UX / Usabilidade / Mobile / Feedback Tátil / Material 3  
**ADR vinculada:** [0094](../../docs/adr/0094-refinamentos-visuais-e-interativos-das-telas.md)  

## 1. Problema

Após a consolidação da blindagem de duplo toque e da padronização de rolagem, uma varredura crítica em todas as telas identificou oportunidades pontuais de refinamento para elevar a experiência do leitor em Piripiri:

1. **Favoritos no celular (`favorites.tsx`):**
   - Na versão web já existiam chips de filtro rápido (`Todos`, `Disponíveis`, `Reservados`), mas no celular a lista exibia todos os livros sem opção de filtro rápido.
   - O aviso de privacidade esclarecendo que *"Favoritos ficam só com você · Quem anunciou não vê quem salvou o livro"* era renderizado apenas na web, deixando o usuário móvel sem essa garantia visual.
2. **Entrega presencial por QR Code (`delivery.tsx`):**
   - O temporizador de validade do QR Code (5 minutos) mantinha o mesmo estilo até o último segundo, sem alertar visualmente quando o código estava prestes a expirar.
3. **Home com bairro sem livros (`home.tsx`):**
   - Quando o leitor escolhia um bairro de Piripiri sem anúncios cadastrados (ex.: bairros periféricos recentes), a tela inicial exibia carrosséis vazios sem orientação convidativa.
4. **Detalhes do livro (`bookDetail.tsx`):**
   - O card do anunciante não enfatizava visualmente que o encontro ocorre em Ponto Seguro público com verificação por QR Code, o que é fundamental para a sensação de segurança de novos leitores.
5. **Dicas de fotografia no cadastro de anúncio (`createListingStep2.tsx`):**
   - Leitores novatos muitas vezes tiravam fotos apenas da capa frontal; faltava uma dica orientadora incentivando a fotografar a lombada e o corte das folhas para atestar a conservação.
6. **Contador de caracteres no chat (`chat.tsx`):**
   - A entrada de mensagem tem limite de 500 caracteres, mas não fornecia feedback visual sutil quando o leitor se aproximava do limite (acima de 400 caracteres).

## 2. Escopo da Solução

1. **Favoritos Móvel (`src/view/favorites/favorites.tsx`):**
   - Adicionar barra horizontal com chips `Todos`, `Disponíveis` e `Reservados` também na versão móvel.
   - Exibir a nota explicativa de privacidade no rodapé da lista tanto na web quanto no celular.
2. **Entrega Presencial (`src/view/requests/delivery.tsx`):**
   - Adicionar destaque visual e estilo de aviso (`expiringSoon`) quando o tempo restante for inferior ou igual a 30 segundos, orientando o anunciante a gerar novo código se necessário.
3. **Home com Bairro Vazio (`src/view/home.tsx`):**
   - Quando um bairro específico for selecionado e não houver livros cadastrados nele, renderizar um cartão acolhedor convidando a pessoa a inaugurar a estante do bairro ou ver livros de toda a cidade.
4. **Detalhes do Livro (`src/view/listings/bookDetail.tsx`):**
   - No `sellerCard`, adicionar selo/texto discreto de confiança: *"Encontro em Ponto Seguro público com confirmação por QR Code"*.
5. **Criação de Anúncios (`src/view/listings/createListingStep2.tsx`):**
   - Adicionar cartão orientador com ícone e texto de boas práticas de fotos (capa, lombada e corte das páginas).
6. **Chat da Negociação (`src/view/conversations/chat.tsx`):**
   - Exibir contador discreto `N/500` quando a mensagem ultrapassar 400 caracteres.

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | A tela de Favoritos no celular exibe chips de filtro (`Todos`, `Disponíveis`, `Reservados`) e a nota de privacidade no rodapé. | Testes em `tests/components/favoritesView.test.tsx` e inspeção visual |
| CA2 | A tela de Entrega por QR Code destaca o temporizador em tom de alerta nos últimos 30 segundos de validade. | Testes em `tests/components-mocked/deliveryView.test.tsx` |
| CA3 | A tela inicial exibe mensagem acolhedora com botões de ação quando o bairro selecionado não tem livros. | Testes em `tests/components-mocked/homeViewMocked.test.tsx` |
| CA4 | O card do anunciante no detalhe do livro destaca o encontro em Ponto Seguro público. | Testes em `tests/components-mocked/bookDetailView.test.tsx` |
| CA5 | A etapa 2 de cadastro de anúncio exibe dica sobre fotos da lombada e estado do livro. | Testes em `tests/components/createListingStep2.test.tsx` |
| CA6 | O chat exibe contador de caracteres quando a mensagem em digitação ultrapassa 400 caracteres. | Testes em `tests/components/chatView.test.tsx` |
| CA7 | Todos os testes existentes (1.983+) continuam passando sem regressões. | `npm test -- --run` |
