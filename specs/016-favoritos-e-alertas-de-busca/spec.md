# Especificação 016: Favoritos e Alertas de Busca

## 1. Contexto e Problema

Hoje o leitor só encontra um livro se buscar ou navegar na hora em que o anúncio já existe. Não
há como guardar um livro interessante pra depois (favoritar), nem como ser avisado quando um
livro procurado aparecer. Isso é especialmente importante num catálogo pequeno e local como o de
Piripiri (PI), onde um título específico pode demorar a aparecer.

Telas correspondentes no Figma (`design-system/telas-android-figma.md`, fluxo 02 · Descoberta):
`02.06 · Favoritos`, `02.07 · Meus alertas`, `02.08 · Avisaremos você`, `02.09 · Gerenciar
alerta`, `02.10 · Editar alerta`, `02.11 · Alerta pausado`, `02.12 · Excluir alerta?`,
`02.13 · Meus alertas · vazio`, `02.14 · Favoritos · vazio`.

## 2. Escopo e Restrições

- **O que faz parte:**
  - Favoritar/desfavoritar um livro a partir do detalhe do anúncio (`src/app/livro/[id].tsx`) e
    da lista de resultados.
  - Tela "Favoritos" listando os livros favoritados, com estado vazio.
  - Criar um alerta de busca (título, autor ou categoria) a partir da busca sem resultado
    (`02.05 · Busca sem resultado`).
  - Tela "Meus alertas" com listagem, pausar/retomar e excluir alerta, com estado vazio.
  - Notificação (reaproveitando o modelo de `AppNotification` da spec 015) quando um anúncio
    novo casa com um alerta ativo.
- **O que NÃO faz parte:**
  - Notificação push nativa (FCM/APNs) — mesma restrição já registrada na spec 015.
  - Alertas por localização/distância — só por texto de busca (título/autor/categoria).
  - Qualquer tela do fluxo 07 · Perfil e conta (issues #55/#56, responsabilidade da Maria Clara).

## 3. Critérios de Aceite

- [ ] O usuário autenticado favorita e desfavorita um livro a partir do detalhe do anúncio, com
  o estado refletido imediatamente na UI (otimista ou após confirmação do datasource).
- [ ] A tela "Favoritos" lista os livros favoritados do usuário, ordenados por data em que foram
  favoritados (mais recente primeiro).
- [ ] A tela "Favoritos" mostra um estado vazio acessível quando não há favoritos.
- [ ] O usuário cria um alerta de busca a partir de uma busca sem resultado, informando o termo.
- [ ] A tela "Meus alertas" lista os alertas do usuário com ação de pausar, retomar e excluir
  (com confirmação).
- [ ] A tela "Meus alertas" mostra um estado vazio acessível quando não há alertas.
- [ ] Quando um livro novo corresponde a um alerta ativo, uma `AppNotification` do tipo
  `"search_alert_match"` é criada para o dono do alerta.
- [ ] Usuário não autenticado que tenta favoritar ou criar alerta recebe aviso de que precisa
  entrar, sem perder o contexto da tela em que estava.
- [ ] Cobertura de testes acima de 80% e zero violações em `npm run check:architecture`.
