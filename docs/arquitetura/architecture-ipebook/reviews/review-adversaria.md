# Revisão adversária do spine — IpêBook

Data: 2026-10-17
Artefato atacado: `docs/arquitetura/architecture-ipebook/architecture-ipebook.md`
Método: para cada par de unidades (issues), construir uma implementação que obedece a letra de
todos os ADs vigentes e mostrar que as duas, construídas em paralelo, produzem comportamento
incompatível. Cada buraco fecha com um AD novo ou uma Rule mais apertada — nenhuma reescrita do
paradigma.

---

## Buraco 1 — Quem exclui "pausado"/indisponível do catálogo: a consulta ou o filtro do cliente

**Unidades:** #91 (editar e pausar anúncio) × #93 (filtros do catálogo)

- **#91** cumpre AD-5 e AD-7 à letra: estende `Book.status` com um novo valor (ex.: `"paused"`)
  via transição nomeada (`pauseListing`/`resumeListing`), com migração própria, e seu critério de
  aceite exige que "anúncio pausado não aparece no catálogo nem na pesquisa". Nada na spec diz
  *onde* esse não-aparecimento é implementado — só que o resultado observável deve ser esse.
- **#93** cumpre AD-13 à letra: "a tela carrega o catálogo uma vez (`listBooks()`) e todo filtro,
  busca e ordenação opera sobre esse estado já carregado". Para atender ao próprio critério de
  aceite ("filtros aplicáveis na Home e na Pesquisa, sem duplicar a lógica entre as duas"), a
  unidade naturalmente implementa a exclusão de `status !== "available"` dentro do novo módulo de
  filtros do cliente — porque é ali que "toda" regra de inclusão/exclusão da lista passou a viver.
- **Incompatibilidade concreta:** se #91 for implementada depois de #93 já existir, e a exclusão
  de pausados ficar só no filtro do cliente, qualquer tela futura que chame `listBooks()` sem
  passar pelo pipeline de filtros de #93 (favoritos, perfil público do anunciante de #73, um card
  de "últimos anúncios" na home) exibe livros pausados. Se, inversamente, #91 implementar a
  exclusão dentro do próprio `listBooks()`/datasource (lugar igualmente defensável, já que é
  "dado que exija sessão fica fora do catálogo" por analogia ao AD-9), e #93 também filtrar por
  status no cliente assumindo que o datasource ainda devolve tudo, o resultado é redundante mas
  inofensivo — até a regra de "o que é visível no catálogo" mudar uma vez só em um dos dois
  lugares e divergir silenciosamente da outra. Nenhum AD obriga as duas unidades a nascerem
  cientes uma da outra nem fixa *qual* camada é a dona da visibilidade por status.
- **AD proposto (aperta AD-13):** "Visibilidade por status é dever do datasource, não do filtro."
  Todo contrato `I*DataSource` que lista `Book` devolve, por padrão, somente anúncios com status
  visível publicamente (lista fixada na spec que introduzir cada status); um caller que precise do
  conjunto completo (dono vendo o próprio anúncio pausado) usa um parâmetro explícito
  (`includeOwnerOnly` ou equivalente), não um filtro de cliente reaproveitado. AD-13 continua
  regendo busca/ordenação/filtro de atributo, não a inclusão/exclusão por status.

---

## Buraco 2 — Casamento de termo de busca implementado três vezes

**Unidades:** #93 (filtros do catálogo) × #94 (histórico de buscas) × #95 (editar alerta)
(regra de correspondência de termo já existe em `matchNewBook`, citada pela própria #95)

- **#93** cumpre AD-13: filtra o catálogo já carregado no cliente por título/autor/modalidade/
  categoria/preço — sua própria lógica de "o termo X corresponde ao livro Y".
- **#95** cumpre AD-4 e AD-5: estende `iSearchAlertUseCases` com `updateAlert`, preservando
  `matchNewBook` como a função que decide se um anúncio novo casa com o termo salvo do alerta —
  implementação separada, em outra camada (alerta reage a anúncio novo, fora do catálogo já
  carregado que AD-13 rege).
- **#94** não define regra de correspondência própria, mas seu critério "toque em um termo recente
  refaz a busca" delega para a tela de pesquisa — ou seja, para a mesma função de #93.
- **Incompatibilidade concreta:** nada no spine impede que "corresponde ao termo" signifique coisas
  diferentes em #93 (ex.: substring case-insensitive em título e autor) e em #95/`matchNewBook`
  (ex.: igualdade exata, ou substring só em título). Depois de #95 adicionar `updateAlert`
  revalidando "com as mesmas regras da criação" — regras que vivem em `iSearchAlertUseCases`, não
  em `useSearchViewModel` — um termo que a Pesquisa (#93) encontra pode nunca disparar o alerta
  equivalente (#95), e vice-versa, sem que nenhum teste de nenhuma das duas specs detecte a
  divergência, porque cada uma testa só o próprio código.
- **AD proposto (novo):** "Correspondência texto↔livro é uma função pura em `model`, com um único
  dono." Criar (ou apontar, se já existir uma candidata) uma função em `src/model/` —
  ex. `matchesBookQuery(book, query): boolean` — sem dependência externa (AD-2 já exige isso da
  camada), usada por `useSearchViewModel` (filtro de #93), por `matchNewBook` (alerta de #95) e por
  qualquer busca futura. Nenhuma unidade implementa sua própria comparação de string contra campos
  de `Book`.

---

## Buraco 3 — Dois donos do caminho `/perfil`: perfil próprio (#88) e perfil público de terceiros (#73)

**Unidades:** #88 (rota de perfil, mínima) × #73 (perfil público do anunciante)

- **#88** cumpre AD-1: cria a rota que falta na barra de navegação (hoje `"/perfil"` aponta para
  lugar nenhum), reexportando View a partir de `app/`, e sua opção 2 explicitamente reúne atalhos
  do próprio usuário (Meus anúncios, Favoritos, Alertas, Sair etc.) sob esse caminho.
- **#73** cumpre AD-1, AD-6 e AD-9: cria `src/app/perfil/[userId].tsx`, uma tela **somente leitura**
  do perfil de outra pessoa, explicitamente sem edição e sem fluxo de configurações (que é #55/56,
  fora do escopo de #73).
- **Incompatibilidade concreta:** nada no spine, nem na issue, obriga as duas implementações a
  tratar "perfil" como duas entidades de rota distintas com contrato de UI diferente. Um
  desenvolvedor resolvendo #88 isoladamente pode — para "não duplicar lógica com #73", que parece
  a leitura óbvia do AD-12 ("padrão visual repetido nasce como componente") — reaproveitar a
  ViewModel/UseCase de perfil público de #73 para renderizar o próprio perfil, herdando o caráter
  somente-leitura dela (perfil próprio sem botão de editar, sem sair, sem excluir conta: exatamente
  o que #88 pede para resolver). Alternativamente, se #73 for implementada depois assumindo que
  "perfil" já significa "tela com atalhos do próprio usuário" (o que #88 construiu), o
  desenvolvedor de #73 pode tentar encaixar o perfil de terceiros dentro da mesma rota estática
  `/perfil`, colidindo com a rota dinâmica que a própria issue pede. O Capability Map já lista as
  duas sob "AD-1" apenas — nenhum AD distingue "perfil-sujeito" (quem está sendo visto) de
  "perfil-ator" (quem está vendo), que é a causa raiz.
- **AD proposto (novo):** "Perfil próprio e perfil de terceiros são contratos distintos." O caso de
  uso e a rota de perfil público (`getPublicProfile`, `/perfil/[userId]`) nunca servem a tela do
  próprio usuário, mesmo quando `userId === sessionUserId`; o caso de uso de perfil próprio (dono
  dos atalhos pessoais) vive em um módulo e rota distintos (`/perfil/index` ou `/conta`) e pode
  compor, mas não herdar, os componentes visuais de #92. Nomear explicitamente no
  Capability → Architecture Map qual issue é dona de qual caminho.

---

## Buraco 4 — "Primeiro acesso" tem dois candidatos a dono, e nenhum AD define o gate de sessão único

**Unidades:** #98 (boas-vindas e primeiro acesso) × #97 (estados do flufo de acesso) × AD-9

- **#98** cumpre AD-9: a tela de boas-vindas "não bloqueia quem só quer olhar o catálogo sem conta",
  decide por si mesma (flag local de "já vi a tela") quando aparecer, sem tocar no fluxo de
  autenticação.
- **#97** cumpre AD-8: trata os estados que o Supabase Auth devolve (e-mail de confirmação, link
  expirado, e-mail já cadastrado) — comportamento condicionado só pela escolha de backend em
  `di/container.ts`.
- **Incompatibilidade concreta:** as duas unidades decidem, cada uma por conta própria, "o que a
  pessoa vê antes de chegar ao catálogo logada". #98 intercepta a rota inicial no primeiro acesso;
  #97 intercepta no retorno de um link de confirmação/recuperação. Nenhum AD define a ordem de
  precedência nem o dono único do redirecionamento quando os dois gates coincidem — alguém abre o
  app pela primeira vez a partir de um link de confirmação de e-mail enviado durante o cadastro.
  Implementadas isoladamente, cada spec resolve o próprio caso feliz e nenhuma cobre a composição;
  o resultado plausível é a tela de boas-vindas aparecer por cima do retorno do link (ou vice-
  versa), e cada spec passa os próprios testes porque nenhuma simula a outra em andamento.
- **AD proposto (novo):** "Um único gate de sessão decide a rota inicial." Introduzir (ou apontar
  a existente, se `_layout.tsx` já fizer esse papel) uma função pura de decisão de rota inicial que
  recebe {tem sessão, é primeiro acesso no dispositivo, há parâmetro de retorno de link} e devolve
  uma rota — chamada uma única vez na composição (`app/_layout.tsx`), nunca duplicada por tela.
  #97 e #98 contribuem casos a essa função; nenhuma delas faz `router.replace` por conta própria na
  raiz do app.

---

## Buraco 5 — Dado local "pessoal" (#94) e AD-14 (exclusão de conta remove todo dado derivado) não se falam em multi-dispositivo

**Unidades:** #94 (histórico de buscas) × AD-14

- **#94** cumpre a letra do Deferred do próprio spine: "o dado é pessoal e não compartilhado,
  então o dispositivo é permitido". A spec guarda o histórico só em `AsyncStorage`, sem tabela,
  sem RLS — e seu critério de aceite "o histórico não vaza entre contas diferentes no mesmo
  dispositivo" já é tratado.
- **AD-14** exige que "entidade ou arquivo novo declare, na sua especificação, o que acontece na
  exclusão da conta, e o caso de uso de exclusão seja estendido no mesmo trabalho, com teste" —
  #94 pode cumprir isso limpando o `AsyncStorage` do dispositivo atual dentro de `deleteAccount`,
  e o teste passa.
- **Incompatibilidade concreta:** `deleteAccount` roda no dispositivo de onde a pessoa pediu a
  exclusão. Se o histórico de busca também existir no celular Android da mesma pessoa e a exclusão
  for feita pela Web, o AD-14 "cumprido" na Web não alcança o dado no Android — ele nunca é
  derivado de uma tabela, então nenhuma Rule hoje escrita (que fala em `supabase/migrations/`,
  RLS, caso de uso de exclusão) sequer tem como alcançá-lo. O spine declara vitória de LGPD sobre
  um dado que, por desenho, está fora do alcance do próprio mecanismo que o AD descreve.
- **AD proposto (aperta AD-14):** acrescentar à Rule: "dado derivado que vive só no dispositivo
  (fora de `supabase/*`) não é alcançado pelo caso de uso de exclusão de conta; a especificação que
  o introduzir declara explicitamente esse limite e garante, em vez disso, que ele é apagado no
  logout/exclusão feitos *daquele mesmo dispositivo* — nunca apresentado como 'removido' sem essa
  ressalva." Isso não resolve o problema de produto (dado residual em outro aparelho), mas impede
  que duas specs (ex. #94 e uma futura #96/acessibilidade-e-privacidade) declarem conformidade com
  AD-14 por caminhos que, somados, dão uma falsa sensação de exclusão completa.

---

## Outros atritos notados, não desenvolvidos a par

- Android × Web: nenhum AD trata divergência de comportamento de upload de foto (#82) entre
  seletor de imagem nativo e `<input type="file">` na Web — AD-10 fixa só o destino do binário.
- #91 e #82 podem colidir em migrações concorrentes sobre `v2_books` (campos de pausa e campos de
  foto) se feitas em paralelo sem ordem declarada; AD-7 garante formato de arquivo, não exclusão
  mútua de trabalho simultâneo na mesma tabela.
