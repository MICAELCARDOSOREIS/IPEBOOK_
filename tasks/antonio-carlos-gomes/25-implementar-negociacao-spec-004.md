# Tarefa 25 (Antonio) — Especificar (feito) e implementar a negociação simples (spec 004)

Responsável: Antonio Carlos Gomes
Depende de: Tarefas 23 (Maria Clara) e 24 (Antonio) — a negociação funcional precisa de sessão
autenticada e de anúncios reais. O modelo T001/T002 foi iniciado antes dessa dependência.
Domínio: Negociação (mesma divisão do projeto irmão)

## Contexto

A especificação já foi escrita (por mim, como parte deste trabalho de organização) em
[specs/004-negociacao-simples/](../../specs/004-negociacao-simples/) — fecha o 4º e último item
do escopo do MVP decidido na Tarefa 3 ("solicitar e responder negociação simples"). Falta a
implementação, que é sua: solicitar negociação de um anúncio, ver pedidos recebidos, aceitar ou
recusar, com a regra de recusar automaticamente os demais pedidos pendentes ao aceitar um.

## O que fazer

Seguir `specs/004-negociacao-simples/plan.md` e as 14 tarefas de
`specs/004-negociacao-simples/tasks.md`, na ordem: modelo → caso de uso → infraestrutura → di →
ViewModel → View → rotas → teste de integração → documentação → validação.

**T003–T014 aguardam a spec 003 implementada** (Tarefas 23 e 24) — o fluxo funcional depende de
sessão autenticada (`sessionUserId`) e de anúncios reais cadastrados por usuários, não dos
dados de exemplo atuais. O modelo T001/T002 já foi entregue.

## O que não fazer

- Não implementar logística de encontro, conversa, contraproposta ou conclusão/entrega — fora
  do escopo desta spec (ver "Fora do escopo" em `spec.md`).
- Não adicionar segurança/moderação (denúncia, bloqueio) — fora do MVP decidido.

## Entregável

Spec 004 100% concluída em `tasks.md` (14 tarefas), com `npm run validate` passando e evidências
em `specs/004-negociacao-simples/validacao.md`.

---

## Registro de execução

- Data: 2026-10-14 (conferência do commit `e8d9e6a`).
- O que foi implementado: `BookRequest`, `RequestStatus`, `Book.status` e
  `IBookRequestDataSource` (T001/T002); issue #30 fechada. Nenhum fluxo de negociação foi
  implementado.
- Testes executados e resultado: `tests/unit/bookRequest.test.ts` existe e a suíte de 75 testes
  passou na conferência local; `npm run validate` parou no `typecheck` por erros das rotas de
  autenticação, sem executar as etapas seguintes nessa chamada.
- Pendências: T003–T014 após a spec 003; validar a negociação integrada e registrar as
  evidências em `specs/004-negociacao-simples/validacao.md`.
