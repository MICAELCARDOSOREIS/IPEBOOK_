# Especificação 106 — Login Google nativo no Android

Status: implementada e testada localmente. Cliente Android (SHA-1 do EAS) criado no Firebase em 2026-10-29 e `.env` local configurado; **pendente criar as variáveis no EAS e gerar build nova**. ADR: [0082](../../docs/adr/0082-login-google-nativo.md).

## Objetivo
"Continuar com Google" abre o seletor de contas do próprio Android, sem sair do app para o navegador.

## Regras
- **RN-01** No Android/iOS, com `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, o app usa `@react-native-google-signin/google-signin`, obtém o `idToken` e cria a sessão com `supabase.auth.signInWithIdToken`.
- **RN-02** Sem o ID do cliente, ou na Web, continua o fluxo atual pelo navegador (Spec 085).
- **RN-03** Cancelar mostra "Login com Google cancelado."; Play Services ausente ou login em andamento têm mensagem própria.
- **RN-04** Sair do app também sai da conta Google no aparelho, para o seletor aparecer de novo.

## Como ligar (uma vez)
1. **Google Cloud > Credenciais:** usar o cliente OAuth "Aplicativo da Web" que o Supabase já usa no provedor Google; copiar o ID para `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (`.env` e `eas env:create`).
2. **Google Cloud:** criar cliente OAuth "Android" com o pacote `com.ipebook.app` e o SHA-1 da chave de assinatura (`eas credentials -p android`). Depois de publicar na Play Store, criar outro com o SHA-1 da "Assinatura de apps do Google Play".
3. **Supabase > Authentication > Providers > Google:** conferir que o ID do cliente web está em "Client IDs".
4. **EAS:** o `google-services.json` é ignorado pelo Git e não sobe na build; `app.config.js` lê a variável de arquivo `GOOGLE_SERVICES_JSON`. Criar com `eas env:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment <ambiente> --visibility secret`.
5. Gerar build nova (`eas build -p android --profile preview` ou `production`); não funciona no Expo Go.

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | RN-01 e RN-02 | `tests/unit/googleNativeSignInService.test.ts` |
| CA2 | RN-03 e RN-04 | `tests/unit/googleNativeSignInService.test.ts` |
| CA3 | Build web continua (fluxo pelo navegador) | `npm run build:web` |
| CA4 | Seletor nativo no aparelho | Manual, depois dos passos acima (pendente) |
