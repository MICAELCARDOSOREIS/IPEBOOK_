# Especificação: versão 1.0 — telas alinhadas ao design system

Data: 2026-10-14. Branch: `develop`. Tipo: redesenho de telas existentes + telas novas que
faltavam, para fechar a versão 1.0 do produto.
Pedido: fazer as telas do app seguirem de fato o [`design-system/`](../../design-system/README.md)
(hoje usam estilos inline livres, não os componentes documentados), e completar as telas que o
produto nunca teve — recuperação de senha, busca, perfil de usuário e detalhe do livro —
dividido entre Micael (autenticação + modelo do detalhe do livro) e Maria Clara (navegação,
perfil e a tela do detalhe do livro).

## Objetivo e usuário

Permitir que qualquer pessoa use o Ipebook por uma interface consistente com o design system
(Campo de texto, Botão, Barra de navegação, Avatar, Campo de busca — ver
[design-system/04-componentes/](../../design-system/04-componentes/)), incluindo recuperar o
acesso à conta sem precisar de suporte, buscar um livro específico, e ver tanto o próprio
perfil quanto o de quem anunciou um livro.

## Escopo

### Autenticação (Micael)

- Redesenhar a tela de login (`src/view/auth/signIn.tsx`) usando Campo de texto (com estado de
  foco e erro) e Botão (pílula) do design system, sem mudar o comportamento já coberto pela
  spec 003.
- Redesenhar a tela de cadastro (`src/view/auth/signUp.tsx`) do mesmo jeito.
- Nova tela "Esqueceu a senha": a pessoa informa o e-mail, o sistema gera uma senha temporária,
  já a define como a senha da conta, e a exibe na própria tela (fluxo simulado, sem envio de
  e-mail real — a persistência é em memória e não há serviço de e-mail).

### Detalhe do livro (dividida entre Micael e Maria Clara)

- Nova tela de detalhe do livro, aberta ao tocar em um item do catálogo: mostra a capa
  ilustrativa (variante "em cartão", ≥ 80 px), título, autor, modalidade, preço (se venda) e o
  nome de quem anunciou (link para o perfil público, US5). O botão "Solicitar negociação" (já
  existente na spec 004) passa a viver aqui, em vez de dentro da linha da lista. Como não é uma
  tela raiz, usa a Barra superior (botão voltar + nome da tela), conforme
  `design-system/04-componentes/barra-superior.md`.
- Camada de modelo/caso de uso (buscar um livro por id): **Micael**.
- Camada de tela/rota/navegação a partir do catálogo: **Maria Clara**.

### Navegação e perfil (Maria Clara)

- Barra de navegação fixa com 3 destinos: Início, Pesquisa, Perfil (ver [ADR 0011](../../docs/adr/0011-navegacao-tres-destinos.md)).
- Redesenhar a Home (`src/view/home.tsx`) usando os componentes documentados para item de lista
  de livro (incluindo a capa ilustrativa na variante "em lista", 44 px, para anúncios sem foto),
  sem mudar o comportamento já coberto pela spec 005 (catálogo).
- Nova tela de busca: filtra o catálogo já carregado por título ou autor, usando o Campo de
  busca do design system — sem endpoint novo, filtro sobre os dados já trazidos por
  `listBooks()`.
- Nova tela de perfil próprio: nome público, foto (iniciais quando não houver), rede social
  opcional — dados editáveis pela própria pessoa.
- Nova tela de perfil público: ao tocar em um anúncio ou no nome de quem anunciou, ver o nome
  público, avatar e a lista de anúncios dessa pessoa (filtrados por `ownerId`).

### Fora do escopo

- Envio de e-mail real na recuperação de senha — continua simulado enquanto não houver backend
  real (ver [ADR 0006](../../docs/adr/0006-conta-com-email-e-google.md), que já deixou a escolha
  de backend para quando houver necessidade concreta).
- Upload de foto real (câmera/galeria) — o campo de foto do perfil aceita só uma URL de imagem
  nesta versão, sem seletor de arquivo.
- "Estante" e "Conversas" como destinos de navegação — não existem como funcionalidade
  especificada (ver ADR 0011).
- Interruptor (toggle) no perfil — o inventário do design system lista esse componente para
  "Configurações/Perfil", mas não há nenhuma funcionalidade de configuração/notificação no
  escopo real do IPEBOOK_ (a ideia de notificações foi descartada por falta de necessidade
  concreta). Não forçar um controle sem função, mesmo estando documentado — mesmo critério do
  ADR 0011 para "Estante"/"Conversas".
- Barra superior no Perfil — a própria doc do componente (`barra-superior.md`) diz que telas
  raiz usam o título grande da marca, não essa barra; Perfil é uma das 3 raízes da barra de
  navegação (ADR 0011), então segue o mesmo padrão da Home, não o do detalhe do livro.
- Edição de anúncio, denúncia/bloqueio, mensagens diretas entre usuários.
- Busca por modalidade, preço ou localização — só por título/autor nesta versão.
- Validação em dispositivo físico Android — cobre a lógica e a Web; a validação em aparelho
  (como a já feita para o MVP, ver `docs/versoes/mvp/`) é o passo final, depois do código
  existir.

## Histórias e cenários de aceite

### US1 — Recuperar acesso à conta (P1, Micael)

Como pessoa que esqueceu a senha, quero recuperar o acesso informando meu e-mail, para voltar a
entrar na minha conta.

- Dado que informo um e-mail de conta existente na tela "Esqueceu a senha", quando confirmo,
  então vejo uma senha temporária exibida na tela e minha conta passa a usar essa senha.
- Dado que informo um e-mail que não corresponde a nenhuma conta, então vejo uma mensagem clara
  de que não há conta com esse e-mail, sem confirmar nem negar a existência de outras contas.
- Dado que recebo a senha temporária, quando volto para a tela de login e entro com ela, então
  consigo acessar minha conta normalmente.

### US2 — Telas de autenticação consistentes com o design system (P1, Micael)

Como qualquer pessoa, quero que os campos e botões de login/cadastro sigam o padrão visual do
resto do app, para ter uma experiência consistente.

- Dado que toco em um campo de texto (e-mail ou senha), então a borda e o rótulo mudam para a
  cor de foco, conforme `campo-de-texto.md`.
- Dado que um campo tem erro de validação, então a borda e a mensagem usam a cor de erro, com
  uma mensagem que diz como corrigir (nunca só "Campo inválido").
- Dado que há uma ação principal na tela (Entrar, Criar conta, Enviar), então ela é um único
  botão preenchido em pílula — nunca mais de um botão preenchido na mesma tela.

### US3 — Buscar um livro no catálogo (P1, Maria Clara)

Como qualquer pessoa, quero buscar um livro por título ou autor, para encontrar rapidamente o
que procuro sem rolar a lista inteira.

- Dado que digito um termo no campo de busca, então a lista mostra só os livros cujo título ou
  autor contém o termo (sem diferenciar maiúsculas/minúsculas).
- Dado que não há livro correspondente ao termo buscado, então vejo um estado vazio explicando
  que nada foi encontrado, não um erro.
- Dado que apago o termo buscado, então volto a ver o catálogo completo.

### US4 — Ver e editar meu perfil (P1, Maria Clara)

Como pessoa autenticada, quero ver e editar meu nome público, foto e rede social, para que
quem veja meus anúncios saiba quem está anunciando.

- Dado que estou autenticada e abro "Perfil", então vejo meu avatar (foto ou iniciais), nome
  público (ou um padrão, se eu nunca tiver definido um) e rede social, se houver.
- Dado que edito o nome público, a foto (URL) ou a rede social e salvo, então os dados novos
  passam a aparecer no meu perfil e no perfil público visto por outras pessoas.
- Dado que não estou autenticada e tento abrir "Perfil", então sou direcionada para o login.

### US5 — Ver o perfil público de quem anunciou (P2, Maria Clara)

Como pessoa vendo o catálogo, quero ver quem anunciou um livro, para decidir se quero negociar
com essa pessoa.

- Dado que toco no nome de quem anunciou um livro, então vejo o perfil público dessa pessoa:
  avatar, nome público e a lista dos livros que ela anunciou.
- Dado que a pessoa anunciante nunca definiu nome público, então vejo um nome padrão (ex.: "um
  leitor da comunidade"), nunca o e-mail dela exposto publicamente.

### US6 — Ver o detalhe de um livro (P1, dividida entre Micael e Maria Clara)

Como pessoa vendo o catálogo, quero tocar em um livro e ver seus detalhes, para decidir se
quero solicitar negociação sem precisar que tudo caiba na linha da lista.

- Dado que toco em um item do catálogo, então vejo uma tela com título, autor, modalidade,
  preço (se venda) e o nome de quem anunciou.
- Dado que estou na tela de detalhe e toco no nome de quem anunciou, então vou para o perfil
  público dessa pessoa (US5).
- Dado que estou autenticada e vejo o detalhe de um livro de outra pessoa, então consigo
  solicitar negociação pela mesma ação que já existia na listagem (spec 004), sem regressão de
  comportamento.
- Dado que busco um livro por id inexistente (ex.: link direto inválido), então vejo uma
  mensagem de erro clara, não uma tela quebrada.

## Requisitos

- FR-001: a recuperação de senha deve exigir e-mail de conta existente; para e-mail
  inexistente, a mensagem não deve confirmar nem negar a existência de outras contas com outros
  e-mails (mesma regra de segurança já aplicada ao login, spec 003).
- FR-002: a senha temporária gerada deve atender às mesmas regras de validação de senha já
  existentes (mínimo de 8 caracteres).
- FR-003: todo campo de texto das telas de autenticação deve ter rótulo sempre visível, estado
  de foco e estado de erro conforme `campo-de-texto.md`.
- FR-004: toda tela deve ter no máximo um botão preenchido (ação principal); ações secundárias
  usam contornado ou texto, conforme `botao.md`.
- FR-005: a busca deve filtrar por título ou autor, sem diferenciar maiúsculas/minúsculas, sem
  chamar `listBooks()` de novo a cada tecla (filtro sobre os dados já carregados).
- FR-006: o perfil próprio deve exigir sessão autenticada; sem sessão, redireciona ao login
  (mesmo padrão do cadastro de anúncio, spec 003).
- FR-007: o perfil público nunca deve expor o e-mail da pessoa anunciante — só nome público
  (ou padrão), avatar e os anúncios dela.
- FR-008: a barra de navegação deve ter exatamente 3 itens (Início, Pesquisa, Perfil), com o
  item ativo indicado por pílula, conforme ADR 0011 e `barra-de-navegacao.md`.
- FR-009: buscar um livro por id inexistente deve retornar um erro de domínio tratável pela
  View (mensagem clara), nunca lançar uma exceção não tratada.
- FR-010: todo anúncio sem foto deve exibir a capa ilustrativa (cor/motivo determinísticos a
  partir do `id` do anúncio, nunca aleatórios a cada renderização), tanto na linha da lista
  quanto no detalhe do livro.
- FR-011: toda tela que não seja uma das 3 raízes da barra de navegação (Início, Pesquisa,
  Perfil) deve usar a Barra superior, com botão voltar funcional e o nome da tela.

## Critérios de sucesso

- SC-001: uma pessoa que esqueceu a senha consegue recuperar o acesso e entrar de novo, em uma
  única sessão de uso, sem precisar de suporte externo.
- SC-002: uma pessoa consegue buscar um livro específico pelo título ou autor e encontrá-lo (ou
  ver o estado vazio, se não existir), verificado por teste automatizado.
- SC-003: uma pessoa consegue editar seu perfil e ver a mudança refletida tanto no próprio
  perfil quanto no perfil público visto a partir de um anúncio dela.
- SC-004: `npm run validate` passa com as telas novas e redesenhadas, sem regressão nos
  requisitos funcionais das specs 003, 004 e 005.
- SC-005: uma pessoa consegue tocar em um livro do catálogo, ver seus detalhes e solicitar
  negociação a partir dessa tela, sem regressão no comportamento já coberto pela spec 004.

## Casos de erro e suposições

- Suposição: "senha temporária exibida na tela" é uma simplificação aceitável enquanto não
  houver backend real com envio de e-mail — fica registrado como limitação conhecida, não como
  comportamento final de produção.
- Suposição: o nome padrão usado quando a pessoa não define nome público ("um leitor da
  comunidade") não é editável nesta versão — é só um texto fixo de fallback.
- Risco: como a persistência é em memória, o perfil (como tudo o resto) desaparece ao encerrar
  a execução — mesma limitação já documentada nas specs 003/004/005.
- Risco: filtrar client-side funciona bem para o volume atual (sem dados de exemplo
  pré-carregados); se o catálogo crescer muito, a busca pode precisar de paginação/índice no
  servidor — fora do escopo desta versão (ver issue de catálogo/paginação, já registrada e
  apagada como backlog condicional anteriormente; reabrir se a necessidade voltar a existir).
- Não presumir upload de foto real — o campo aceita só URL de imagem; se a URL for inválida, a
  tela cai para o avatar com iniciais, sem erro bloqueante.
