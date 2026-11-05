# Validação: Permissões da Plataforma (Spec 020)

Data: 2026-11-05. Branch: `develop`.
Status: T004 a T007 implementadas e validadas localmente; T008 com o `npm run validate` aprovado e
o `npm run build:web` registrado abaixo. Validação em dispositivo física continua pendente (limitação
listada no fim).

## O que foi entregue

- **Prompt explicativo genérico (T004)**: `src/viewmodel/usePermissionPromptViewModel.ts`
  (estados `idle → explain → requesting → granted/denied`) e
  `src/view/components/PermissionPromptDialog.tsx`, parametrizado por `permission` e pelos textos de
  `PERMISSION_PROMPT_COPY`. Os dois estados visuais reutilizam o `Dialog` do design system
  (`design-system/04-componentes/dialogo.md`), que já prende foco e usa alvo de toque mínimo.
- **Casos de uso e persistência do "já perguntado"**: `src/usecase/permissionPromptUseCases.ts`
  sobre `IPermissionAskDataSource` (`asyncStoragePermissionAskDataSource.ts` no aparelho,
  `memoryPermissionAskDataSource.ts` nos testes) e `IPermissionService`
  (`src/model/services/iPermissionService.ts`). O registro é por aparelho, não por conta, e a
  explicação nunca reaparece depois de uma resposta — nem o prompt nativo, que agora só abre por
  toque em "Permitir".
- **Notificações no fluxo de login (T005)**: `src/view/components/PushRegistration.tsx` consultou a
  permissão ao existir sessão e, se ainda não perguntou, mostra o motivo antes de qualquer aviso do
  sistema. A gravação do token do Expo passou a ser condicionada a `permissionReady` em
  `usePushRegistration`, removendo o pedido silencioso que a raiz do app fazia em
  `src/app/_layout.tsx`.
- **Câmera e fotos no fluxo de anunciar (T006)**: em
  `src/view/listings/createListingStep2.tsx`, tocar em "Tirar foto" ou "Escolher da galeria" abre
  antes a tela de motivo; "Permitir e escolher" segue para o `expo-image-picker` e "Publicar sem
  foto" dispensa o acesso. A recusa continua chegando pelo `ValidationError` do seletor no alerta da
  etapa, agora acompanhada da frase de que o anúncio sai com a capa ilustrativa (`photoUrl` é
  opcional em `useCreateListingViewModel`).

## Evidências executáveis

### `npm run validate` — 2026-11-05, etapa por etapa

| Etapa | Resultado |
| --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | 0 erros |
| `npm run lint` (Biome) | 0 erros, 322 avisos (mesmo total da entrega anterior; nenhum aviso novo) |
| `npm run check:architecture` | 473 arquivos verificados, 0 violações de imports |
| `npm run check:design-system` | aprovado |
| `npm run check:numbering` | aprovado |
| `npm run check:build-config` | aprovado |
| `npm run test:sql` (PGlite) | aprovado, migrações e RLS |
| `npm run test:coverage` | 2.109 testes em 297 arquivos, 0 falhas |
| `npm run check:docs` | aprovado após sincronizar `docs/estado.md` e `README.md` |

Cobertura global da suíte: **statements 92,11%, branches 81,39%, functions 89,37%, lines 93,24%**
(mínimo de 80% nas quatro dimensões).

### `npm run build:web` — 2026-11-05

Exportação concluída com código de saída 0 (`Exported: dist`), com as rotas do Expo Router geradas e
o `scripts/preparar-dist-web.mjs` reescrevendo as referências de assets para `assets/vendor/`. A
entrega não tocou em rotas nem no cabeçalho web, então o build serve como regressão de empacotamento.

Cobertura dos arquivos desta entrega: `usePermissionPromptViewModel.ts` 100/87,5/100,
`PermissionPromptDialog.tsx` 100/100/100, `permissionPromptUseCases.ts` 92,86/100/100,
`asyncStoragePermissionAskDataSource.ts` 100/-/100, `PushRegistration.tsx` 90/100/75,
`usePushRegistration.ts` 96,88/95,65/100, `createListingStep2.tsx` 92,59/70,97/86,67
(statements/branches/functions).

### Testes que sustentam os critérios de aceite

- `tests/unit/permissionPromptUseCases.test.ts` (6): concedida não explica, primeira vez explica,
  recusa anterior não insiste, falha ao consultar o aparelho explica (nunca pede em silêncio),
  gravar a pergunta ao abrir o prompt e tolerância à falha de armazenamento.
- `tests/unit/asyncStoragePermissionAskDataSource.test.ts` (3): chave por permissão no aparelho e
  valor não marcado conta como "não perguntado".
- `tests/hooks/usePermissionPromptViewModel.test.tsx` (6): as transições `refresh/approve/decline/
  dismiss` nos três resultados do aparelho.
- `tests/components/permissionPromptDialog.test.tsx` (5): nada desenha em `idle`/`requesting`,
  nada desenha em `idle`/`requesting`, explica antes do prompt nativo, e na recusa mostra o que ficou
  indisponível com o caminho dos
  Ajustes do aparelho; a variante de fotos oferece "Publicar sem foto".
- `tests/hooks/usePushRegistration.test.tsx` (9, dois novos): sem permissão não pede token; depois
  de o aviso conceder, o token é gravado.
- `tests/components/pushRegistration.test.tsx` (4): explica ao entrar na conta e mostra o estado de
  recusa sem travar o app.
- `tests/components/createListingStep2.test.tsx` (4): o motivo vem antes do seletor em capa e
  lombada/páginas, "Publicar sem foto" não pede acesso, e o alerta de recusa traz a saída da capa
  ilustrativa.

## Limitações e pendências

- **Nada foi verificado em aparelho físico.** O prompt nativo do Expo (`Notifications.
  requestPermissionsAsync`) e o do `expo-image-picker` não disparam em testes de node nem na web; a
  sequência explicação → aviso do sistema → estado de recusa precisa de uma passada no dispositivo,
  como já registrado para as Specs 006/007.
- A folha de origem da foto e o diálogo de motivo são dois `Modal` que se trocam no mesmo toque. Em
  Android isso costuma funcionar, mas há histórico de transição de modal duplo; se aparecer na beta,
  mover o motivo para dentro do `PhotoSourceSheet` resolve.
- Depois da recusa, a reativação é orientada pelos Ajustes do aparelho. Um controle em "Central de
  notificações" que reabra o prompt fica como acompanhamento da spec.
- Nenhuma tela do app pede permissão de localização: a beta escolhe o bairro manualmente dentro de
  Piripiri, então não existe prompt nativo de GPS a explicar (escopo da própria spec, Seção 2).
