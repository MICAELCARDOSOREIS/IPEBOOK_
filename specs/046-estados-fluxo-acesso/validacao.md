# Validação: Estados do fluxo de acesso (Spec 046 / Issue #97)

Data: 2026-10-21.

## O que foi implementado

- `src/model/errors.ts`: `EmailAlreadyRegisteredError` e `ExpiredLinkError` (ambos `extends
  AuthError`, compatíveis com código existente que captura `AuthError`/`DomainError`).
- `src/infra/datasources/memoryAuthDataSource.ts`: `signUp` lança `EmailAlreadyRegisteredError`.
- `src/infra/datasources/supabaseAuthDataSource.ts`:
  - `signUp` detecta `data.user.identities?.length === 0` (sinal do Supabase para "e-mail já
    cadastrado e confirmado, nenhuma conta nova criada") e lança `EmailAlreadyRegisteredError`
    em vez de retornar como sucesso.
  - `completePasswordReset` lança `ExpiredLinkError` em todos os caminhos de link ausente,
    código inválido, tokens inválidos ou sessão não criada; corrigido também um bug em que o
    `catch` envolvente sempre criava um novo erro genérico, mascarando o tipo específico já
    lançado dentro do `try`.
- `src/viewmodel/useResetPasswordViewModel.ts`: novo campo `linkExpired: boolean`.
- `src/view/auth/resetPassword.tsx`: novo estado "Link expirado" (`IconBadge` de erro, mensagem,
  botão "Solicitar novo link"); nova prop `onNavigateToForgotPassword`.
- `src/app/redefinir-senha.tsx`: passa `onNavigateToForgotPassword={() =>
  router.replace("/esqueci-senha")}`.

## Validação executada

- `npm run typecheck`: limpo.
- `npm run check:architecture`: 209 arquivos verificados, sem violações de camada.
- `npm run test:sql`: sem regressão (esta entrega não altera migrações).
- `npm run test:coverage`: **749 testes passando em 110 arquivos** (após sincronizar com
  `develop`, que avançou com outras entregas em paralelo), cobertura acima de 80% nas 4
  dimensões (Statements 90,07%, Branches 82,89%, Functions 86,92%, Lines 91,51%).
- `npm run build:web`: build concluído.

## Testes novos/alterados

- `tests/unit/supabaseAuthDataSource.test.ts` (novo): cadastro com e-mail novo, cadastro com
  e-mail já cadastrado e confirmado (`EmailAlreadyRegisteredError`), erro genérico de cadastro,
  link de recuperação ausente/código inválido/sessão não criada (`ExpiredLinkError`), e
  atualização de senha com sucesso.
- `tests/hooks/useResetPasswordViewModel.test.tsx`: novo caso para `linkExpired: true` quando o
  erro é `ExpiredLinkError`; casos existentes ajustados para incluir `linkExpired: false`.
- `tests/components/resetPasswordView.test.tsx`: novo caso para o estado "Link expirado" e a
  navegação via "Solicitar novo link"; casos existentes ajustados para `linkExpired: false`.
- `tests/components/authViews.test.tsx`: já cobria a mensagem de e-mail já cadastrado na tela de
  cadastro (nenhuma mudança necessária ali — ver decisão de escopo em `tasks.md`).

## Limitações e pendências

- Verificação manual do retorno do link de recuperação expirado num dispositivo Android e num
  navegador Web real, com conta descartável, não foi feita nesta sessão — sem acesso a
  dispositivo físico, emulador, navegador ou provedor de e-mail neste ambiente. Fica como
  verificação manual recomendada antes da publicação (igual à decisão já registrada em
  `specs/021-estados-globais-de-carregamento-e-erro/validacao.md` para o estado offline).
- Os estados de confirmação de e-mail por link (`01.12`/`01.13`/`01.15`/`01.16`) ficam fora desta
  entrega — ver "Fora de escopo" em `spec.md`; recomenda-se abrir uma issue nova para eles.
