# Padrões

Fluxos do app, derivados das histórias de usuário de
[`specs/003-autenticacao-e-cadastro-de-anuncio/spec.md`](../specs/003-autenticacao-e-cadastro-de-anuncio/spec.md).

## Padrão 1: Entrar / Criar conta

- **Objetivo do usuário:** acessar o app para anunciar, buscar ou negociar livros.
- **Componentes usados:** [Campo de texto](04-componentes/campo-de-texto.md),
  [Botão](04-componentes/botao.md) (filled "Entrar", text "Criar conta").
- **Passos:**
  1. Pessoa abre o app e vê a tela de entrar (e-mail e senha) com título na serifa da marca.
  2. Preenche e-mail e senha, toca "Entrar".
  3. Se não tem conta, toca "Criar conta" e preenche um formulário equivalente.
- **Estados que precisam de tela:**

| Situação | O que o usuário vê | Componentes e tokens |
| --- | --- | --- |
| Carregando | Botão "Entrar" com indicador de progresso, desabilitado | `button.bg-disabled` |
| Erro | Mensagem no campo ("Use um e-mail como nome@exemplo.com") ou erro geral de credencial abaixo do botão | `error`, `errorContainer` |
| Vazio | Não se aplica (campos começam vazios, sem estado vazio dedicado) | — |
| Sucesso | Navega para Início, barra de navegação aparece | `NavigationBar` |

- **Faça:** manter a sessão até logout explícito (US3); redirecionar para Entrar quando uma
  ação exigir conta (US2, "Cadastrar anúncio de livro" sem sessão).
- **Evite:** mostrar erro de senha incorreta apontando se foi o e-mail ou a senha que errou
  (risco de enumeração de contas).

## Padrão 2: Anunciar livro (US2)

- **Objetivo do usuário:** publicar um livro para vender, trocar ou doar.
- **Componentes usados:** [Indicador de etapas](04-componentes/indicador-de-etapas.md) (3
  etapas), [Campo de texto](04-componentes/campo-de-texto.md), [Botão](04-componentes/botao.md),
  [Capa ilustrativa](04-componentes/capa-ilustrativa.md) (prévia quando sem foto), Tag (prévia
  da modalidade escolhida).
- **Passos:**
  1. Etapa 1 — dados do livro (título, autor, modalidade).
  2. Etapa 2 — fotos e condições (ou capa ilustrativa automática se não houver foto).
  3. Etapa 3 — revisão e publicar.
- **Estados que precisam de tela:**

| Situação | O que o usuário vê | Componentes e tokens |
| --- | --- | --- |
| Carregando | Botão "Publicar anúncio" com indicador, desabilitado | `button.bg-disabled` |
| Erro | Campo obrigatório vazio marcado em `error` ao tentar avançar de etapa | `error` |
| Vazio | Sem foto enviada → capa ilustrativa gerada automaticamente na prévia | `cover.*` |
| Sucesso | Snackbar "Anúncio publicado", navega para a Estante | `Snackbar`, `inverse-surface` |

- **Faça:** se a pessoa não estiver logada ao tentar anunciar, redirecionar para Entrar sem
  perder o que já preencheu (ver caso de erro em spec 003, US2).
- **Evite:** bloquear o avanço de etapa sem dizer qual campo falta.

## Padrão 3: Explorar e filtrar o catálogo

- **Objetivo do usuário:** encontrar um livro disponível em Piripiri, PI, combinando busca, filtros e
  ordenação sem perder a referência de quantos resultados existem.
- **Componentes usados:** [Campo de busca](04-componentes/campo-de-busca.md),
  [Chip](04-componentes/chip.md) (32 dp nas fileiras, 40 dp na tela de filtros),
  [Barra superior](04-componentes/barra-superior.md) (tela "Filtrar livros"),
  [Opção única](04-componentes/opcao-unica.md) (modalidade, categoria, conservação e preço),
  [Botão](04-componentes/botao.md) (filled "Mostrar N livros", text "Limpar filtros") e
  [Linha de livro](04-componentes/linha-de-livro.md).
- **Passos:**
  1. Explorar mostra busca, ícone de ajustes (com distintivo quando há filtros ativos) e uma única
     fileira de categorias — "Todos" + categorias do catálogo carregado.
  2. Tocar no ícone abre **"Filtrar livros"** (`02.03`) com modalidade, categoria, conservação, preço e
     ordenação. As escolhas ficam em rascunho e o botão principal recalculado ("Mostrar 3 livros").
  3. "Mostrar N livros" aplica o conjunto e volta ao Explorar; voltar pela barra superior descarta.
  4. Os filtros aplicados viram chips removíveis (`02.04`) abaixo do resumo "3 livros à venda · Bom
     estado"; a categoria não se repete ali porque já aparece marcada na fileira de cima.
  5. A ordenação fica no resumo ("Mais recentes") e abre a folha **"Ordenar por"**.
- **Estados que precisam de tela:**

| Situação | O que o usuário vê | Componentes e tokens |
| --- | --- | --- |
| Carregando | Esqueleto ou indicador no lugar da lista, busca e ajustes ativos | `Estado do sistema` |
| Erro | Mensagem com ação de tentar novamente, filtros preservados | `error`, `errorContainer` |
| Vazio (filtros) | "Nenhum livro corresponde aos filtros selecionados." + "Limpar filtros e buscar novamente" | [Estado vazio](04-componentes/estado-vazio.md) |
| Vazio (termo) | "Nenhum livro encontrado para 'termo'. Tente outro título, autor ou categoria." | `Estado vazio` |
| Vazio (catálogo) | "Ainda não há livros no catálogo." | `Estado vazio` |
| Sucesso | Lista filtrada com resumo à esquerda e ordenação à direita | `secondaryContainer`, `onSurfaceVariant` |

- **Faça:** contar os resultados no próprio botão de aplicar, para a pessoa saber o efeito do filtro
  antes de voltar à lista; manter `resetFilters` separado de `clearFilters` — limpar filtros preserva o
  termo e o bairro, reiniciar a busca apaga tudo.
- **Evite:** filtrar a lista a cada toque dentro da tela de filtros (a lista pisca e pode esvaziar no meio
  da escolha), usar categorias fixas que não existem no catálogo e contar a ordenação como filtro ativo.
