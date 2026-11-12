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
- [x] T004 Criar `usePermissionPromptViewModel` genérico (texto explicativo → pedir → tratar
  negado) e a view `permissionPrompt.tsx` parametrizada. Entregue em 2026-11-05 como
  `src/viewmodel/usePermissionPromptViewModel.ts` (estados `idle | explain | requesting | denied`,
  ações `refresh | approve | decline | dismiss`) e `src/view/components/PermissionPromptDialog.tsx`
  (não `permissionPrompt.tsx`: segue o PascalCase de `src/view/components/`), parametrizada por
  `permission` e alimentada por `PERMISSION_PROMPT_COPY`. A persistência de "já perguntado" fica em
  `PermissionPromptUseCases` (`src/usecase/permissionPromptUseCases.ts`) sobre
  `IPermissionAskDataSource` (`AsyncStoragePermissionAskDataSource`/`MemoryPermissionAskDataSource`)
  e `IPermissionService` (`src/model/services/iPermissionService.ts`); o texto das telas está na
  view e o ViewModel não importa `@/di` (ADR 0098).
- [x] T005 Integrar o prompt de permissão de notificações ao fluxo de cadastro/login. Feito em
  `src/view/components/PushRegistration.tsx`: ao existir sessão, `refresh()` decide se a explicação
  aparece (concedida ou já perguntada = não insiste) e o `PermissionPromptDialog` é montado por cima
  da tela. O pedido silencioso que a raiz fazia antes foi removido: `usePushRegistration` agora só
  busca o token do Expo com `permissionReady` verdadeiro, então `requestPermissionsAsync` do
  `expoPushNotificationService` não roda mais sem a pessoa ter tocado em "Permitir avisos". A
  fábrica `makeNotificationsPromptViewModel` está em `src/di/container.ts`. A verificação em
  navegador mostrou que o aviso ainda não saía na mesma execução do cadastro — cada tela tem seu
  estado de sessão, e a raiz montou antes de existir conta — então `useAuthViewModel` passou a expor
  `refreshSession` e `PushRegistration` recebe a rota atual (`pathname`) para reler a sessão enquanto
  não houver conta logada.
- [x] T006 Integrar o prompt de permissão de câmera/fotos ao fluxo de anunciar, com fallback pra
  capa ilustrativa quando negado. Em `src/view/listings/createListingStep2.tsx`, escolher
  "Tirar foto" ou "Escolher da galeria" abre primeiro o `PermissionPromptDialog` com
  `permission="photos"`; "Permitir e escolher" chama o seletor, "Publicar sem foto" fecha sem pedir
  acesso nenhum. A recusa do aparelho continua chegando pelo `ValidationError` do
  `expoImagePickerService` no alerta da etapa, agora acompanhado da frase de que a publicação segue
  com a capa ilustrativa (`photoUrl` é opcional em `useCreateListingViewModel`).
- [x] T007 Implementar testes unitários, de hooks e de componentes (cobertura > 80%). Novos:
  `tests/unit/permissionPromptUseCases.test.ts`,
  `tests/unit/asyncStoragePermissionAskDataSource.test.ts`,
  `tests/hooks/usePermissionPromptViewModel.test.tsx`,
  `tests/components/permissionPromptDialog.test.tsx`. Atualizados com o fluxo novo:
  `tests/hooks/usePushRegistration.test.tsx` (gate por permissão e o caso de conceder depois),
  `tests/components/pushRegistration.test.tsx` (explicação e recusa) e
  `tests/components/createListingStep2.test.tsx` (motivo antes do seletor, "Publicar sem foto" e a
  saída da recusa).
- [x] T008 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`. Feito em
  2026-11-05: pipeline integral verde (2.113 testes em 297 arquivos na reexecução, 0 violações de
  arquitetura, branches 81,39%) e build web exportado com sucesso, tudo registrado em
  `specs/020-permissoes-da-plataforma/validacao.md`. Na mesma data os fluxos foram conferidos em
  navegador real por CDP (Chrome headless, sem Playwright, modo memória): explicação antes de
  qualquer prompt nativo, um único prompt por decisão, estado de recusa com o caminho dos Ajustes e
  publicação do anúncio sem foto concluída. Falta apenas a passada em aparelho físico, registrada
  como limitação.

## Fora do que estava previsto

- Localização: nenhuma tela pede permissão de localização do aparelho — a beta escolhe o bairro
  manualmente dentro de Piripiri, então não há prompt nativo a explicar (decisão registrada no
  escopo da própria spec).
- Leitor de código de barras: `BarcodeScannerModal` (etapa 1 de anunciar) tem a própria explicação de
  câmera, anterior e independente do `PermissionPromptDialog` desta spec; não foi unificado.
- Reativar avisos de dentro do app depois da recusa: hoje a explicação é a orientação para os
  Ajustes do aparelho. Um controle em "Central de notificações" que reabra o prompt fica como
  acompanhamento. Entregue pela Spec 127 (`specs/127-reativar-avisos-de-dentro-do-app/`), em
  2026-11-05.
