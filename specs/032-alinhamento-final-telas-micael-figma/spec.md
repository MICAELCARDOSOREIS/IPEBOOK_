# Spec 032 — Alinhamento Final das Telas do Micael ao Figma (verificado por ADB no aparelho)

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 20 de outubro de 2026
**Fontes visuais:**
- [Figma — Android · Material 3](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?m=dev) (`design-system/telas-android-figma.md`)
- Comparação executada no aparelho físico **SM_A165M** (Android), via ADB + Expo Go, em 20/10/2026.

## Problema

Depois das Specs 030 e 031, a conferência tela a tela — desta vez capturando o aplicativo em
execução no aparelho via ADB e comparando lado a lado com a renderização dos nós do Figma — mostrou
que a copy e os textos já estavam alinhados, mas **elementos visuais e de navegação presentes no
Figma continuavam ausentes** nas telas sob responsabilidade do Micael.

| Tela / Arquivo (`pessoa:micael`) | Nó do Figma | Divergência encontrada |
| --- | --- | --- |
| `src/view/auth/forgotPassword.tsx` (`/esqueci-senha`) | `01.04` (`6:534`) | Manchete sem a faixa de realce em "acesso." e logotipo sem o traço dourado, embora `/bem-vindo` (`01.01`) já usasse o realce |
| `src/view/search/searchAlerts.tsx` (`/alertas`) | `02.07` (`145:2921`) | Sem o cartão "Alerta ativo" e sem o botão "Procurar outro livro" |
| `src/view/listings/myListings.tsx` (`/meus-anuncios`) | `05.01` (`25:302`) | Barra superior "Meus anúncios" em vez de "Minha estante"; sem as abas de filtro; sem o botão flutuante "Anunciar livro" |
| `src/view/notifications/notifications.tsx` (`/notificacoes`) | `07.04` (`25:812`) | Lista sem o agrupamento por período ("Hoje", "Esta semana") |
| `src/view/auth/deleteAccount.tsx` (`/excluir-conta`) | `07.07` (`145:2809`) | Sem o item navegável "Editar informações"; botão de portabilidade com rótulo fora do Figma |
| `src/view/listings/reportListing.tsx` (`/denunciar/[id]`) | `09.03` (`27:1239`) | Motivos com copy e ordem divergentes; campo de detalhes com rótulo divergente |
| `src/view/requests/requestDetail.tsx` (`/negociacao/[id]`) | `06.05` (`27:921`) | Orientação do encontro sem a instrução "Chegue alguns minutos antes" |
| `src/view/help/helpAndFaq.tsx` (`/ajuda`) | `09.01` (`145:2702`) | Sem a ação de rodapé "Abrir conversas" |

## Fronteira Estrita de Escopo (Não Tocar — Maria Clara)

Mantida a mesma fronteira da Spec 031: `src/view/home.tsx`, `src/app/index.tsx`,
`src/view/search/search.tsx`, `src/app/pesquisa.tsx`, `src/view/listings/bookDetail.tsx`,
`src/view/listings/publicProfile.tsx`, `src/view/listings/photoGallery.tsx`, `src/app/perfil.tsx`,
`src/view/profile/*`, `src/view/components/NavigationBar.tsx` e `src/app/_layout.tsx`.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Realce de manchete reutilizável):** o realce de marca das manchetes passa a ser o
  componente `Manchete`, usado por `01.01` e `01.04`, em vez de ser recriado em cada tela.
- **RN-02 (Agrupamento de notificações):** as notificações são agrupadas por período — "Hoje",
  "Esta semana" e "Antes" — preservando a ordem recebida dentro de cada grupo e omitindo grupos
  vazios. A regra vive em `src/viewmodel/notificationGrouping.ts`, fora da camada de visão.
- **RN-03 (Estante com abas):** `/meus-anuncios` passa a se chamar "Minha estante" e separa os
  anúncios em "Anúncios" (disponíveis e pausados) e "Propostas" (reservados), com abas primárias M3
  (`abas.md`) e papéis `tablist`/`tab`.
- **RN-04 (Preservação de contratos):** chaves persistidas (`REPORT_REASONS[].key`), rótulos
  acessíveis e fluxos cobertos pela suíte continuam funcionando; apenas a copy visível muda.
- **RN-05 (Acessibilidade):** todo novo alvo de toque respeita `tokens.accessibility.touchTarget`,
  recebe `accessibilityRole` e rótulo acessível descritivo.

## Critérios de Aceite

1. `/esqueci-senha` apresenta a manchete "Recupere seu **acesso.**" com faixa de realce e o traço
   dourado sob o logotipo, como em `01.04`.
2. `/alertas` apresenta o cartão "Alerta ativo" (ou "Alerta pausado") por alerta e o botão
   "Procurar outro livro", que abre a busca do catálogo.
3. `/meus-anuncios` apresenta "Minha estante", as abas "Anúncios (n)" e "Propostas (n)" e o botão
   flutuante "Anunciar livro".
4. `/notificacoes` agrupa a lista por "Hoje", "Esta semana" e "Antes".
5. `/excluir-conta` apresenta o item navegável "Editar informações" e o botão "Solicitar meus dados".
6. `/denunciar/[id]` apresenta os motivos na ordem e com a copy de `09.03` e o campo
   "Detalhes (opcional)".
7. `/ajuda` apresenta a ação de rodapé "Abrir conversas", que abre as negociações em andamento.
8. Nenhum arquivo da Maria Clara aparece em `git diff`.
9. `npm run validate` passa integralmente.

## Fora de Escopo (registrado, não implementado)

- **Aba "Concluídos" da estante (`05.01`)**: depende de um estado de conclusão de anúncio, que não
  existe em `BookStatus` (`available | reserved | paused`). "Marcar como concluído" já havia sido
  declarado fora de escopo na Spec 030; criar uma aba permanentemente vazia seria pior que omiti-la.
- **Encontro agendado em `06.05`** (data, horário, local escolhido e mini-mapa) e os botões
  "Abrir conversa" e "Adicionar à agenda": dependem de agendamento persistido do encontro e de um
  módulo de conversas, ambos inexistentes no produto. A tela mantém os pontos de encontro seguros
  da Spec 009.
- **"Continuar com Google" em `01.03`**: login federado, fora de escopo desde a Spec 030.
- **Cartão centralizado nas telas de acesso**: o Figma Android mostra o formulário direto sobre o
  fundo, mas o cartão foi adotado deliberadamente na Spec 030 para a vista Web responsiva.
- **Rótulo acima do campo (`campo-de-texto.md`)**: o Figma usa o rótulo embutido na borda do
  Outlined Text Field M3; o design system definiu rótulo sempre visível acima do campo por
  acessibilidade. Divergência consciente e documentada.
- **Padronização do estado deslogado**: hoje `/meus-anuncios` e `/meus-pedidos` redirecionam para
  `/entrar`, enquanto `/notificacoes`, `/excluir-conta` e `/alertas` mostram um estado explicativo
  na própria tela. A unificação não tem respaldo em nenhum nó do Figma e alteraria comportamento
  coberto por testes dedicados — fica registrada como recomendação para uma spec própria.
