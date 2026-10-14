# Tarefa 23 (Maria Clara) — Implementar autenticação da spec 003

Responsável: Maria Clara Almeida Martins
Depende de: —
Bloqueia: Tarefa 24 (Antonio) na parte conjunta (T013, T015-T017)
Domínio: Autenticação e Experiência Inicial (mesma divisão do projeto irmão)

## Contexto

[specs/003-autenticacao-e-cadastro-de-anuncio/](../../specs/003-autenticacao-e-cadastro-de-anuncio/)
já está especificada (spec.md, plan.md, tasks.md). As tarefas de autenticação (criar conta,
entrar, sair) são suas: T001 (parte), T002 (parte), T003, T004, T009, T011, T014 (rotas de
entrar/criar-conta), conforme marcado em `tasks.md`.

Para as telas (T011), seguir [`design-system/README.md`](../../design-system/README.md) — tem o
guia de voz, cor, tipografia (`01-principios.md`, `03-fundamentos.md`) e os componentes
[Campo de texto](../../design-system/04-componentes/campo-de-texto.md),
[Botão](../../design-system/04-componentes/botao.md) e
[Logotipo](../../design-system/04-componentes/logotipo.md) de referência (`design-kit/` foi
substituído por `design-system/`, ver [ADR 0010](../../docs/adr/0010-design-system-substitui-design-kit.md)).

## O que fazer

Seguir `specs/003-autenticacao-e-cadastro-de-anuncio/plan.md` e as tarefas marcadas como
**Maria Clara** em `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md`, na ordem: modelo →
caso de uso → infraestrutura → ViewModel → View → rota. Escrever teste antes ou junto de cada
unidade de código (TDD), seguindo o padrão já usado em `tests/unit/` e `tests/hooks/`.

Combinar com o Antonio antes de mexer em `src/view/home.tsx` (T013) e `src/di/container.ts`
(T008) — são arquivos compartilhados.

## O que não fazer

- Não implementar login com Google — está fora do escopo da spec 003 (ver "Fora do escopo" em
  `spec.md`).
- Não mexer no cadastro de anúncio (parte do Antonio, exceto modelo da issue #26) além do necessário para a sessão funcionar.

## Entregável

Tarefas T001 (parte), T002 (parte), T003, T004, T009, T011 e T014 (rotas de autenticação) de
`specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md` marcadas como concluídas, com testes
passando.

---

## Registro de execução

- Data: 2026-10-14 (conferência dos commits `7656e45`, `9c2d3f4` e `532daf5`).
- O que foi implementado: modelo, validação, casos de uso, datasource, ViewModel, telas e rotas
  de autenticação; indicador de sessão na Home. Documentação da trilha atualizada no commit
  `532daf5`.
- Testes executados e resultado: 75 testes passaram na conferência local do estado atual;
  `npm run validate` falhou no `typecheck` com TS2345 nas rotas de autenticação. Ver
  [docs/estado.md](../../docs/estado.md). Não há registro de validação completa aprovada após
  essa falha.
- Pendências: corrigir os tipos locais das rotas e validar o fluxo real; concluir a parte
  conjunta da spec 003 após o cadastro de anúncios.
