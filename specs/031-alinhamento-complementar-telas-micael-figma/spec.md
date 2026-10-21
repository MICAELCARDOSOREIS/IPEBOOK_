# Spec 031 — Alinhamento Complementar das Telas do Micael ao Figma (Android e Web Responsivo)

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Fontes visuais:**
- [Figma — Android · Material 3](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?m=dev) (`design-system/telas-android-figma.md`)
- [Figma — Web · Responsivo](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?m=dev) (`design-system/telas-web-figma.md`)

## Problema

Após a entrega da Spec 030 (que alinhou Acesso `01.03`–`01.10`, Publicação `04.01`–`04.09` e Favoritos `02.06`), as demais telas sob responsabilidade exclusiva do Micael (`pessoa:micael`) ainda apresentavam divergências em relação ao Figma (Android e Web Responsivo) e às regras de `design-system/03-fundamentos.md`:

| Tela / Arquivo (`pessoa:micael`) | Nós do Figma (Android / Web) | Divergências identificadas |
| --- | --- | --- |
| `src/view/search/searchAlerts.tsx` (`/alertas`) | `02.07`–`02.13` (`145:2921` / `370:17381`) | Sem `maxWidth: 720` no container Web (estica em 1440px); tamanhos de fonte e espaçamentos literais (`17`, `15`, `14`, `10`, `4`); títulos sem `fontFamily.brand`. |
| `src/view/auth/deleteAccount.tsx` (`/excluir-conta`) | `07.07`–`07.09`, `07.17` (`145:2809`, `149:3589` / `370:16741`, `370:16821`) | Usa checkbox manual em vez do componente `Checkbox`, botão manual em vez de `OutlinedButton`, emojis grandes (`fontSize: 40`) em vez de `IconBadge`, e literais fora de `tokens`. |
| `src/view/listings/myListings.tsx` (`/meus-anuncios`) | `05.01`, `05.02`, `05.07` (`25:302` / `159:1728`) | Usa badge manual em vez de `Tag`; não exibe conservação e bairro na linha do livro (`BookRow`); possui literais (`fontSize: 12`, `11`, `14`, `gap: 4`, `8`). |
| `src/view/listings/reportListing.tsx` (`/denunciar/[id]`) | `09.03`, `09.04` (`27:1239`, `370:6727` / `163:2406`, `370:17981`) | Lista de motivos não usa semântica `radiogroup` / `radio` de `opcao-unica.md`; usa emojis em vez de `IconBadge`; possui literais de tipografia. |
| `src/view/notifications/notifications.tsx` (`/notificacoes`) | `07.04`, `07.13` (`25:812`, `254:6456` / `148:1020`, `370:17181`) | Sem `maxWidth: 720` na Web; cor literal `#F7FAF8` fora de `tokens.colors`; emojis soltos em vez de `IconBadge`; tamanhos literais (`48`, `20`, `16`, `10`, `5`). |
| `src/view/requests/requestListLayout.tsx`, `receivedRequests.tsx`, `sentRequests.tsx` | `05.03`, `05.05`, `05.08`, `06.03` (`149:2962`, `27:707` / `370:16461`, `163:1930`) | Item sem capa (`BookCover`) e sem `Tag` de modalidade; tamanhos literais (`16`, `14`, `19`, `25`, `18`, `6`). |
| `src/view/requests/requestDetail.tsx` (`/negociacao/[id]`) | `06.05`, `06.06` (`27:921`, `149:3467` / `163:2131`, `370:16621`) | Sem `ScrollView`; badge manual em vez de `Tag`; títulos sem `fontFamily.brand`; literais (`11`, `22`, `4`, `8`). |
| `src/view/help/helpAndFaq.tsx` (`/ajuda`) | `09.01` (`145:2702` / `370:17541`) | Sem `ScrollView`; título principal sem `fontFamily.brand`; literais de `lineHeight`. |
| `src/view/legal/termsAndPrivacy.tsx` (`/termos`) | `07.14`–`07.16` (`254:6585` / `370:17221`) | Sem `ScrollView`; abas em pílula com `#FFFFFF` literal em vez de Primary Tabs M3 (`abas.md`); literais (`12`, `22`, `4`). |
| `src/view/onboarding/welcome.tsx` (`/bem-vindo`) | `01.01` (`324:38` / `146:457`) | Sem container `maxWidth` centralizado para a vista Web Desktop/Tablet (`146:457`); botões contornado e texto manuais em vez de `OutlinedButton` e `TextButton`. |

## Fronteira Estrita de Escopo (Não Tocar — Maria Clara)

Esta especificação **proíbe expressamente** qualquer alteração nos arquivos sob responsabilidade da Maria Clara (`pessoa:maria-clara`):
- `src/view/home.tsx` e `src/app/index.tsx`
- `src/view/search/search.tsx` e `src/app/pesquisa.tsx`
- `src/view/listings/bookDetail.tsx`, `src/view/listings/publicProfile.tsx` e `src/view/listings/photoGallery.tsx`
- `src/app/perfil.tsx` e `src/view/profile/*`
- `src/view/components/NavigationBar.tsx` e `src/app/_layout.tsx`

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Tokens Canônicos):** Nenhuma das telas do escopo deve conter cores hexadecimais literais (como `#FFFFFF` ou `#F7FAF8`), tamanhos de fonte avulsos ou espaçamentos fora de `src/view/tokens.ts`.
- **RN-02 (Responsividade Web e Rolagem):** Todas as telas do escopo devem limitar a largura do conteúdo principal em telas largas (`maxWidth: 720` ou `560`, ` width: "100%"`, `alignSelf: "center"`) e permitir rolagem vertical segura (`ScrollView` ou `FlatList`), suportando fontes até 200% sem corte.
- **RN-03 (Componentes do Design System):**
  - `deleteAccount.tsx` deve usar `Checkbox`, `OutlinedButton` e `IconBadge`.
  - `myListings.tsx`, `requestListLayout.tsx` e `requestDetail.tsx` devem usar `BookCover` (`variant="list"`) e `Tag`.
  - `reportListing.tsx` deve usar `accessibilityRole="radiogroup"` e `accessibilityRole="radio"` para a escolha única de motivo (`opcao-unica.md`) e `IconBadge`.
  - `termsAndPrivacy.tsx` deve usar abas primárias M3 (`abas.md`, indicador inferior de `tokens.colors.action`).
  - `welcome.tsx` deve usar `OutlinedButton` e `TextButton` com container centralizado para Web.
- **RN-04 (Preservação de Contratos e Acessibilidade):** Todos os rótulos acessíveis, papéis (`header`, `button`, `tab`, `tablist`, `checkbox`, `alert`) e fluxos validados na suíte de testes existente devem continuar funcionando integralmente.

## Critérios de Aceite

1. Zero valores literais de cor hexadecimal nas 12 telas do Micael listadas no escopo.
2. Textos reais de manchete, subtítulo, cartões de orientação e estados vazios extraídos via MCP do Figma (`cxEisNRzOQR6krv8Ow7HCa`) presentes nas respectivas telas:
   - `searchAlerts.tsx` (`145:2921` / `19:420` / `254:4728`): `"O próximo livro pode chegar."`, `"Avisamos quando houver um anúncio que combine com sua busca."`, `"Todos os tipos · Piripiri, PI"`, `"Nenhum alerta criado"`.
   - `myListings.tsx` (`25:302` / `25:430`): `"Toque em um livro para editar, pausar ou marcar como concluído."`, `"Sua estante começa com um livro"`, `"Anuncie um livro para vender, trocar ou doar na sua região."`.
   - `requestListLayout.tsx` & `receivedRequests.tsx` (`149:2962` / `27:707`): `"Sua estante em movimento."`, `"Acompanhe as propostas dos seus livros."`, `"Tudo pela conversa"`, `"Confira a proposta e combine os detalhes antes de reservar seu livro."`, `"Ao aceitar, seu anúncio fica Reservado e vocês combinam o encontro."`.
   - `requestDetail.tsx` (`27:921` / `149:3467`): `"Um encontro, um novo capítulo."`.
   - `notifications.tsx` (`25:812` / `254:6456`): `"Você está em dia"`, `"Suas mensagens, propostas e avisos de novos livros aparecerão aqui."`.
   - `deleteAccount.tsx` (`145:2809` / `149:3589` / `370:6769`): `"Você no controle."`, `"Entenda quais informações ficam visíveis."`, `"Seu perfil público"`, `"Dados de acesso privados"`, `"Sua conta foi excluída."`.
   - `termsAndPrivacy.tsx` (`254:6585`): `"Informação clara para você."`, `"Consulte os documentos que orientam o uso do IpêBook."`.
   - `helpAndFaq.tsx` (`145:2702`): `"Vamos ajudar."`, `"Respostas para continuar sua próxima leitura."`.
   - `reportListing.tsx` (`27:1239` / `370:6727`): `"O que aconteceu?"`, `"Sua denúncia é anônima. A equipe analisa em até 24 horas."`, `"Recebemos sua denúncia."`.
3. Nenhum arquivo pertencente à Maria Clara aparece modificado em `git diff develop`.
4. Todos os testes unitários, de hooks, de componentes e de integração passam (`npm run verify:release`), mantendo cobertura global > 80%.
5. Build Web (`dist/`) publicado e validado em `https://ipebook.pages.dev`.
