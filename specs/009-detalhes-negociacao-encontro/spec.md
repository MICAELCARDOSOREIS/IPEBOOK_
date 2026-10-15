# 009 — Detalhes da Negociação e Ponto de Encontro

Status: especificada. Data: 2026-10-15.

## Objetivo

Permitir que as duas partes envolvidas em uma negociação aceita (anunciante e solicitante) visualizem os detalhes do acordo, orientações de segurança para a troca ou compra presencial em Piripiri, PI, e instruções de contato para a entrega física do livro.

## Escopo

- Operação `getRequestDetail(requestId, sessionUserId)` em `IBookRequestUseCases` / `BookRequestUseCases`, garantindo que apenas o anunciante do livro ou a pessoa solicitante tenham acesso às informações (regra de privacidade e segurança).
- ViewModel `useRequestDetailViewModel(requestId, sessionUserId)`.
- Tela `RequestDetail` com TopAppBar, resumo do livro negociado, badge de status aceito, orientações para ponto de encontro público seguro em Piripiri e orientações de finalização presencial.
- Rota dinâmica `src/app/negociacao/[id].tsx`.
- Atalho "Ver detalhes do encontro" nos cards com status "Aceito" em `receivedRequests.tsx` e `sentRequests.tsx`.
- Não alterar regras de Perfil da Maria Clara.
- Cobertura de testes unitários, hook, componentes e integração.

Ficam para próximas entregas: chat de mensagens em tempo real e avaliação mútua pós-encontro.

## Critérios de aceite

1. Somente a pessoa solicitante ou a pessoa dona do anúncio podem acessar os detalhes da negociação; qualquer outro usuário recebe erro de autorização.
2. A tela exibe o título e autor do livro, modalidade acordada e preço (se modalidade venda).
3. A tela exibe recomendações explícitas de segurança para realização do encontro em locais públicos e movimentados de Piripiri (ex.: Campus do IFPI Piripiri, Praça da Bandeira).
4. As telas de "Pedidos recebidos" e "Meus pedidos" exibem atalho navegável para a tela de detalhes quando o pedido estiver no status "Aceito".
5. Se o visitante tentar acessar sem autenticação, é redirecionado para a tela de login.

## Validação

- Teste unitário do caso de uso validando restrição de acesso por terceiros e retorno dos dados para as partes autorizadas.
- Teste de hook de ViewModel.
- Teste de componente da tela de detalhes da negociação.
- Teste de integração de ponta a ponta.
- `npm run validate` e `npm run build:web`.
