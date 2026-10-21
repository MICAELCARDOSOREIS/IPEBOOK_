# Spec 035 — Alinhamento visual das telas do Micael ao Figma

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 21 de outubro de 2026
**Fontes visuais:**
- Exportação do Figma `IpêBook.pdf` (137 telas, Android · Material 3), páginas citadas abaixo.
- Comparação executada no aparelho físico **SM_A165M** via ADB + Expo Go em 21/10/2026.

## Problema

A conferência tela a tela no aparelho, comparada com a exportação do Figma, mostrou que apenas
`/bem-vindo` (`01.01`) está fiel. As outras nove telas sob responsabilidade do Micael divergem em
estrutura, hierarquia visual e copy — algumas por elementos ausentes, outras por elementos
acrescentados que não existem no desenho.

| Tela / Arquivo (`pessoa:micael`) | Figma | Divergência encontrada |
| --- | --- | --- |
| `src/view/auth/forgotPassword.tsx` (`/esqueci-senha`) | `01.04` (p8) | Conteúdo dentro de um cartão com borda e sombra, centralizado verticalmente; no Figma o conteúdo fica direto sobre o fundo, alinhado ao topo |
| `src/view/search/searchAlerts.tsx` (`/alertas`) | `02.07`/`02.08` (p17/p29) | Estado vazio com manchete da lista cheia, título e ícone centralizados e botão delineado; no Figma o vazio tem só "Nenhum alerta criado", alinhado à esquerda, com botão preenchido "Procurar um livro" |
| `src/view/listings/myListings.tsx` (`/meus-anuncios`) | `05.02` (p48) | Link "Como funciona" nunca renderizado; subtexto com parágrafo extra; ícone sem o círculo de destaque; botão sem largura total |
| `src/view/notifications/notifications.tsx` (`/notificacoes`) | `07.04`/`07.05` (p70/p88) | Manchete e chips de filtro exibidos também no estado vazio, onde o Figma não os tem; título do vazio centralizado em vez de alinhado à esquerda |
| `src/view/auth/deleteAccount.tsx` (`/excluir-conta`) | `07.07` (p76) | Barra superior "Excluir conta" em vez de "Privacidade e dados"; portabilidade dentro de um cartão explicativo em vez do botão de rodapé |
| `src/view/listings/reportListing.tsx` (`/denunciar/[id]`) | `09.03` (p113) | Linha "Denunciando: …" e pergunta extra fora do desenho; motivos em cartões com descrição secundária em vez de lista simples de rádios |
| `src/view/requests/requestDetail.tsx` (`/negociacao/[id]`) | `06.05` (p87) | Barra "Negociação" e manchete de `06.04`; identificador da contraparte exibido como UUID cru |
| `src/view/help/helpAndFaq.tsx` (`/ajuda`) | `09.01` (p111) | Barra "Central de Ajuda" em vez de "Ajuda"; cabeçalho de seção redundante |
| `src/view/legal/termsAndPrivacy.tsx` (`/termos`) | `10.01` (p89) | Barra com capitalização divergente |

Além disso, a marca aparece como "Ipebook", sem circunflexo, em copy visível de cinco arquivos do
escopo, enquanto o Figma e `/termos` usam "IpêBook".

## Fronteira Estrita de Escopo (Não Tocar — Maria Clara)

Mantida a fronteira das Specs 031 e 032: `src/view/home.tsx`, `src/app/index.tsx`,
`src/view/search/search.tsx`, `src/app/pesquisa.tsx`, `src/view/listings/bookDetail.tsx`,
`src/view/listings/publicProfile.tsx`, `src/view/listings/photoGallery.tsx`, `src/app/perfil.tsx`,
`src/view/profile/*`, `src/view/components/NavigationBar.tsx` e `src/app/_layout.tsx`.

## Decisões de alcance

- **DA-01 (Funcionalidade preservada):** recursos entregues por specs anteriores que não aparecem no
  Figma — busca e categorias da ajuda (Spec 012), criação de alerta em `/alertas` (Spec 016), filtros
  de notificação (Spec 015), conteúdo legal real (Spec 010), confirmação de exclusão (Spec 014) e o
  motivo de denúncia "Cópia pirata ou ilegal" (Spec 011) — **não são removidos**. O alinhamento age
  sobre estrutura, hierarquia e copy, não sobre capacidade do produto.
- **DA-02 (Rótulo sempre visível):** `TextField` mantém o rótulo acima do campo, conforme
  `design-system/04-componentes/campo-de-texto.md`, mesmo que o Figma use rótulo flutuante do M3.
  Alterar o componente afetaria telas fora deste escopo.
- **DA-03 (Barra de voltar):** as telas do escopo mantêm a barra superior com ação de voltar, porque
  no aplicativo elas são alcançadas por empilhamento, e não pela barra de navegação de cinco itens
  do Figma, que não existe no produto atual.
- **DA-04 (Chaves preservadas):** `REPORT_REASONS[].key`, rótulos acessíveis e fluxos cobertos pela
  suíte continuam funcionando; muda a apresentação e a copy visível.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Tela sem cartão):** `/esqueci-senha` adota o enquadramento de `welcome.tsx` — conteúdo
  sobre o fundo da página, alinhado ao topo, com `maxWidth` e `gap` do padrão, sem borda nem sombra.
- **RN-02 (Estado vazio enxuto):** em `/alertas` e `/notificacoes` o estado vazio dispensa a
  manchete e os filtros da lista cheia, com texto alinhado à esquerda. Em `/alertas` o formulário de
  criação permanece visível, porque a Spec 016 também cria o alerta nesta tela e a suíte cobre esse
  caminho; só a manchete fica oculta.
- **RN-03 (Ação de apoio alcançável):** `/meus-anuncios` passa `onNavigateToHelp`, tornando o link
  "Como funciona" visível no estado vazio, como em `05.02`.
- **RN-04 (Nome em vez de identificador):** `/negociacao/[id]` exibe o nome público da contraparte;
  o identificador só aparece se o perfil não puder ser carregado.
- **RN-05 (Marca):** a copy visível usa "IpêBook" nos arquivos do escopo.
- **RN-06 (Acessibilidade):** alvos de toque respeitam `tokens.accessibility.touchTarget`, com
  `accessibilityRole` e rótulo descritivo.

## Critérios de Aceite

1. `/esqueci-senha` apresenta o conteúdo sobre o fundo da página, alinhado ao topo, sem cartão.
2. `/alertas` sem alertas mostra "Nenhum alerta criado", o apoio correspondente e o botão preenchido
   "Procurar um livro", sem a manchete da lista cheia e sem o ícone centralizado.
3. `/meus-anuncios` sem anúncios mostra o link "Como funciona", um único parágrafo de apoio, o ícone
   em destaque circular e o botão "Anunciar livro" em largura total.
4. `/notificacoes` sem notificações mostra apenas o título, o apoio e as ações, sem manchete nem
   chips de filtro.
5. `/excluir-conta` apresenta a barra "Privacidade e dados" e a portabilidade como ação de rodapé.
6. `/denunciar/[id]` apresenta os motivos como lista de rádios, sem descrição secundária visível e
   sem a pergunta redundante. A descrição de cada motivo passa a ser dica de acessibilidade, e a
   linha "Denunciando: …" permanece como salvaguarda contra denunciar o anúncio errado.
7. `/negociacao/[id]` apresenta a barra "Acompanhar encontro", a manchete de `06.05` e o nome da
   contraparte.
8. `/ajuda` apresenta a barra "Ajuda", sem o cabeçalho de seção redundante.
9. `/termos` apresenta a barra "Termos e privacidade".
10. Nenhuma copy visível do escopo escreve "Ipebook".

## Fora deste alinhamento

- O botão "Preferências de notificações" de `07.05` não foi adicionado: o aplicativo ainda não tem a
  tela de configurações de `07.03`, e um botão sem destino seria pior que a ausência.
- A grafia "Ipebook" permanece em `src/view/home.tsx`, `src/view/profile/profile.tsx` e
  `src/model/validators/bookValidator.ts`, fora da fronteira de escopo desta spec.
- `/termos` mantém as abas com o conteúdo real em vez dos dois itens navegáveis de `10.01`, e
  `/ajuda` mantém busca e categorias: remover qualquer um deles regrediria as Specs 010 e 012.

## Verificação

`npm run validate` e os testes das telas afetadas, mais conferência no aparelho via ADB comparando
cada tela com a página correspondente do PDF.
