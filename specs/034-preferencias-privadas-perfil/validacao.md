# Validação: Preferências privadas do perfil (Spec 034 / Issue #141)

Data: 2026-10-21.

## O que foi implementado

- `supabase/migrations/202610210001_preferencias_privadas_perfil.sql`: tabela
  `v2_user_preferences` (telefone, bairro), separada de `v2_profiles` por motivo de privacidade
  — RLS restrita ao dono em select/insert/update (nenhuma política de leitura pública).
- `src/model/datasources/iUserPreferencesDataSource.ts` + `memoryUserPreferencesDataSource.ts` +
  `supabaseUserPreferencesDataSource.ts`.
- `src/model/entities/userPreferences.ts`, `src/usecase/iUserPreferencesUseCases.ts` +
  `userPreferencesUseCases.ts`: valida telefone (10-11 dígitos após remover formatação) e bairro
  (deve pertencer a `PIRIPIRI_NEIGHBORHOODS`, mesma lista usada ao publicar anúncio).
- `src/di/container.ts`: `userPreferencesUseCases` registrado (memória e Supabase).
- `src/viewmodel/useUserPreferencesViewModel.ts` (novo).
- `src/view/profile/profile.tsx`: campo "Telefone/WhatsApp" e seletor de "Bairro padrão"
  (`Chip`, mesmo padrão visual de `createListing.tsx`); "Salvar" grava perfil público
  (nome/foto/rede social) e preferências privadas (telefone/bairro) juntos, numa única ação.

## Validação executada

- `npm run typecheck`: limpo.
- `npm run check:architecture`: 218 arquivos verificados, sem violações de camada.
- `npm run test:sql`: migração aplicada com sucesso, sem regressão.
- `npm run test:coverage`: **771 testes passando em 113 arquivos**, cobertura acima de 80% nas
  4 dimensões (Statements 90,33%, Branches 83,03%, Functions 87,23%, Lines 91,75%).
- `npm run build:web`: build concluído.

## Testes novos

- `tests/unit/userPreferencesUseCases.test.ts`: validação de telefone/bairro, criação implícita,
  limpeza de campos, persistência.
- `tests/unit/supabaseUserPreferencesDataSource.test.ts`: leitura/gravação via cliente Supabase
  mockado, incluindo erros de banco.
- `tests/hooks/useUserPreferencesViewModel.test.tsx`: carregamento, atualização, erros de
  domínio e genérico, ausência de sessão.
- `tests/components-mocked/profileView.test.tsx`: preenchimento de telefone/bairro, salvar os
  dois formulários juntos, erro de validação das preferências.

## Decisões de privacidade

- Telefone e bairro **não** foram adicionados a `v2_profiles` (perfil público) justamente porque
  essa tabela tem uma política de leitura pública para qualquer usuário autenticado — colocá-los
  lá os exporia a terceiros mesmo sem a tela do app exibi-los. Ficaram numa tabela própria com
  RLS restrita ao dono.

## Limitações e pendências

- Verificação manual em dispositivo/navegador real não foi feita nesta sessão.
- Bairro padrão salvo não é usado ainda para personalizar Home/Busca — fora de escopo desta
  entrega (ver `spec.md`).
