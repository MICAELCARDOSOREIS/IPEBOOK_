# Especificação 103 — Limites contra abuso

Status: implementada e testada localmente; migração `202610290002_limites_anti_abuso.sql` aguardando aplicação no Supabase remoto. ADR: [0079](../../docs/adr/0079-limites-anti-abuso.md).

## Objetivo
Conter spam e abuso por conta logada sem atrapalhar o uso normal, com mensagem clara quando o limite é atingido.

## Regras de negócio
| Ação | Limite por pessoa |
|---|---|
| Anúncios criados | 15 em 24 horas |
| Pedidos ("Tenho interesse") | 10 em 24 horas |
| Mensagens no chat | 30 em 5 minutos |
| Denúncias (anúncio + pessoa) | 10 em 24 horas |

- **RN-01** Ao passar do limite, o banco recusa com o código `IBLIM` e uma mensagem em português, que o app mostra como está.
- **RN-02** Scripts e o painel do Supabase (fora do papel `authenticated`) não são limitados.
- Fora do escopo: confirmação de e-mail obrigatória (configuração do Supabase Auth) e CAPTCHA.

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Cada limite recusa a ação seguinte com `IBLIM`, e o painel passa | Cenário SQL (`verificar-migracoes.mjs`, Spec 103) |
| CA2 | O app mostra a mensagem do limite; outros erros seguem genéricos | `tests/unit/supabaseErrors.test.ts` |
