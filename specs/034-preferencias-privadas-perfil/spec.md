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

## Continuação (26/10/2026) — editar perfil sem dados inventados

Entrega registrada no ADR 0061. Objetivo: a tela de edição e o hub de perfil deixam de afirmar
coisas que não são verdade sobre a pessoa e param de descartar trabalho em silêncio.

- **RN-05** Nenhum valor de bairro é exibido ou salvo como se fosse escolha da pessoa: sem
  preferência gravada, o campo mostra "Selecionar bairro" e o hub mostra "Piripiri, PI".
- **RN-06** Os atalhos de bairro são rotulados pelo que são ("Bairros de Piripiri"), sem alegar
  frequência que o aplicativo não mede, e apontam o seletor completo.
- **RN-07** Carregando a sessão, a tela mostra estado de carregamento; sem sessão, mostra um cartão
  com o caminho "Entrar ou criar conta". Nenhum desses casos deixa a tela em branco.
- **RN-08** Sair da tela com alteração não salva (barra superior ou botão físico de voltar do
  Android) pergunta antes de descartar; sem alteração, sai direto. Depois de salvar, a guarda se
  desliga porque a linha de base passa a ser o valor gravado.
- **RN-09** Haver foto no perfil permite removê-la em um toque. Bloqueio de salvamento por erros em
  linha é anunciado em região viva, e o campo de nome mostra o contador de caracteres.

### Como será testado

`tests/components-mocked/profileView.test.tsx` (RN-05 a RN-09) e
`tests/components/profileHubView.test.tsx` (bairro real no cartão de identidade).

### Critérios de aceite da continuação

- [ ] RN-05 a RN-09 implementados e cobertos por testes.
- [ ] `npm run check:architecture` e `npm run validate` passando.

