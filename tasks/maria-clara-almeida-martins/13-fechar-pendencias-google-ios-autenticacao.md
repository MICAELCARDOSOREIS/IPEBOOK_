# Backlog futuro — Login Google no provedor que o IPEBOOK_ escolher

> **Reformulada em 2026-10-14.** Esta tarefa era sobre `/home/usermicael/Projetos/IpeBook`,
> projeto que a equipe decidiu **não usar mais**. Fica aqui como lembrete para quando a
> autenticação do `IPEBOOK_` (spec 003, Tarefa 23) avançar além do e-mail/senha.

Responsável: Maria Clara Almeida Martins (quando a ideia for retomada)

## Ideia para depois da spec 003

A [spec 003](../../specs/003-autenticacao-e-cadastro-de-anuncio/spec.md) já decidiu deixar
login com Google **fora do escopo** desta primeira implementação (ver "Fora do escopo" em
`spec.md`) justamente para não acoplar a uma decisão de provedor de identidade externo antes de
haver backend real. Quando essa decisão for revisitada:

- Configurar o provedor Google no backend escolhido (nenhum foi decidido ainda — ver ADR 0006).
- Validar o login Google ponta a ponta.

Validação em iPhone não se aplica: plataformas decididas são Android e Web (Tarefa 4).

## O que não fazer agora

- Não implementar login Google antes de a spec 003 (e-mail/senha) estar pronta e validada.

---

## Registro de execução

Nenhum trabalho feito sob esta formulação (reformulada em 2026-10-14, antes de qualquer
execução).
