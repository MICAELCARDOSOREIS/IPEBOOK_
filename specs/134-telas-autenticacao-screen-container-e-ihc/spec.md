# Especificação 133 — Migração das Telas de Autenticação para ScreenContainer e Aprimoramento de IHC

**Estado:** Especificada em 2026-11-10  
**Responsável:** Maria Clara Almeida Martins (`pessoa:maria-clara`)  
**ADR:** [0106](../../docs/adr/0106-migracao-telas-autenticacao-screen-container-e-ihc.md)

## Objetivo e escopo

Migrar integralmente as telas da trilha de autenticação e acesso (`src/view/auth/`) para o componente unificado `ScreenContainer`, eliminando declarações manuais repetidas de `SafeAreaView`, `ScrollView` e larguras máximas soltas. Simultaneamente, elevar os padrões de Interação Humano-Computador (IHC) e acessibilidade (WCAG 2.1 AA) nesses fluxos, padronizando os erros de formulário com o `InlineErrorCard` e implementando transições automáticas de foco no teclado virtual entre campos consecutivos.

## Regras de negócio

- **RN-01 (Adoção do ScreenContainer em `src/view/auth/`):** As telas `signIn.tsx`, `signUp.tsx`, `forgotPassword.tsx`, `resetPassword.tsx`, `deleteAccount.tsx` e `authCallback.tsx` devem substituir o contêiner de raiz de página (`SafeAreaView` + `ScrollView` manual) pelo componente `ScreenContainer maxWidth={560}`, garantindo padding lateral de 16 dp (`space-4`), centralização responsiva na Web e fundo semântico `colors.surface`.
- **RN-02 (Eliminação de importações redundantes de layout):** Nenhuma das telas-alvo deve importar diretamente `SafeAreaView` da biblioteca `react-native-safe-area-context` para o container de página, delegando essa responsabilidade exclusivamente ao `ScreenContainer`.
- **RN-03 (Encadeamento de foco por teclado / IHC):**
  - Na tela de Criar Conta (`signUp.tsx`), ao pressionar "Avançar" (`returnKeyType="next"`) no campo Nome, o foco deve transicionar para o campo E-mail; no campo E-mail, ao pressionar "Avançar", o foco deve transicionar para Senha; no campo Senha, a tecla de retorno deve disparar o envio (`returnKeyType="done"` / `onSubmitEditing`).
  - Na tela de Entrar (`signIn.tsx`), ao pressionar "Avançar" no campo E-mail, o foco deve transicionar para o campo Senha.
- **RN-04 (Erros de formulário com InlineErrorCard):** Mensagens de falha de autenticação, e-mail já cadastrado, link expirado e erros de validação nas telas de autenticação devem utilizar o componente `InlineErrorCard`, garantindo contraste adequado nos modos claro e escuro e o atributo `accessibilityRole="alert"`.
- **RN-05 (Conformidade com testes e arquitetura):** Todos os testes unitários e de componente existentes e novos devem passar com sucesso (`npm run test`), mantendo o limite mínimo de 80% de cobertura e total conformidade com a arquitetura MVVM em 7 camadas (`npm run check:architecture`).

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Telas `signIn.tsx`, `signUp.tsx`, `forgotPassword.tsx`, `resetPassword.tsx` e `deleteAccount.tsx` utilizam `ScreenContainer maxWidth={560}`. | Verificação estática do código-fonte e ausência de `SafeAreaView` na raiz. |
| CA2 | Encadeamento de foco funcional entre campos de entrada de texto em `signUp.tsx` e `signIn.tsx`. | Teste de componente simulando `onSubmitEditing` e transição de foco. |
| CA3 | Erros de submissão apresentados via `InlineErrorCard` com anúncio acessível para TalkBack. | Renderização do `InlineErrorCard` na presença de erros no estado da ViewModel. |
| CA4 | Novos testes cobrindo a migração e ergonomia adicionados em `tests/components/authScreensContainer.test.tsx`. | `npm run test` verde. |
| CA5 | Pipeline `npm run validate` aprovado com 0 violações de tipos ou arquitetura. | `npm run validate` verde. |
