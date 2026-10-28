# Spec 107 — Correções da auditoria de segurança

- Data: 2026-10-28
- Tipo: correção
- ADR: [0083](../../docs/adr/0083-correcoes-auditoria-seguranca.md)
- Origem: auditoria com a skill `security-audit` (relatório fora do repositório, `~/security-audit-skill/ipebook/run-1/REPORT.md`)

## Objetivo
Fechar as falhas confirmadas na auditoria sem mudar o fluxo normal do app.

## Critérios de aceite e testes
| # | Critério | Teste |
|---|---|---|
| 1 | Link com tokens na query é recusado; link com tokens não troca a conta de quem já está logado (login forçado) | `tests/unit/supabaseAuthDataSource.test.ts` |
| 2 | Conta suspensa não propõe/altera encontro, não avalia, não denuncia, não edita perfil, não aceita pedido | `npm run test:sql` (denúncias e perfil); encontros, avaliação e aceite cobertos pelas políticas/gatilho da migração |
| 3 | Conta suspensa não se exclui pelo app (impede apagar a suspensão e recadastrar) | `npm run test:sql` |
| 4 | Ninguém consulta se outra pessoa está suspensa | `npm run test:sql` |
| 5 | Excluir a conta apaga as fotos da pessoa no storage antes da RPC | `tests/unit/supabaseAuthDataSource.test.ts` |
| 6 | `photo_url` de perfil e livro só aceita `https://` | `npm run test:sql` |

## Fora do escopo e limitações
- Pessoa sem sessão ainda pode ser levada a entrar na conta de outra por link (tokens no `#`); o fluxo de confirmação de e-mail depende disso. Remover de vez exige migrar para PKCE.
- Fotos de anúncios removidos pela moderação continuam no bucket (a moderação não tem permissão na pasta da pessoa).
- Entregas já combinadas podem ser concluídas por conta suspensa, para não prejudicar a outra parte.
- Exigir que a função `enviar-push` tenha `verify_jwt` e conferir a lista de redirect do Auth ficam no painel do Supabase.
