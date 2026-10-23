# 0038 — Leitura pública anônima de perfis comunitários e avaliações

Data: 2026-10-23. Status: aceito.

## Contexto

A tabela `public.v2_profiles` (criada pela migração `202610200006_perfil_publico_e_avaliacoes.sql`, Spec 018) armazena exclusivamente dados públicos de identificação comunitária dos membros:
- `id` (identificador interno UUID)
- `name` (nome comunitário exibido)
- `created_at` (data de entrada na comunidade)
- `photo_url` (link público opcional de avatar)
- `social_handle` (identificador público opcional de rede social)

Dados sensíveis e privados como e-mail, senha, telefone e preferências ficam estritamente isolados em `auth.users` e em `public.v2_user_preferences` (com RLS fechada apenas para o titular).

A permissão SQL inicial concedeu `grant select on public.v2_profiles to anon, authenticated;`. Entretanto, a política RLS correspondente (`"qualquer usuário autenticado lê perfis públicos"`) restringiu a cláusula `to authenticated`. Com isso, visitantes não autenticados que navegam pela vitrine pública de livros e abrem `/livro/[id]` recebiam zero linhas ao consultar o anunciante, caindo no fallback genérico `"Anunciado por outro membro da comunidade"` (pendência registrada na Spec 053). O mesmo ocorreu com a tabela `public.v2_ratings`.

## Decisão

1. Substituir a política de seleção de `public.v2_profiles` para permitir leitura por `anon` e `authenticated` (`to anon, authenticated using (true)`).
2. Substituir a política de seleção de `public.v2_ratings` para permitir leitura por `anon` e `authenticated` (`to anon, authenticated using (true)`), permitindo que a nota média do anunciante seja calculada na visualização pública.
3. Manter inalteradas todas as políticas de escrita (`insert`, `update`, `delete`), que continuam restritas estritamente a usuários autenticados para seus próprios registros (`auth.uid() = id`).
4. Criar a migração `supabase/migrations/202610230001_leitura_anonima_perfis_e_avaliacoes.sql`.

## Consequências

- **Positivas**: Visitantes não autenticados passam a ver o nome comunitário de quem anunciou e sua nota média ao explorar livros em Piripiri, humanizando a experiência e cumprindo o Figma sem expor qualquer dado privado (LGPD).
- **Segurança**: Nenhuma coluna privada reside em `v2_profiles` ou `v2_ratings`. Os dados de contato privado (telefone) permanecem blindados em `v2_user_preferences`.
- **Compatibilidade**: Nenhuma alteração de schema ou quebra de contratos TypeScript nas camadas de entidade ou usecase.
