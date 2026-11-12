# Especificação 096 — Notificações push reais (fora do app)

Status: implementada e testada localmente; depende de configuração externa (Firebase/EAS, função e migração no Supabase). ADR: [0071](../../docs/adr/0071-push-de-avisos-por-edge-function.md).

## Objetivo
Convites, respostas de encontro e entrega confirmada já viram um aviso dentro do app (`v2_notifications`). Esta especificação faz o mesmo aviso chegar ao celular com o app fechado, e abrir a negociação ao tocar.

## Escopo
- App: depois do login, pedir permissão, obter o token do Expo e gravá-lo em `v2_user_preferences.push_token`; ao tocar na notificação, abrir a rota do aviso (`action_url`).
- Servidor: ao inserir em `v2_notifications`, um gatilho chama a Edge Function `enviar-push`, que envia pelo serviço do Expo ao token da pessoa.
- Fora do escopo: preferências por tipo de aviso (não existem hoje), push para web, agrupamento de avisos seguidos.

## Regras de negócio
- **RN-01** O token é privado do titular (RLS existente) e é gravado só com a permissão do sistema concedida.
- **RN-02** Um token pertence a uma pessoa: ao gravá-lo, ele é retirado de qualquer outra conta que o tenha (aparelho compartilhado ou troca de login).
- **RN-03** Cada aviso é enviado no máximo uma vez (`pushed_at`, reivindicado de forma atômica).
- **RN-04** Token recusado pelo Expo como `DeviceNotRegistered` é apagado.
- **RN-05** Falha de envio nunca impede criar o aviso nem a ação que o gerou.
- **RN-06** A chave de serviço fica só no servidor; o gatilho carrega URL e chave pública de uma tabela sem acesso do app.

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Depois do login o token é obtido e gravado uma só vez | teste do ViewModel |
| CA2 | Sem permissão ou sem token, nada é gravado e nada quebra | teste do ViewModel |
| CA3 | Tocar na notificação abre a rota do aviso | teste do ViewModel |
| CA4 | Token repetido sai da outra conta | cenário SQL (PGlite) |
| CA5 | A mensagem enviada tem título, texto e rota do aviso | teste da lógica da função |
| CA6 | Token inválido é reconhecido e apagado | teste da lógica da função |
| CA7 | O gatilho não falha sem configuração nem sem `pg_net` | cenário SQL (PGlite) |

## Pré-requisitos externos (não resolvidos pelo código)
1. Android: projeto no Firebase, `google-services.json` no app e a chave FCM v1 enviada ao EAS; nova build com o cliente de desenvolvimento.
2. Publicar a função: `supabase functions deploy enviar-push`.
3. Aplicar a migração `202610280003_push_de_avisos.sql` e preencher uma vez `v2_push_settings` (URL da função e chave pública).
