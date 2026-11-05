# Tarefas: Permissões da Plataforma (Spec 020)

- [x] T001 Conferir o que o fluxo de anunciar já usa para fotos (biblioteca, permissões) antes
  de planejar mudança — não assumir. Resposta medida em 2026-11-05: a coleta de fotos vive em
  `src/infra/services/expoImagePickerService.ts` (`expo-image-picker`, galeria e câmera), e a capa
  ilustrativa de reserva está em `src/view/assets/capas/`.
- [x] T002 Criar lista fixa de bairros de Piripiri. Entregue como `PIRIPIRI_NEIGHBORHOODS` e
  `PiripiriNeighborhood` em `src/model/entities/location.ts`, não em `src/model/neighborhoods.ts`
  como previa este arquivo; o tipo é reaproveitado por anúncio, preferências e encontros.
- [x] T003 Criar o seletor de bairro. Entregue como `useActiveNeighborhood`
  (`src/viewmodel/useActiveNeighborhood.ts`) e o `NeighborhoodSelectorModal`
  (`src/view/components/NeighborhoodSelectorModal.tsx`), usado em Perfil, Configurações e na etapa
  "Detalhes" do anúncio; não existe `useNeighborhoodPickerViewModel` nem a rota `src/app/bairro.tsx`.
- [ ] T004 Criar `usePermissionPromptViewModel` genérico (texto explicativo → pedir → tratar
  negado) e a view `permissionPrompt.tsx` parametrizada. **Continua em aberto:** em 2026-11-05 não
  há nenhum texto explicativo antes do pedido — `src/infra/services/expoPushNotificationService.ts`
  chama `getPermissionsAsync`/`requestPermissionsAsync` e o componente `PushRegistration` é montado
  direto em `src/app/_layout.tsx`, então o sistema exibe o diálogo sem a pessoa saber o porquê.
- [ ] T005 Integrar o prompt de permissão de notificações ao fluxo de cadastro/login. **Em aberto
  pelo mesmo motivo da T004:** o pedido acontece na raiz do app, para qualquer estado da sessão,
  sem passagem pelo cadastro ou pelo login.
- [ ] T006 Integrar o prompt de permissão de câmera/fotos ao fluxo de anunciar, com fallback
  pra capa ilustrativa quando negado. **Parcial:** a galeria e a câmera usam o prompt próprio do
  `expo-image-picker` e a capa ilustrativa existe, mas não há tratamento da recusa levando ao
  aviso "permita o acesso às fotos" nem ao uso automático da capa de reserva.
- [ ] T007 Implementar testes unitários, de hooks e de componentes (cobertura > 80%). Não medido
  para o escopo desta spec: bairros, notificações e fotos têm testes próprios entregos pelas Specs
  034, 091, 099 e 081, mas nenhum cobre o prompt explicativo que falta na T004.
- [ ] T008 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`. **Em
  aberto:** `specs/020-permissoes-da-plataforma/` tem só `spec.md`, `plan.md` e `tasks.md`; não
  existe `validacao.md`.
