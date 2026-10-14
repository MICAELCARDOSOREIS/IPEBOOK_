# Especificação: catálogo de livros (listagem na Home)

Data: 2026-10-14. Branch: `develop`. Tipo: **retroativa** — a funcionalidade já existe e está em
produção desde a fundação do projeto (`specs/001-estrutura-mvvm/`); nunca tinha uma spec própria.
Pedido: documentar o comportamento já implementado do catálogo, separando-o da fundação
arquitetural e das especificações de autenticação/anúncio/negociação, para que mudanças futuras
(paginação, busca, filtros) tenham uma base clara do que já está decidido e implementado.

## Objetivo e usuário

Permitir que qualquer pessoa — autenticada ou não — veja a lista de livros anunciados na
comunidade (venda, troca ou doação), com o estado do carregamento sempre visível, para decidir
se quer entrar/criar conta e negociar algum.

## Escopo

- Carregar e exibir a lista de livros do catálogo ao abrir a Home (`src/view/home.tsx`,
  `useHomeViewModel`), via `IBookUseCases.listBooks()`.
- Estado de carregamento com indicador visual e rótulo acessível.
- Estado de erro com mensagem específica e botão "Tentar novamente" (retry), sem derrubar o
  app nem expor detalhes internos.
- Estado vazio com mensagem amigável quando não há livros.
- Cada item da lista mostra título, autor e a tag de modalidade (Venda/Troca/Doação) com cor e
  nome por extenso, nunca só a cor (ver `design-system/04-componentes/tag.md`).
- Recarregar a lista automaticamente quando um anúncio novo é cadastrado (via navegação de
  volta à Home) e manualmente via `reload()`.
- Acessível sem conta: a listagem é visível para visitante; só a ação de negociar/anunciar
  exige sessão (cobertas em specs 003/004).

### Fora do escopo

- Paginação — hoje a lista carrega tudo de uma vez; não há volume de dados real que justifique
  paginar.
- Busca e filtros por modalidade, título, autor ou localização.
- Ordenação customizável (a ordem é a de retorno do datasource, sem critério definido).
- Edição, exclusão ou destaque de anúncios.
- Indicador visual de status "reservado"/"concluído" na listagem (o campo `Book.status` existe
  no modelo desde a spec 004, mas a Home não o exibe ainda).
- Validação em dispositivo físico Android — cobre a lógica e a Web; validação em aparelho fica
  para quando houver necessidade concreta de publicar.

## Histórias e cenários de aceite

### US1 — Ver o catálogo de livros (P1)

Como qualquer pessoa (visitante ou autenticada), quero ver a lista de livros disponíveis ao
abrir o app, para saber o que existe antes de decidir agir.

- Dado que abro o app, quando o catálogo carrega com sucesso, então vejo cada livro com título,
  autor e a tag de modalidade correspondente.
- Dado que o catálogo está carregando, então vejo um indicador de carregamento com rótulo
  acessível ("Carregando livros"), sem a lista vazia aparecer prematuramente.
- Dado que não há nenhum livro cadastrado, então vejo uma mensagem amigável explicando que a
  lista aparecerá quando houver livros disponíveis, sem parecer um erro.

### US2 — Recuperar de uma falha ao carregar (P1)

Como pessoa usando o app, quero poder tentar novamente quando o catálogo falha ao carregar,
para não ficar travada numa tela quebrada.

- Dado que o carregamento do catálogo falha, então vejo uma mensagem de erro específica (não um
  erro técnico genérico) e um botão "Tentar novamente".
- Dado que estou na tela de erro, quando toco em "Tentar novamente", então o catálogo tenta
  carregar de novo, mostrando o indicador de carregamento enquanto isso.
- Dado que duas tentativas de carregamento se sobrepõem (ex.: toque duplo em "Tentar
  novamente"), então só o resultado da tentativa mais recente é exibido — nenhuma condição de
  corrida mostra dados de uma tentativa obsoleta.

## Requisitos

- FR-001: o sistema deve carregar o catálogo automaticamente ao montar a Home, sem exigir ação
  do usuário.
- FR-002: o sistema deve expor três estados mutuamente exclusivos — carregando, erro, e
  sucesso (lista populada ou vazia) — nunca dois ao mesmo tempo.
- FR-003: o sistema deve sanitizar mensagens de erro não reconhecidas (erros fora do domínio)
  para uma mensagem genérica segura, sem expor stack trace ou detalhe interno.
- FR-004: o sistema deve cancelar o efeito de uma requisição de recarregamento obsoleta quando
  uma nova é disparada antes da anterior terminar (proteção contra condição de corrida).
- FR-005: cada item da lista deve exibir a modalidade do anúncio como texto por extenso
  acompanhando a cor (nunca só a cor), conforme `design-system/04-componentes/tag.md`.
- FR-006: o catálogo deve ser visível sem sessão autenticada — carregar o catálogo não deve
  exigir login.

## Critérios de sucesso

- SC-001: uma pessoa consegue abrir o app e ver a lista de livros (ou o estado vazio, se não
  houver nenhum) sem nenhuma ação adicional.
- SC-002: ao simular uma falha de carregamento, a pessoa vê uma mensagem de erro e consegue se
  recuperar tocando em "Tentar novamente", verificado por teste automatizado.
- SC-003: `npm run validate` passa com os testes de `tests/components/homeView.test.tsx`,
  `tests/components-mocked/homeViewMocked.test.tsx`, `tests/hooks/useHomeViewModel.test.tsx` e
  `tests/integration/homeIntegration.test.tsx` cobrindo os cenários acima — sem regressão.

## Casos de erro e suposições

- Suposição: a ordem de exibição dos livros é a ordem de retorno do datasource em memória
  (ordem de criação); não há critério de ordenação definido por este documento.
- Suposição: "catálogo visível sem sessão" é consistente com a decisão de produto de que
  qualquer visitante pode navegar e só precisa de conta para agir (anunciar/negociar) — ver
  `docs/produto.md`.
- Risco: como a persistência é em memória, o catálogo começa vazio a cada execução nova do
  app — aceitável para o estágio atual, mas deve ficar explícito para quem for demonstrar.
- Não presumir paginação ou volume de dados real — o catálogo hoje só tem os anúncios criados
  na própria execução (sem dados de exemplo pré-carregados).
