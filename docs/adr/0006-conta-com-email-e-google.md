# 0006 — Haverá conta: e-mail/senha e login com Google

Data: 2026-10-13. Status: aceito.

## Contexto

`docs/produto.md` listava como pendente se haveria conta de usuário e quais dados seriam
necessários — decisão que afeta acesso, privacidade e recuperação de dados, e é pré-requisito
para qualquer persistência real (hoje o Ipebook só tem dados em memória).

O projeto irmão da equipe (`/home/usermicael/Projetos/IpeBook`) já implementa e valida em
produção uma estratégia de autenticação via Supabase (ADR 0006 de lá) com e-mail e login Google
(ADR 0028 de lá).

## Decisão

1. O Ipebook terá conta de usuário. Sem conta, não é possível anunciar livro nem negociar —
   apenas visualizar o catálogo (como hoje).
2. Dados mínimos de conta: nome e e-mail.
3. Métodos de acesso: e-mail (com senha ou código) e login com Google — mesma estratégia já
   validada no projeto irmão.
4. A tecnologia concreta de autenticação/persistência (Supabase ou outra) **não é decidida por
   este ADR** — fica para a especificação técnica da primeira jornada funcional, que deve
   escolher com base nos requisitos, não presumir aqui.

## Alternativas consideradas

- **Sem conta** (anúncios anônimos): rejeitada — inviabiliza negociação segura e rastreamento
  de reputação, que fazem parte do problema que o Ipebook resolve (ver ADR de modalidade,
  0005).
- **Apenas e-mail, sem Google**: considerada, mas rejeitada por aumentar atrito de cadastro sem
  benefício claro, já que o projeto irmão validou que oferecer Google reduz abandono no
  onboarding.

## Consequências

- `docs/produto.md` deixa de listar conta/autenticação como decisão pendente.
- A especificação da primeira jornada funcional (Tarefa 8) deve incluir autenticação como
  pré-requisito do fluxo de cadastro de livro.
- Nenhuma implementação de autenticação é autorizada por este ADR sozinho — ele registra a
  decisão de produto, não libera a escolha de tecnologia nem o início do código.

Vínculos: [docs/produto.md](../produto.md), [ADR 0005](0005-modalidade-venda-troca-doacao.md).
