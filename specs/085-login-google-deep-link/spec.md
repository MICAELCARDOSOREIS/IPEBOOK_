# Spec 085 — Login com Google volta para o app (Expo Go e app instalado)

**Data:** 26 de outubro de 2026 · **Arquivo:** `src/infra/datasources/supabaseAuthDataSource.ts` · **Base:** ADR 0006.

## Problema (reproduzido no Galaxy A16, Expo Go)

Ao entrar com Google, o login abria no Chrome por `Linking.openURL` e terminava **no site, dentro do Chrome**;
o app nunca recebia a sessão. O código também devolvia um usuário "pending" logo após abrir o navegador, sem
esperar o retorno.

## Decisão

- **Nativo**: `signInWithOAuth` com `skipBrowserRedirect: true` e `redirectTo` = `Constants.experienceUrl` +
  `/--/auth/callback` no Expo Go (`exp://<ip>:8081/--/auth/callback`) e `ipebook://auth/callback` no app instalado.
  O `Linking.createURL` do SDK 58 devolvia `ipebook:///auth/callback` mesmo no Expo Go — esquema que o Expo Go
  não abre e, sem host, recusado pela lista do Supabase (confirmado no `dumpsys` do Android). Aberto por
  `WebBrowser.openAuthSessionAsync` (`expo-web-browser`, incluído no Expo Go) com `{ createTask: false }`:
  no Android, `createTask: true` (padrão) abre o navegador em uma nova tarefa, o que causa um ciclo de alternância
  de tarefas no Android e dispara um evento imediato de `active` no ciclo de vida (`AppState`) do app com launchMode
  `singleTask`, resolvendo a sessão como fechada em ~50 ms antes do navegador carregar. Com `{ createTask: false }`
  e aquecimento prévio (`warmUpAsync`), o Chrome Custom Tab abre diretamente na mesma tarefa da aplicação,
  mantendo o app em pausa até a conclusão do redirecionamento ou cancelamento real pelo usuário. A URL de retorno vai para
  `setSessionFromUrl`, que cria a sessão (tokens no fragmento ou código). Cancelar gera `AuthError` e é registrado no log em nível informativo (`info`).
- **Web**: inalterado — redireciona para `<origem>/auth/callback`, tratado pela rota existente.

## Pré-requisito externo

No Supabase (Authentication → URL Configuration → **Redirect URLs**) precisam constar `ipebook://**` e, para
desenvolvimento no Expo Go, `exp://**`. Sem isso o Supabase volta para o Site URL (o site) e o login termina
no navegador.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Nativo abre a sessão de autenticação com o deep link do ambiente e cria a sessão pelo retorno | teste unitário |
| CA2 | Cancelar não cria sessão e mostra erro | teste unitário |
| CA3 | Login real no Expo Go termina dentro do app | Galaxy A16 (pendente: depende da conta Google do usuário) |
