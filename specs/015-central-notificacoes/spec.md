# Especificação: Central de Notificações Comunitária (Spec 015)

## 1. Contexto e Problema
Em um aplicativo comunitário de troca e doação de livros como o Ipebook, a agilidade na comunicação é essencial. Os leitores precisam saber rapidamente quando:
- Receberam uma nova solicitação para um livro que anunciaram.
- Sua solicitação por um livro anunciado por outro leitor de Piripiri foi aceita (com orientações para o encontro presencial seguro).
- Há avisos comunitários ou dicas de segurança pública em Piripiri (ex.: priorizar pontos de encontro no IFPI ou na Praça da Bandeira).

Atualmente, não havia uma central unificada no app para visualização dessas mensagens e atualizações, obrigando o usuário a verificar manualmente cada aba.

## 2. Escopo e Restrições
- **O que faz parte:**
  - Modelo de Notificação com tipo, título, mensagem, data, status de leitura e destino de navegação.
  - Listagem de notificações com filtro (Todas / Não lidas).
  - Contador de notificações não lidas.
  - Ação de marcar como lida e marcar todas como lidas.
  - Rota `/notificacoes` acessível pelo app.
  - Total conformidade com a arquitetura MVVM em 7 camadas.
- **O que NÃO faz parte:**
  - Push notifications nativas externas (FCM/APNs) que exigem certificados de lojas ou serviços pagos.
  - Alterações na tela de perfil da usuária (Issue #55 - Maria Clara).

## 3. Critérios de Aceite
- [ ] O usuário autenticado visualiza suas notificações ordenadas por data decrescente.
- [ ] O usuário pode alternar filtros entre "Todas" e "Não lidas".
- [ ] O usuário pode marcar notificações individuais como lidas ou tocar em "Marcar todas como lidas".
- [ ] O usuário não autenticado recebe aviso de que é necessário entrar para ver suas notificações.
- [ ] Ao tocar em uma notificação com ação vinculada, o usuário é direcionado à rota correspondente (`/pedidos-recebidos`, `/negociacao/[id]`, `/ajuda`).
- [ ] Cobertura de testes superior a 80% e zero violações arquiteturais no `check:architecture`.
