# 0082 — Login Google nativo com idToken no Supabase

- Data: 2026-10-29
- Status: aceito
- Especificação: [106](../../specs/106-login-google-nativo/spec.md)

## Contexto
O login com Google no Android abria uma aba do navegador (Spec 085), mais lenta e sujeita a falhas de retorno ao app.

## Decisão
Usar `@react-native-google-signin/google-signin` (versão indicada pelo Expo) para o seletor nativo e trocar o `idToken` por sessão com `signInWithIdToken`, conforme a documentação do Supabase. O SDK fica atrás de `INativeGoogleSignIn`; sem `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, o fluxo pelo navegador continua como reserva.

## Alternativas consideradas
- Manter o navegador: funciona, mas com experiência pior.
- Credential Manager via módulo próprio: mais código nativo para manter.

## Consequências
- Exige cliente OAuth Android com o SHA-1 de cada chave de assinatura (EAS e Play).
- Mais uma dependência nativa: só vale em build nova, não no Expo Go.
