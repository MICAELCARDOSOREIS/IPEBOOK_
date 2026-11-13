# Issue #217 — [IHC/Design System] Migrar telas de autenticação para ScreenContainer e aprimorar foco e erros

* **Responsável:** Maria Clara Almeida Martins ([@clarinhamartins](https://github.com/clarinhamartins))
* **Labels:** `pessoa:maria-clara`, `accessibility`, `enhancement`
* **Branch base:** `develop`
* **Branch de trabalho:** `feature/217-migrar-telas-autenticacao-screen-container`
* **Especificação:** [Spec 133](spec.md)
* **ADR:** [ADR 0106](../../docs/adr/0106-migracao-telas-autenticacao-screen-container-e-ihc.md)

---

## 📌 Descrição

As telas da trilha de autenticação e acesso (`src/view/auth/`) ainda utilizam o encapsulamento manual com `SafeAreaView` e `ScrollView`, gerando inconsistências sutis de respiro lateral, centralização na Web e duplicação de boilerplate de layout. 

Após o sucesso da migração das telas de busca na Issue #215, esta issue visa migrar as 6 telas de autenticação para o `ScreenContainer maxWidth={560}` e implementar refinamentos essenciais de IHC e acessibilidade digital (WCAG 2.1 AA / TalkBack).

---

## 🎯 Escopo e Arquivos-Alvo

1. `src/view/auth/signIn.tsx` — migrar para `ScreenContainer maxWidth={560}`, encadear foco de e-mail para senha via `ref` e adotar `InlineErrorCard`.
2. `src/view/auth/signUp.tsx` — migrar para `ScreenContainer maxWidth={560}`, encadear foco consecutivo (`Nome -> E-mail -> Senha`) e adotar `InlineErrorCard`.
3. `src/view/auth/forgotPassword.tsx` — migrar para `ScreenContainer maxWidth={560}`.
4. `src/view/auth/resetPassword.tsx` — migrar para `ScreenContainer maxWidth={560}`.
5. `src/view/auth/deleteAccount.tsx` — migrar retornos condicionais para `ScreenContainer maxWidth={560}`.
6. `src/view/auth/authCallback.tsx` — migrar para `ScreenContainer maxWidth={560}`.

---

## ✅ Critérios de Aceite

- [ ] Nenhuma tela em `src/view/auth/` importa diretamente `SafeAreaView` da biblioteca `react-native-safe-area-context` para o contêiner raiz (usar exclusivamente `ScreenContainer`).
- [ ] A largura máxima de formulário permanece padronizada em `maxWidth={560}` com `space-4` (16 dp) de padding lateral.
- [ ] O encadeamento de foco do teclado virtual avança automaticamente entre campos ao pressionar "Avançar" (`returnKeyType="next"`).
- [ ] As mensagens de erro em formulários utilizam o componente `InlineErrorCard` (ADR 0102) com `accessibilityRole="alert"`.
- [ ] `npm run typecheck`, `npm run check:architecture` e `npm run test` são executados com sucesso (100% verde).

---

## 🧪 Como Validar

```bash
# Verificar tipagem TypeScript estrita
npm run typecheck

# Validar conformidade arquitetural (7 camadas MVVM)
npm run check:architecture

# Executar suite de testes unitários e de componente
npm run test

# Validação completa do pipeline
npm run validate
```
