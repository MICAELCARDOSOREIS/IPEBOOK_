# 0039 — Bloqueio de usuários e moderação interpessoal

Data: 2026-10-23. Status: aceito.

## Contexto

O ecossistema comunitário do Ipebook conecta pessoas reais em Piripiri para trocas e encontros presenciais. Para garantir a segurança e a tranquilidade dos participantes, o Figma prevê o fluxo de pessoas bloqueadas (`07.10` a `07.12`), permitindo que um usuário bloqueie outro membro em caso de desacordo, assédio ou comportamento inadequado, com a opção de rever e desbloquear a qualquer momento.

## Decisão

1. **Tabela de Relacionamento**: Criar a tabela `public.v2_blocked_users` com chave composta `(blocker_id, blocked_id)`, ambos referenciando `auth.users(id)` com `on delete cascade`.
2. **Restrições de Integridade**: Adicionar a restrição `check (blocker_id <> blocked_id)` impedindo o auto-bloqueio.
3. **Segurança e RLS**:
   - `SELECT`: Permitido exclusivamente onde `blocker_id = auth.uid()`.
   - `INSERT`: Permitido exclusivamente com `check (blocker_id = auth.uid())`.
   - `DELETE`: Permitido exclusivamente onde `blocker_id = auth.uid()`.
   - Nenhuma permissão de `UPDATE` (o bloqueio é binário: existe ou é excluído).
4. **Camada de Aplicação**:
   - Fornecer visão desacoplada de dados através de `IBlockedUserDataSource` e `BlockedUserUseCases`.
   - Integrar visualmente no hub de perfil através da rota `/perfil/bloqueados`, com confirmação via `Dialog` e conformidade com o tema escuro.

## Consequências

- **Positivas**: Usuários ganham controle imediato sobre sua segurança e privacidade, bloqueando contatos indesejados sem atrito.
- **Privacidade**: As listas de bloqueio são estritamente confidenciais; ninguém descobre quem o bloqueou por consulta direta ao banco.
