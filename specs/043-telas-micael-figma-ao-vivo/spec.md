# Spec 043 — Telas do Micael conferidas no app contra o Figma

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 21 de outubro de 2026
**Fonte visual:** arquivo [IpêBook](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook),
canvas `APP · 10 · Android · Material 3`, renderizado pelo MCP do Figma em 21/10/2026.

## Problema

As Specs 030 a 039 compararam o código das telas com o Figma. Desta vez o app foi compilado
(`expo export --platform web`), percorrido com dois usuários em memória e cada tela capturada no
Chromium (via CDP, sem Playwright) e posta lado a lado com o nó do Figma. A comparação no app
rodando revelou defeitos de comportamento que a leitura do código não mostrava, além de
divergências de layout ainda presentes:

| Tela / arquivo | Figma | Encontrado no app |
| --- | --- | --- |
| Favoritos, Estante, Gerenciar anúncio, sucesso do Anunciar, Pedidos e Negociação | `02.06`, `05.01`, `04.08`, `04.07`, `05.03`, `06.05` | Preço como "R$ 25.00", com ponto decimal |
| `src/view/requests/receivedRequests.tsx` (`/pedidos-recebidos`) | `05.03` | "Pessoa interessada: 2" — identificador cru em vez do nome |
| `src/view/requests/requestDetail.tsx` (`/negociacao/[id]`) | `06.05` | Sem nome no perfil, cai no identificador cru |
| `src/view/listings/myListings.tsx` (`/meus-anuncios`) | `05.01`, `05.03` | Aba "Propostas" conta só livros reservados: com uma proposta pendente mostra "Propostas (0)" e "Nenhum anúncio encontrado" |
| `src/view/listings/myListings.tsx` | `05.01` | Botão flutuante "Anunciar livro" cobre a dica do rodapé; anúncios em cartões com quatro botões, onde o desenho tem linha com seta para o gerenciamento |
| `src/view/components/StepProgress.tsx` (`/anunciar`) | `04.01`, `04.04`, `04.05` | Ponto final da barra sobreposto ao nome da etapa ("Livro•") |
| `src/view/listings/createListing.tsx` (`/anunciar`) | `04.04` | Três quadrados iguais, onde o desenho tem a capa em destaque e lombada/páginas empilhadas |
| `src/view/listings/createListing.tsx` | `04.05` | Descrição em uma linha só e contador repetido ("39/280" e "Restam 241 caracteres") |
| `src/view/listings/createListing.tsx` | `04.07` | Manchete sem a faixa de realce em "um novo começo."; ação "Ver meus anúncios" em vez de "Ver estante" |
| `src/view/favorites/favorites.tsx` (`/favoritos`) | `02.14` | Estado vazio "Nenhum favorito ainda" centralizado com ícone; desenho: "Nenhum livro salvo", alinhado à esquerda |
| `src/view/search/searchAlerts.tsx` (`/alertas`) | `02.13` | "Procurar um livro" preso ao rodapé, longe do texto do estado vazio |
| `src/view/notifications/notifications.tsx` (`/notificacoes`) | `07.04` | Itens sem o horário ("· 10h", "· Seg") |
| `src/model/helpContent.ts` (`/ajuda`) | `09.01` | A resposta sobre locais de entrega cita pontos (Memorial Espedito Resende, Estação Ferroviária) diferentes dos que a negociação sugere |

## Escopo

1. **Defeitos:** preço no formato brasileiro em todas as telas; nome da pessoa interessada nos
   pedidos recebidos; aba "Propostas" da estante alimentada pelas propostas recebidas.
2. **Estante (`05.01`/`05.03`):** anúncios em linhas com capa, título, resumo e seta para
   `/gerenciar-anuncio/[id]`; propostas em linhas com nome, situação e modalidade; dica e cartão
   "Tudo pela conversa" depois das listas; botão flutuante sem cobrir conteúdo.
3. **Anunciar (`04.04`, `04.05`, `04.07`):** capa em destaque na etapa de fotos; descrição
   multilinha com um único contador; manchete de sucesso com realce e ação "Ver estante".
4. **Ajustes de copy e posição:** estado vazio de Favoritos e de Alertas, horário nas notificações,
   pontos de encontro da Ajuda coerentes com os da negociação.

## Decisões de alcance

- **DA-01 (Funcionalidade preservada):** nenhum recurso entregue é removido. Editar, pausar e
  excluir continuam disponíveis em `/gerenciar-anuncio/[id]` (`04.08`), destino da seta da linha;
  os filtros por situação da estante (Spec 008) continuam na aba "Anúncios".
- **DA-02 (Fronteira):** não tocar nos arquivos da Maria Clara listados na Spec 039. O preço em
  `bookDetail.tsx` (Maria Clara) usa o mesmo formatador só se ela adotar; fica registrado aqui.
- **DA-03 (Tokens globais):** cor de fundo da página e rótulo flutuante dos campos divergem do
  Figma em todas as telas do app; mudar `tokens.colors.background` ou `TextField` afeta as telas
  da equipe inteira e fica para decisão conjunta, fora desta spec.

## Regras e comportamento esperado

- **RN-01:** todo preço exibido usa `R$ 25,00` (vírgula decimal, milhar com ponto).
- **RN-02:** pedidos recebidos mostram o nome público de quem pediu; sem perfil, "Pessoa da
  comunidade" — nunca o identificador interno. O mesmo vale para a negociação.
- **RN-03:** "Propostas (n)" conta as propostas recebidas pendentes ou aceitas; cada linha mostra
  "<nome> · proposta recebida|negociação aceita · <modalidade>" e abre `/pedidos-recebidos`
  (pendente) ou `/negociacao/[id]` (aceita). Sem propostas, a aba mostra estado vazio próprio.
- **RN-04:** cada anúncio da estante é uma linha com capa, título, "<preço ou modalidade> · <bairro>
  · <situação>" e seta; tocar abre o gerenciamento.
- **RN-05:** a lista da estante reserva espaço inferior para o botão flutuante.
- **RN-06:** o rótulo da etapa no `StepProgress` não é sobreposto pelo indicador.
- **RN-07:** a etapa de fotos mostra a capa em destaque (dois terços da largura) e lombada/páginas
  empilhadas ao lado.
- **RN-08:** a descrição aceita várias linhas e mostra um único contador "n/280", alinhado à direita.
- **RN-09:** a tela de sucesso usa `Manchete` com realce em "um novo começo." e a ação "Ver estante".
- **RN-10:** favoritos vazio: "Nenhum livro salvo" e "Explorar livros", alinhados à esquerda.
- **RN-11:** alertas vazio: "Procurar um livro" logo depois do texto.
- **RN-12:** cada notificação mostra o horário relativo: "10h" no mesmo dia, dia da semana na mesma
  semana e data curta antes disso.
- **RN-13:** a Ajuda cita os mesmos pontos de encontro que a negociação sugere.

## Critérios de aceite

1. Nenhuma tela do Micael exibe preço com ponto decimal (teste do formatador e das telas).
2. `/pedidos-recebidos` exibe o nome da pessoa e nunca o identificador.
3. Com uma proposta pendente, `/meus-anuncios` exibe "Propostas (1)" e a linha da proposta.
4. A estante lista anúncios como linhas que levam ao gerenciamento, sem os botões inline.
5. O `StepProgress` posiciona o rótulo sem sobreposição.
6. Etapa de fotos, descrição e sucesso seguem RN-07 a RN-09.
7. Favoritos e alertas vazios, notificações e Ajuda seguem RN-10 a RN-13.
8. `npm run validate` passa; capturas do app compilado conferidas contra o Figma.

## Fora deste alinhamento

Mantém-se a lista da Spec 039 (Google, ISBN, rascunhos de `05.01`, "Concluídos", conversas).
Acrescenta-se `06.05 · Encontro combinado` com data, hora e local escolhidos: o produto não tem
agendamento de encontro (sem campos no modelo de pedido), então a tela continua listando os
pontos seguros sugeridos. Implementar exige spec própria com migração.

## Tarefas

- [x] T1 — `formatPrice` (`src/view/formatPrice.ts`) e troca do `toFixed(2)` nas seis telas do Micael.
- [x] T2 — `requesterName` em `listReceivedRequests`; fallback "Pessoa da comunidade" em pedidos e negociação.
- [x] T3 — Estante: aba Propostas pelas propostas recebidas, linhas com seta, espaço para o botão flutuante.
- [x] T4 — `StepProgress`: ponto final posicionado na área da barra.
- [x] T5 — Anunciar: capa em destaque (`AddPhotoCard` aceita `style`), descrição multilinha (`TextField`
  aceita `multiline`), um só contador, `Manchete` e "Ver estante" no sucesso.
- [x] T6 — Favoritos vazio, Alertas vazio, horário nas notificações (`notificationTimeLabel`).
- [x] T7 — `PIRIPIRI_MEETING_POINTS` como fonte única para negociação e Ajuda.

## Validação

- `npm run validate`: tipos, arquitetura (239 arquivos), SQL/PGlite e 897 testes em 127 arquivos,
  cobertura de linhas acima de 92%. Os testes novos falham contra o código anterior: preço com
  vírgula, nome em vez do identificador, "Propostas (2)" com livro sem reserva, ponto fora do
  contêiner dos rótulos, ausência de "Restam", pontos da Ajuda.
- Expectativas alteradas porque o requisito mudou, não para esconder falha: preço "R$ 25.00" →
  "R$ 25,00"; "Ver meus anúncios" → "Ver estante"; "Nenhum favorito ainda" → "Nenhum livro salvo";
  testes de botões inline da estante substituídos pelo teste da linha (editar, pausar e excluir
  continuam cobertos em `manageListingView.test.tsx`).
- Conferência visual: `expo export --platform web`, servidor estático local e Chromium sem
  interface via CDP (sem Playwright), percorrendo cadastro, publicação, favorito, proposta e alerta
  com dois usuários em memória; capturas comparadas com os nós `02.13`, `02.14`, `04.04`, `04.05`,
  `04.07`, `05.01`, `05.03` e `07.04`.
- Limitação: sem conferência em aparelho Android (ADB) nesta sessão.
