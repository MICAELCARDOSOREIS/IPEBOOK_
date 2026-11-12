# 0071 — Push de avisos por Edge Function do Supabase

Data: 2026-10-28. Status: aceito. Especificação: [096](../../specs/096-notificacoes-push-reais/spec.md).

## Contexto
Os avisos de encontro e entrega só existem em `v2_notifications`, visíveis com o app aberto. O app já tem `push_token` nas preferências e o serviço de push, mas nada o registra nem envia.

## Decisão
- O app grava o token do Expo depois do login e abre a rota do aviso ao toque.
- Um gatilho `AFTER INSERT` em `v2_notifications` chama, por `pg_net`, a Edge Function `enviar-push` com o `id` do aviso.
- A função relê o aviso com a chave de serviço (que não sai do servidor), reivindica `pushed_at` de forma atômica, envia pelo serviço do Expo e apaga o token se vier `DeviceNotRegistered`.
- URL e chave pública da função ficam na tabela `v2_push_settings` (sem política: o app não a lê), preenchida uma vez por ambiente. Sem a linha, o gatilho não faz nada.
- A lógica de montar a mensagem fica em `logic.ts`, puro e testado com o Vitest; `index.ts` só liga Deno, banco e HTTP.

## Alternativas consideradas
- Database Webhook configurado no painel: não versiona a configuração.
- Chave ou URL fixas na migração: variam por ambiente e a chave não é segredo versionável.
- O app chamar a função depois de cada ação: perde avisos criados pelos gatilhos e depende do cliente.
- Firebase Cloud Messaging direto: exige código por plataforma; o Expo já abstrai Android e iOS.

## Consequências
- Exige credencial FCM no EAS e uma nova build; sem isso o token não é obtido no Android.
- A função recebe o `id` e confere tudo no banco, então quem a chamar com um `id` alheio não envia nada novo (o aviso já foi reivindicado ou não existe).
- Falha do envio não desfaz a ação do usuário (RN-05), mas o aviso fica sem push; há `pushed_at` para auditar.
