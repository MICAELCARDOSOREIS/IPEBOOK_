# Validação — Spec 036

Em 2026-10-21, no worktree `worktree-telas-gerenciar-alerta`:

- `npm run validate`: passou; 779 testes em 114 arquivos, tipos, arquitetura e 17 migrações no PGlite. Cobertura geral: 90,75% de statements, 83,10% de branches, 87,52% de funções e 92,10% de linhas.
- `npm run verify:release`: passou; compilação Web gerou 28 rotas estáticas, incluindo `/alertas/[id]` e `/alertas/[id]/editar`.
- Android via Expo Go e ADB: `/alertas` sem sessão abriu e foi conferida visualmente. O aparelho se desconectou antes da conferência autenticada no Android.
- Web local em 390 × 844, via Chromium/CDP e sessão temporária no backend em memória: criação do alerta, abertura de `/alertas/[id]`, pausa, abertura de `/alertas/[id]/editar`, recusa da seleção vazia, salvamento de `Iracema` com apenas `Venda` e exclusão confirmada com retorno à lista vazia. As telas de gerenciamento e edição foram conferidas por captura visual; a sessão temporária foi removida ao fim do teste.
- Migração remota Supabase: não aplicada. `supabase migration list` retornou `AccessTokenRequiredError`; aguardar login do usuário na CLI, conferir o histórico e só então aplicar.

O teste SQL confirma o padrão de três modalidades para alertas existentes, recusa array vazio e valores inválidos, e verifica notificações apenas para modalidades selecionadas. O teste em memória cobre o mesmo filtro.
