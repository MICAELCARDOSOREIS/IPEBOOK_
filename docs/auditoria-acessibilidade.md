# Auditoria de Acessibilidade das Telas Existentes (Issue #96)

Data: 2026-10-19. Autora: Maria Clara. Branch desta auditoria: `feature/96-auditoria-acessibilidade`.

## Método e limitações deste ambiente

Esta auditoria foi feita por **leitura estática do código-fonte** das 20 rotas em `src/app/`
contra os critérios do próprio design system (`design-system/06-acessibilidade.md`) e os sete
pontos listados na issue #96. Não houve alteração de código nesta rodada — por decisão
explícita, esta entrega é só o relatório; as correções ficam para issues/PRs seguintes.

**Duas verificações pedidas pela issue não foram executadas, por limitação real deste
ambiente, e continuam pendentes:**

- **Varredura automatizada com axe-core**: o ambiente compartilhado citado na issue
  (`/home/usermicael/.local/share/ia-integracoes/qualidade`) é um caminho de outra máquina
  (Linux) da equipe — não existe neste computador Windows. O projeto também não tem axe-core/
  jest-axe como dependência própria. Quem tiver acesso àquele ambiente, ou instalar a
  ferramenta no projeto, pode rodar essa verificação e completar este critério.
- **Leitor de tela real em aparelho Android (TalkBack)**: exige hardware Android físico, que
  este ambiente não tem. Fica pendente para quem tiver o aparelho.

Como consequência, os critérios de aceite da issue #96 relativos a essas duas verificações
**permanecem abertos** nesta entrega; os demais (relatório versionado, achados registrados,
`npm run validate`) estão cobertos abaixo.

## Resultado por tela (20 rotas)

| Rota | View | Resultado |
| --- | --- | --- |
| `/` | `home.tsx` | Aprovado — rótulos, papéis e tag de modalidade com texto (não só cor) |
| `/entrar` | `signIn.tsx` | Achado 1 (erro de campo não associado) |
| `/criar-conta` | `signUp.tsx` | Achado 1 |
| `/esqueci-senha` | `forgotPassword.tsx` | Achado 1 |
| `/redefinir-senha` | `resetPassword.tsx` | Achado 1 |
| `/excluir-conta` | `deleteAccount.tsx` | Aprovado — confirmação com rótulo e papel de botão |
| `/anunciar` | `createListing.tsx` | Achado 1; Chip de modalidade aprovado (texto + estado) |
| `/editar-anuncio/[id]` | `editListing.tsx` | Achado 1 |
| `/meus-anuncios` | `myListings.tsx` | Achado 2 (Dialog sem gestão de foco); status com `Tag` em texto, aprovado |
| `/denunciar/[id]` | `reportListing.tsx` | Aprovado — opções com `accessibilityRole="radio"` e `accessibilityState`, campo de detalhes rotulado |
| `/livro/[id]` | `bookDetail.tsx` | Aprovado — ações com rótulo explícito (favoritar, denunciar) |
| `/negociacao/[id]` | `requestDetail.tsx` | Aprovado (ver nota) |
| `/pedidos-recebidos` | `receivedRequests.tsx` | Aprovado (ver nota) |
| `/meus-pedidos` | `sentRequests.tsx` | Aprovado (ver nota) |
| `/pesquisa` | `search.tsx` | Achado 2 (Dialog de limpar histórico) |
| `/alertas` | `searchAlerts.tsx` | Achado 1 (erro do alerta não associado ao campo) e Achado 2 (Dialog de exclusão) |
| `/favoritos` | `favorites.tsx` | Aprovado |
| `/notificacoes` | `notifications.tsx` | Aprovado — item de notificação com rótulo combinando título e mensagem |
| `/ajuda` | `helpAndFaq.tsx` | Aprovado — cabeçalho e botões de pergunta com papel |
| `/termos` | `termsAndPrivacy.tsx` | Achado 3, corrigido (abas agora em contêiner `tablist`) |

Nota sobre `requestDetail.tsx`/`receivedRequests.tsx`/`sentRequests.tsx`: usam `Pressable` com
`accessibilityRole`/`accessibilityLabel` consistentes com o restante do app; não apresentaram
achado novo além dos já listados (que não se repetem aqui).

## Achados

### Achado 1 — Mensagem de erro de campo não associada ao campo (critério "Mensagens de erro associadas ao campo correspondente")

**Onde:** `src/view/components/TextField.tsx` (usado por `signIn.tsx`, `signUp.tsx`,
`forgotPassword.tsx`, `resetPassword.tsx`, `createListing.tsx`, `editListing.tsx`) e, no mesmo
padrão com `TextInput` direto, `src/view/search/searchAlerts.tsx`.

**O que acontece:** o texto de erro (`accessibilityRole="alert"`) é renderizado como um `<Text>`
irmão, visualmente abaixo do campo, mas nunca é associado a ele via propriedade de
acessibilidade (`accessibilityLabelledBy`/equivalente de `aria-describedby`) nem incorporado ao
`accessibilityLabel`/`accessibilityHint` do `TextInput`. Um leitor de tela que foca o campo não
ouve automaticamente a mensagem de erro associada a ele — só quem navegar sequencialmente até o
texto de erro (se o focar) a ouve, fora do contexto do campo.

**Impacto:** afeta diretamente o critério "Mensagens de erro associadas ao campo
correspondente" da issue — não está implementado em nenhuma tela que usa `TextField` ou `TextInput`
com erro de validação.

**Sugestão para correção futura:** adicionar `nativeID` ao `<Text>` de erro e referenciá-lo via
`accessibilityLabelledBy` no `TextInput` (RN Web) ou compor a mensagem no próprio
`accessibilityLabel`/`accessibilityHint` do campo quando `hasError` for verdadeiro.

### Achado 2 — `Dialog` não gerencia foco, embora o design system declare isso (critério "Ordem de foco coerente e navegação por teclado na Web")

**Onde:** `src/view/components/Dialog.tsx`, usado por `myListings.tsx`, `search.tsx` e
`searchAlerts.tsx`.

**O que acontece:** `design-system/06-acessibilidade.md` (linha 39-40) documenta: "Diálogo
prende o foco e devolve ao gatilho ao fechar". A implementação atual usa `Modal` com
`accessibilityViewIsModal`/`aria-modal`, mas não há nenhum código movendo o foco para dentro do
diálogo ao abrir, nem devolvendo o foco ao elemento que o abriu ao fechar (sem `ref`, sem
`autoFocus`, sem manipulação de foco no `onShow`/fechamento). Na Web, isso significa que a
navegação por Tab pode escapar para o conteúdo atrás do diálogo enquanto ele está aberto, e o
foco não retorna ao botão que o abriu.

**Impacto:** afeta o critério "Ordem de foco coerente e navegação por teclado na Web" nas três
telas que usam `Dialog` para confirmações.

**Sugestão para correção futura:** capturar o elemento com foco antes de abrir, mover o foco
para o primeiro elemento focável do diálogo ao montar (ex. `ref` + `.focus()` condicionado a
`Platform.OS === "web"`), e devolver o foco ao fechar.

### Achado 3 — Abas sem contêiner `tablist` (critério "Rótulo e papel de todo elemento interativo") — **Corrigido na issue #106**

**Onde:** `src/view/components/NavigationBar.tsx` e as abas Termos/Privacidade em
`src/view/legal/termsAndPrivacy.tsx`. Ambos usam `accessibilityRole="tab"` nos itens
individuais, mas a `View` que os agrupa não declara `accessibilityRole="tablist"`.

**Impacto:** menor que os achados 1 e 2 — os itens individuais já têm papel e rótulo corretos
(`role="tab"`, `accessibilityState.selected`); falta só o papel do contêiner, que ajuda leitores
de tela e navegação por teclado na Web a entender o agrupamento e (convencionalmente) a
navegação por setas entre abas.

**Sugestão para correção futura:** adicionar `accessibilityRole="tablist"` à `View` que envolve
os itens nos dois componentes.

**Correção aplicada (issue #106):** `accessibilityRole="tablist"` adicionado à `View` que
agrupa os itens em `NavigationBar.tsx` e `termsAndPrivacy.tsx`. Não foi usado `accessible={true}`
no contêiner: no React Native, `accessible={true}` faz a View ser tratada como um único
elemento atômico por VoiceOver/TalkBack, escondendo os `tab`s individuais da navegação por
leitor de tela — o que pioraria a acessibilidade em vez de corrigi-la. O papel do contêiner e
o estado selecionado/rótulo de cada aba continuam expostos individualmente. Cobertura em
`tests/components/navigationBar.test.tsx` e `tests/components/termsAndPrivacyView.test.tsx`
(cada `View` recebeu um `testID` só para a asserção do papel, já que a consulta por role do
`@testing-library/react-native` não enxerga contêineres não marcados como `accessible`).

## O que foi verificado e aprovado, sem achados

- Rótulo e papel em botões com conteúdo textual (a imensa maioria do app): o `accessibilityLabel`
  implícito do texto visível é suficiente; não é preciso rótulo redundante.
- Alvo de toque mínimo de 48 dp: confirmado via `tokens.accessibility.touchTarget` em
  `minHeight`/`minWidth` nos componentes revisados, incluindo o `Chip` de 32 px compensado por
  `hitSlop={8}` (32 + 8 + 8 = 48).
- Informação por cor: a tag de modalidade (`home.tsx`, `bookDetail.tsx`, `search.tsx`) e o status
  de anúncio (`Tag`, `myListings.tsx`) sempre têm texto, nunca só cor.
- Mensagens de estado com `accessibilityRole="alert"` presentes em todos os textos de erro e no
  `Snackbar` (que também usa `accessibilityLiveRegion="polite"`).
- Opções de rádio (`reportListing.tsx`) com `accessibilityRole="radio"` e
  `accessibilityState={{ checked }}` corretos.

## Pendências desta issue

- [ ] Rodar axe-core na Web (bloqueado: ferramenta só existe no ambiente compartilhado de outra
  máquina da equipe, ou precisa ser instalada neste projeto).
- [ ] Verificar com TalkBack em aparelho Android real (bloqueado: sem hardware neste ambiente).
- [x] Corrigir o achado 1 (issue #104, ver seção do achado acima — PR em revisão, ainda não
  integrado nesta branch).
- [ ] Corrigir o achado 2 acima (fica para issue/PR seguinte, por decisão de entregar primeiro
  só o relatório).
- [x] Corrigir o achado 3 (issue #106, ver seção do achado acima).
- [ ] Os ~50 tokens de cor não auditados manualmente, já registrados como lacuna em
  `design-system/06-acessibilidade.md` (linha 5-6), continuam sem verificação própria desta
  auditoria — herdados, não introduzidos agora.

## Validação

- `npm run validate`: aprovado (nenhuma alteração de código nesta entrega; validação roda limpa
  como já registrado em `docs/estado.md`).
- **Issue #106 (correção do achado 3)**: `npm run validate` aprovado (471 testes em 78 arquivos,
  cobertura acima de 80% nas 4 dimensões, arquitetura sem violações). Verificação manual de que
  os `tab`s individuais continuam acessíveis isoladamente (sem `accessible={true}` no
  contêiner, que colapsaria os filhos em um único elemento para VoiceOver/TalkBack).
