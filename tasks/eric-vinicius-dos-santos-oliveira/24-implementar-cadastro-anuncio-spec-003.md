# Tarefa 24 (Eric) — Implementar cadastro de anúncio da spec 003

Responsável: Eric Vinícius dos Santos Oliveira
Depende de: — (pode começar em paralelo com Maria Clara; T008/T013/T015-T017 são conjuntas)
Domínio: Gestão de Inventário/Anúncios (mesma divisão do projeto irmão)

## Contexto

[specs/003-autenticacao-e-cadastro-de-anuncio/](../../specs/003-autenticacao-e-cadastro-de-anuncio/)
já está especificada. As tarefas de cadastro de anúncio são suas: T001 (parte), T002 (parte),
T005, T006, T007, T008, T010, T012, T014 (rota de anunciar), conforme marcado em `tasks.md`.

Para a tela (T012), seguir [`design-system/README.md`](../../design-system/README.md) — tem os
componentes [Campo de texto](../../design-system/04-componentes/campo-de-texto.md),
[Chip](../../design-system/04-componentes/chip.md) (modalidade),
[Indicador de etapas](../../design-system/04-componentes/indicador-de-etapas.md) e
[Tag](../../design-system/04-componentes/tag.md) de referência, e a regra de que a cor nunca é o
único sinal da modalidade (tag sempre leva o nome) — `design-kit/` foi substituído por
`design-system/`, ver [ADR 0010](../../docs/adr/0010-design-system-substitui-design-kit.md).

## O que fazer

Seguir `specs/003-autenticacao-e-cadastro-de-anuncio/plan.md` e as tarefas marcadas como
**Eric** em `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md`. A extensão do `Book` com
`modality`/`price` (T001 parte) e a regra condicional de preço (T002 parte) são a base — fazer
primeiro, antes do caso de uso `createListing` (T005).

Combinar com a Maria Clara antes de mexer em `src/view/home.tsx` (T013) e
`src/di/container.ts` (T008).

## O que não fazer

- Não implementar autenticação (é da Maria Clara) — só consumir a sessão que ela expõe.
- Não incluir upload de foto, edição ou exclusão de anúncio — fora do escopo da spec 003.

## Entregável

Tarefas T001 (parte), T002 (parte), T005, T006, T007, T008, T010, T012 e T014 (rota de
anunciar) de `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md` marcadas como concluídas,
com testes passando.

---

## Registro de execução

- Data:
- O que foi implementado:
- Testes executados e resultado:
- Pendências:
