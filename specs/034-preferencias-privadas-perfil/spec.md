# Spec 034 — Preferências privadas do perfil

**Responsável:** Maria Clara Almeida Martins
**Issue:** #141

## Problema

A tela de Perfil (Spec 006/Issue #55) já permite editar o nome público, a foto e a rede social
— dados que aparecem no perfil público (Spec 018). Faltava editar duas preferências que **não**
são públicas: telefone/WhatsApp de contato e bairro padrão em Piripiri (Figma `01.17 · Seu
bairro`, explicitamente deixado fora de escopo pela Spec 026).

## Decisão de arquitetura: tabela separada

`v2_profiles` (perfil público, Spec 018) tem uma política de RLS que permite qualquer usuário
autenticado ler qualquer linha (`using (true)`) — é assim que o perfil público funciona. Telefone
e bairro são dados pessoais que só a própria pessoa deve poder ler, então **não podem** viver
nessa tabela (colocá-los lá os exporia a qualquer pessoa autenticada via Supabase, mesmo que a
tela do app não os exibisse). Por isso foram criados em tabela própria
(`v2_user_preferences`), com RLS restrita ao dono (`auth.uid() = user_id`) em select, insert e
update.

## Escopo

- Campo "Telefone/WhatsApp" (opcional) na tela de Perfil.
- Seletor de "Bairro padrão" (opcional, lista fixa de Piripiri — mesma lista usada ao publicar um
  anúncio) na tela de Perfil.
- Validação acessível (alvo de toque ≥ 48dp via `Chip`/`TextField` já existentes) e persistência.

## Fora de escopo

- Exibir telefone ou bairro no perfil público (Spec 018) — continuam privados.
- Usar o bairro padrão para personalizar a Home/Busca — fica para quando houver essa
  funcionalidade (hoje a busca não filtra por bairro do usuário).
- Validação de número de telefone brasileiro além de contagem de dígitos (DDD + número).

## Comportamento esperado

- **RN-01** Telefone aceita apenas dígitos (formatação removida antes de salvar); se preenchido,
  deve ter 10 ou 11 dígitos (DDD + número fixo ou celular).
- **RN-02** Bairro, se selecionado, deve ser um dos bairros de `PIRIPIRI_NEIGHBORHOODS`.
- **RN-03** Os dois campos são opcionais; limpar o campo e salvar remove o valor salvo.
- **RN-04** Salvar grava nome/foto/rede social (perfil público) e telefone/bairro (preferências
  privadas) juntos, numa única ação "Salvar".

## Critérios de aceite

- [ ] RN-01 a RN-04 implementados e testados (usecase, datasources, ViewModel, View).
- [ ] `npm run validate` passando.
