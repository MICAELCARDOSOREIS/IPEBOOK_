-- Edição do perfil próprio: foto e rede social (Spec 006 US4 / Issue #55)

alter table public.v2_profiles
  add column if not exists photo_url text,
  add column if not exists social_handle text;

comment on column public.v2_profiles.photo_url is 'URL da foto de perfil (sem upload — somente link); opcional.';
comment on column public.v2_profiles.social_handle is 'Identificador de rede social exibido no perfil público; opcional.';
