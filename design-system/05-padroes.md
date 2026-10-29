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
