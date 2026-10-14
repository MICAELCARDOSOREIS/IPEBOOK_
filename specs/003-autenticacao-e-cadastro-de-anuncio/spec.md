# Especificação: autenticação e cadastro de anúncio de livro

Data: 2026-10-13. Branch: `develop`. Tipo: primeira jornada funcional do produto (não é mais
fundação técnica).
Pedido: implementar a primeira jornada útil decidida em [docs/produto.md](../../docs/produto.md):
autenticação de conta seguida de cadastro de anúncio de livro.

## Objetivo e usuário

Permitir que uma pessoa da comunidade crie uma conta, entre com ela e cadastre um livro que quer
vender, trocar ou doar, para que ele apareça na listagem já existente. É o primeiro incremento
que transforma o Ipebook de fundação técnica em produto com uso real.

## Escopo

- Criação de conta com e-mail e senha (sem verificação por e-mail nem login com Google nesta
  especificação — ver "Fora do escopo").
- Login com e-mail e senha.
- Logout.
- Cadastro de um anúncio de livro autenticado: título, autor e modalidade (venda, troca ou
  doação). Preço só é pedido e exibido quando a modalidade é venda.
- O anúncio cadastrado passa a aparecer na listagem existente (`src/view/home.tsx`), junto com
  os demais.
- Persistência em memória, como o restante da base atual — dados desaparecem ao encerrar a
  execução. Nenhum backend real é escolhido nesta especificação.

### Fora do escopo

- Login com Google (decidido para o produto em ADR 0006, mas não implementado nesta
  especificação — ver "Riscos e suposições").
- Verificação de e-mail, recuperação de senha.
- Edição ou exclusão de anúncio, upload de foto, busca e filtros.
- Negociação, conversa, segurança/moderação.
- Qualquer backend real (Supabase ou outro) — a persistência continua em memória; a escolha de
  tecnologia fica para uma especificação futura, conforme já registrado em `docs/produto.md`.
- Validação em dispositivo físico Android — ver `docs/produto.md` (Android e Web é a plataforma
  alvo; esta especificação cobre a lógica e a Web, a validação Android fica para quando houver
  build).

## Histórias e cenários de aceite

### US1 — Criar conta e entrar (P1)

Como visitante do Ipebook, quero criar uma conta com e-mail e senha e entrar com ela, para poder
anunciar um livro.

- Dado que não tenho conta, quando informo um e-mail válido e uma senha de ao menos 8
  caracteres, então a conta é criada e eu fico autenticado.
- Dado que já tenho conta, quando entro com e-mail e senha corretos, então fico autenticado e
  vejo a listagem de livros.
- Dado que informo e-mail já cadastrado ao tentar criar conta, então vejo uma mensagem clara de
  que o e-mail já está em uso, sem expor detalhes internos.
- Dado que informo senha incorreta ao entrar, então vejo uma mensagem clara de credenciais
  inválidas, sem indicar se o e-mail existe ou não (não revelar quais contas existem).

### US2 — Cadastrar anúncio de livro (P1)

Como pessoa autenticada, quero cadastrar um livro com título, autor e modalidade, para
disponibilizá-lo à comunidade.

- Dado que estou autenticado, quando preencho título, autor e escolho a modalidade "troca" ou
  "doação", então o anúncio é criado e aparece na listagem.
- Dado que escolho a modalidade "venda", quando não informo um preço válido (maior que zero),
  então vejo um erro de validação e o anúncio não é criado.
- Dado que deixo título ou autor em branco, então vejo um erro de validação específico para cada
  campo e o anúncio não é criado.
- Dado que não estou autenticado, quando tento acessar o cadastro de anúncio, então sou
  direcionado para a tela de login, sem conseguir cadastrar.

### US3 — Sair da conta (P2)

Como pessoa autenticada, quero sair da minha conta, para que outra pessoa possa usar o
aparelho sem continuar na minha sessão.

- Dado que estou autenticado, quando escolho sair, então deixo de estar autenticado e volto a
  ver a listagem no estado de visitante.

## Requisitos

- FR-001: o sistema deve validar formato de e-mail e tamanho mínimo de senha (8 caracteres) na
  criação de conta.
- FR-002: o sistema não deve permitir duas contas com o mesmo e-mail.
- FR-003: o sistema deve manter uma sessão autenticada em memória, associando o anúncio criado
  à conta autenticada no momento do cadastro.
- FR-004: o sistema deve exigir título e autor não vazios para qualquer anúncio.
- FR-005: o sistema deve exigir preço maior que zero quando a modalidade for venda, e deve
  ignorar/rejeitar preço quando a modalidade for troca ou doação.
- FR-006: o cadastro de anúncio deve exigir sessão autenticada; sem sessão, a ação é bloqueada
  e a pessoa é direcionada ao login.
- FR-007: mensagens de erro de autenticação e de validação de anúncio devem ser específicas o
  suficiente para corrigir o problema, sem expor detalhes internos (stack trace, SQL, etc. —
  não há banco real aqui, mas o padrão vale para quando houver).

## Critérios de sucesso

- SC-001: uma pessoa consegue, em uma única sessão de uso, criar conta, entrar, cadastrar um
  anúncio de cada modalidade (venda, troca, doação) e ver os três na listagem.
- SC-002: as mensagens de erro de cada cenário de falha descrito nas histórias aparecem,
  verificadas por teste automatizado equivalente aos já existentes (`tests/`).
- SC-003: a suíte de testes e a checagem de arquitetura (`npm run validate`) continuam passando
  com as camadas novas (nenhuma regressão nos requisitos funcionais RF01–RF07 já documentados em
  [docs/produto.md](../../docs/produto.md)).

## Casos de erro e suposições

- Suposição: "sessão em memória" significa que, como hoje, os dados somem ao encerrar a
  execução — login precisa ser refeito a cada execução nova do app. Isso é consistente com o
  restante da base atual e não é uma regressão.
- Suposição: senha não será mostrada em texto puro em nenhuma mensagem de log ou erro.
- Risco: como a persistência é em memória, dois usuários simultâneos não compartilham dados
  entre si em ambientes diferentes (cada execução do app tem seu próprio estado) — aceitável
  para esta especificação, mas deve ficar explícito para quem for validar.
- Risco: login com Google (ADR 0006) ficou fora do escopo para não acoplar esta especificação a
  uma decisão de provedor de identidade externo antes de haver backend real; isso não contradiz
  o ADR, só adia a parte que depende de infraestrutura externa.
- Não presumir que o e-mail é verificado — qualquer e-mail de formato válido é aceito.
