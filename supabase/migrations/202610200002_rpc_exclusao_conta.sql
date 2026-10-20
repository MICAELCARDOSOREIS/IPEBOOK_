-- Função RPC para exclusão de conta em conformidade com a LGPD (Direito ao esquecimento, Spec 014 / Issue #115)
-- Permite que uma pessoa autenticada exclua sua própria conta e todos os dados associados.

create or replace function public.delete_user_account(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  -- Segurança: impede que qualquer leitor tente apagar a conta de outro usuário
  if auth.uid() is null or auth.uid() <> target_user_id then
    raise exception 'Não autorizado a excluir esta conta';
  end if;

  -- Remove perfis legados se a tabela existir
  if to_regclass('public.profiles') is not null then
    execute 'delete from public.profiles where user_id = $1' using target_user_id;
  end if;

  -- Remove da tabela auth.users (dispara cascata nas tabelas de livros, pedidos, favoritos, alertas, denúncias e notificações)
  delete from auth.users where id = target_user_id;
end;
$$;

-- Permite execução apenas por usuários autenticados
revoke all on function public.delete_user_account(uuid) from public;
grant execute on function public.delete_user_account(uuid) to authenticated;
