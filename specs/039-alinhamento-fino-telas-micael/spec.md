# Spec 039 — Alinhamento fino das telas do Micael ao Figma

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 21 de outubro de 2026
**Fonte visual:** arquivo [IpêBook](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook),
canvas `APP · 10 · Android · Material 3`, lido nó a nó pelo MCP do Figma em 21/10/2026
(inventário de node IDs em `design-system/telas-android-figma.md`).

## Problema

As Specs 030, 031, 032 e 035 alinharam estrutura, componentes e copy das telas do Micael. Uma nova
conferência nó a nó — desta vez renderizando cada nó do Figma e comparando com o código da tela —
mostrou divergências remanescentes em oito telas, concentradas em três padrões: conteúdo envolvido
em cartão onde o desenho usa o fundo da página, elementos de copy acrescentados que o desenho não
tem, e afordâncias do desenho ausentes no código.

| Tela / Arquivo (`pessoa:micael`) | Figma | Divergência encontrada |
| --- | --- | --- |
| `src/view/auth/signIn.tsx` (`/entrar`) | `01.10` (`354:6017`) | Conteúdo dentro de cartão com borda e sombra, centralizado verticalmente; no Figma fica direto sobre o fundo, alinhado ao topo |
| `src/view/auth/signUp.tsx` (`/criar-conta`) | `01.03` (`336:118`) | Mesmo cartão indevido |
| `src/view/auth/resetPassword.tsx` (`/redefinir-senha`) | `01.06` (`254:3595`) | Mesmo cartão indevido; campo "Confirmar senha" com texto de apoio que o desenho não tem |
| `src/view/favorites/favorites.tsx` (`/favoritos`) | `02.06` (`10:227`) | Aba "Alertas" sem contador; desfavoritar desenhado como caractere `♥` em vez de ícone do design system |
| `src/view/search/searchAlerts.tsx` (`/alertas`) | `02.07` (`145:2921`) | Sem o cartão "Alerta ativo" na lista; linha do alerta sem o ícone de sino |
| `src/view/listings/myListings.tsx` (`/meus-anuncios`) | `05.01` (`25:302`) | Manchete "Cada livro, uma conversa." inexistente no desenho; dica de uso acima da lista, quando no Figma vem depois dela |
| `src/view/notifications/notifications.tsx` (`/notificacoes`) | `07.04` (`25:812`) | Manchete "Novidades dos seus livros." inexistente no desenho na lista cheia; itens sem a seta de avanço |
| `src/view/auth/deleteAccount.tsx` (`/excluir-conta`) | `07.07` (`145:2809`) | Dois blocos de privacidade reunidos num cartão só; copy cita telefone, que o produto não coleta; portabilidade ainda com cabeçalho e parágrafo, em vez de só a ação de rodapé |

## Fronteira Estrita de Escopo (Não Tocar — Maria Clara)

Mantida a fronteira das Specs 031, 032 e 035: `src/view/home.tsx`, `src/app/index.tsx`,
`src/view/search/search.tsx`, `src/app/pesquisa.tsx`, `src/view/listings/bookDetail.tsx`,
`src/view/listings/publicProfile.tsx`, `src/view/listings/photoGallery.tsx`, `src/app/perfil.tsx`,
`src/view/profile/*`, `src/view/components/NavigationBar.tsx` e `src/app/_layout.tsx`.

## Decisões de alcance

- **DA-01 (Funcionalidade preservada):** o alinhamento age sobre enquadramento, hierarquia e copy.
  Nenhum recurso entregue por specs anteriores é removido — os chips de filtro de `/notificacoes`
  (Spec 015) e de `/meus-anuncios` (Spec 008), o formulário de criação em `/alertas` (Spec 016) e a
  exportação LGPD (Spec 025) continuam na tela, ainda que o Figma não os desenhe.
- **DA-02 (Enquadramento de referência):** o padrão sem cartão já aplicado em
  `src/view/auth/forgotPassword.tsx` pela Spec 035 (RN-01) passa a valer para as demais telas de
  acesso: conteúdo sobre o fundo, `maxWidth: 560`, `alignSelf: "center"`, alinhado ao topo.
- **DA-03 (Acessibilidade da portabilidade):** ao remover o cabeçalho "Portabilidade de dados
  (LGPD)", a ação permanece identificável pelo rótulo acessível do próprio botão
  ("Baixar meus dados pessoais em formato JSON"), que já existe. O teste correspondente passa a
  verificar o botão, não o cabeçalho — a expectativa mudou porque o desenho mudou, não para
  esconder falha.
- **DA-04 (Barra de voltar):** como nas specs anteriores, as telas mantêm a barra superior com ação
  de voltar, porque no aplicativo elas são alcançadas por empilhamento.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Acesso sem cartão):** `/entrar`, `/criar-conta` e `/redefinir-senha` apresentam o
  conteúdo sobre o fundo da página, alinhado ao topo, sem borda, sombra ou superfície elevada.
- **RN-02 (Apoio só onde o desenho tem):** o campo "Confirmar senha" de `/redefinir-senha` não
  exibe texto de apoio; a validação de senhas diferentes continua acontecendo no envio.
- **RN-03 (Contagem nas duas abas):** em `/favoritos`, a aba "Alertas" exibe a quantidade de
  alertas, como "Livros (n)" já faz.
- **RN-04 (Ícone do design system):** desfavoritar em `/favoritos` usa o ícone do design system, não
  um caractere de texto.
- **RN-05 (Alerta ativo visível):** `/alertas` mostra, para o alerta ativo, o cartão de destaque com
  a frase "Você recebe uma notificação quando um novo livro corresponde à busca por <termo>.", e
  cada linha de alerta traz o ícone de sino.
- **RN-06 (Estante sem manchete extra):** `/meus-anuncios` não exibe manchete acrescentada; a dica
  "Toque em um livro para editar, pausar ou marcar como concluído." aparece depois da lista.
- **RN-07 (Notificações sem manchete extra):** `/notificacoes` não exibe manchete na lista cheia, e
  cada notificação mostra a seta de avanço à direita.
- **RN-08 (Privacidade em dois blocos):** `/excluir-conta` separa "Seu perfil público" e "Dados de
  acesso privados" em cartões distintos; a copy do segundo é "Seu e-mail não aparece no perfil
  público nem nos anúncios."; a portabilidade fica reduzida ao botão "Solicitar meus dados".
- **RN-09 (Acessibilidade):** alvos de toque respeitam `tokens.accessibility.touchTarget`, com
  `accessibilityRole` e rótulo descritivo; nenhuma cor, tamanho de fonte ou espaçamento literal é
  introduzido fora de `src/view/tokens.ts`.

## Critérios de Aceite

1. `/entrar`, `/criar-conta` e `/redefinir-senha` não têm cartão, borda, sombra nem centralização
   vertical do conteúdo.
2. `/redefinir-senha` não exibe apoio no campo "Confirmar senha" e continua recusando senhas
   diferentes.
3. `/favoritos` exibe "Alertas (n)" e desfavorita por ícone do design system.
4. `/alertas` exibe o cartão "Alerta ativo" com a frase da busca e o ícone de sino na linha.
5. `/meus-anuncios` não exibe "Cada livro, uma conversa." e mostra a dica depois da lista.
6. `/notificacoes` não exibe "Novidades dos seus livros." na lista cheia e mostra a seta por item.
7. `/excluir-conta` apresenta dois cartões de privacidade, a copy sem menção a telefone e a
   portabilidade só como botão.
8. `npm run validate` passa, incluindo a cobertura mínima do projeto.

## Fora deste alinhamento (e por quê)

Estas diferenças com o Figma permanecem porque exigem recurso que o produto não tem — não são
questão de apresentação:

- `01.03`/`01.10` "Continuar com Google" e o divisor "ou crie com e-mail": exigem provedor OAuth.
- `04.01` "Ler ISBN com a câmera": exige `expo-camera` e serviço de catalogação (Spec 030).
- `04.08` "Marcar como concluído" e a aba "Concluídos" de `05.01` (`05.04`, `05.06`): exigem um novo
  valor de `BookStatus` e revisão do ciclo de negociação (Specs 004/009).
- `05.01` "Rascunhos": Spec 017, ainda pendente.
- `06.06` "Enviar mensagem", "Reagendar" e "Cancelar encontro", e o cartão de contagem regressiva do
  encontro: dependem do módulo de conversas (`06.01`–`06.02`), que não existe no produto.
- `07.09` como tela separada de exclusão: o produto mantém aviso, aceite e confirmação em
  `/excluir-conta`, fluxo coberto pela Spec 014.

## Verificação

`npm run validate` e os testes das telas afetadas. A conferência visual foi feita comparando cada
nó renderizado do Figma com o código da tela correspondente; a conferência no aparelho via ADB
continua recomendada antes da promoção para `main`.
