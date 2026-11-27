# ADR 0121 — Login Apple e retorno nativo de recuperação

- **Data** 2026-11-26
- **Status** Aceito
- **Relacionados** [Spec 137](../../specs/137-ios-nativo-apple-hig/spec.md), [ADR 0117](0117-pkce-e-privacidade-do-cache-web.md)

## Contexto

O app iOS oferece login Google e precisa de uma opção equivalente que aceite e-mail privado. A recuperação de senha enviada pelo app também precisa retornar à instalação nativa. A recuperação iniciada na Web usa PKCE e precisa encontrar o verificador no navegador que iniciou o fluxo.

## Decisão

Usar o botão nativo de Sign in with Apple e entregar ao Supabase o token de identidade e o nonce original. Apresentar ao usuário as instruções de revogação manual depois da exclusão da conta no iOS enquanto o projeto não armazena credenciais Apple para revogação automática.

Associar `ipebook.app` ao app iOS exclusivamente para `/redefinir-senha?origem=ios`. Gerar o arquivo de associação no build do Pages usando `APPLE_TEAM_ID`. A URL Web sem marcador continua no navegador. O link HTTPS também oferece o formulário Web a quem não tiver o app instalado. Um esquema customizado foi descartado para o retorno de recuperação porque não comprova a associação do app com o domínio.

Usar fingerprint para a versão de runtime do iOS porque o login Apple e os entitlements exigem um novo binário. A build Android continua com a política global.

## Consequências

O TestFlight depende de assinatura, habilitação do provedor Apple e APNs. O link universal depende do arquivo de associação servido no domínio, da URL permitida no Supabase e da instalação de uma build com o entitlement. O fluxo requer teste no Mail, no Safari e em uma instalação assinada.

- [Login Apple no Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple)
- [Domínios associados no iOS](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- [Exclusão de contas com Sign in with Apple](https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple)
