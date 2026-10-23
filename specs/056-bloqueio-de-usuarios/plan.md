# Plano de Implementação — Spec 056 (Bloqueio de Usuários)

Decisão arquitetural registrada no [ADR 0039](../../docs/adr/0039-bloqueio-de-usuarios-e-moderacao.md).

## Estrutura em 7 Camadas (MVVM)

1. **Model**:
   - `src/model/entities/blockedUser.ts`: entidade `BlockedUser` (`userId`, `name`, `blockedAt`, `photoUrl`).
   - `src/model/datasources/iBlockedUserDataSource.ts`: contrato `IBlockedUserDataSource` com `listBlocked`, `block`, `unblock` e `isBlocked`.
2. **Infra**:
   - `src/infra/datasources/memoryBlockedUserDataSource.ts`: implementação em memória para testes e modo offline.
   - `src/infra/datasources/supabaseBlockedUserDataSource.ts`: integração com `v2_blocked_users` no Supabase com mapeamento de perfis.
3. **UseCase**:
   - `src/usecase/iBlockedUserUseCases.ts` e `src/usecase/blockedUserUseCases.ts`: regras de validação (sessão obrigatória, não bloquear a si próprio, idempotência).
4. **DI**:
   - `src/di/container.ts`: injeção condicional (memória vs Supabase) e exportação de `blockedUserUseCases`.
5. **ViewModel**:
   - `src/viewmodel/useBlockedUsersViewModel.ts`: hook de estado (`blockedUsers`, `loading`, `error`, `unblockingId`, `unblockUser`, `reload`).
6. **View**:
   - `src/view/profile/blockedUsers.tsx`: tela pura do Figma `07.10` a `07.12` com acessibilidade TalkBack, suporte ao tema escuro e diálogo de confirmação.
   - Atualização de `src/view/profile/profileHub.tsx` adicionando a opção no menu.
7. **App**:
   - `src/app/perfil/bloqueados.tsx`: rota com proteção de autenticação.
