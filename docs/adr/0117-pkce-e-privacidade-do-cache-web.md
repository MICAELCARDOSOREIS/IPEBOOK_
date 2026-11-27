# 0117. PKCE e privacidade do cache web

- **Status:** Aceito
- **Data:** 2026-11-18
- **Decisões relacionadas:** ADR 0035 (PWA), ADR 0101 (cache local)
- **Especificações vinculadas:** [PWA](../../specs/041-pwa-service-worker-cache-offline/spec.md)

## Contexto

O retorno web de autenticação aceitava uma sessão por tokens recebidos na URL. O cache local da estante podia persistir rascunhos privados. O service worker usava o nome antigo da tabela do catálogo.

## Decisão

Usar o fluxo PKCE do Supabase no navegador e aceitar somente o código no retorno de login web. Excluir do cache as navegações de retorno da autenticação e de recuperação de senha. Preservar o retorno nativo e a compatibilidade com links de recuperação já emitidos. Descartar o cache legado da estante e persistir somente itens publicados. Limitar o cache HTTP a consultas anônimas do catálogo que excluam rascunhos. Em falha sem cache HTTP utilizável, devolver erro para que o aplicativo possa usar seu cache local.

## Consequências

Links web emitidos com PKCE exigem o navegador que iniciou a operação. O cache da estante é reconstruído na próxima consulta online. Consultas autenticadas ao catálogo continuam com o fallback do aplicativo. A validação local cobre a seleção das requisições, a privacidade do cache e os caminhos de código da autenticação. A integração com o provedor real exige validação no ambiente de destino.

[Documentação do fluxo PKCE do Supabase](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
