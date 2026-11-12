# Validação: Permissões da Plataforma (Spec 020)

Data: 2026-11-05. Branch: `develop`.
Status: T004 a T007 implementadas e validadas localmente; T008 com o `npm run validate` aprovado e
o `npm run build:web` registrado abaixo. Os fluxos de cadastro → aviso de avisos e de anunciar →
acesso às fotos foram conferidos em navegador real por CDP (seção "Verificação de fluxo real no
navegador"), o que exigiu corrigir a leitura da sessão na raiz do app. Validação em dispositivo física
continua pendente (limitação listada no fim).

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

**Reexecução após a correção da sessão na raiz (mesma data):** `npm run validate` com código de saída
0 em todas as etapas — typecheck 0 erros, Biome 0 erros e 323 avisos (o aviso extra está em
`src/infra/datasources/supabasePhotoStorageDataSource.ts:45`, pré-existente e alheio a esta entrega),
`check:architecture` 473 arquivos sem violações, `test:coverage` **2.113 testes em 297 arquivos** com
0 falhas e cobertura global **statements 92,10%, branches 81,39%, functions 89,38%, lines 93,25%**,
`check:docs` aprovado com `docs/estado.md` e `README.md` sincronizados.

### `npm run build:web` — 2026-11-05

Exportação concluída com código de saída 0 (`Exported: dist`), com as rotas do Expo Router geradas e
o `scripts/preparar-dist-web.mjs` reescrevendo as referências de assets para `assets/vendor/`. A
entrega não tocou em rotas nem no cabeçalho web, então o build serve como regressão de empacotamento.

Cobertura dos arquivos desta entrega: `usePermissionPromptViewModel.ts` 100/87,5/100,
`PermissionPromptDialog.tsx` 100/100/100, `permissionPromptUseCases.ts` 92,86/100/100,
`asyncStoragePermissionAskDataSource.ts` 100/-/100, `PushRegistration.tsx` 90/100/75,
`usePushRegistration.ts` 96,88/95,65/100, `createListingStep2.tsx` 92,59/70,97/86,67
(statements/branches/functions).

### Verificação de fluxo real no navegador — 2026-11-05 (CDP, sem Playwright)

Como o `AGENTS.md` proíbe Playwright, o fluxo foi conferido em navegador real por CDP puro:
exportação em modo memória (`EXPO_PUBLIC_BACKEND=memory npx expo export --platform web`), servida em
`http://localhost:8082`, com Chrome 156 em `--headless=new --remote-debugging-port=9333` e toques
reais enviados por `Input.dispatchMouseEvent` (ativação de usuário autêntica, necessária ao
`Notification.requestPermission`). Antes de cada carga, um script injetado por
`Page.addScriptToEvaluateOnNewDocument` conta as chamadas nativas (`Notification.requestPermission`,
`getUserMedia` e clique em `<input type="file">`), e `Page.setInterceptFileChooserDialog` registra a
abertura do seletor de arquivos do sistema sem abrir janela no SO.

**Avisos (T005, CA2 e CA3)** — cadastro criado pelo formulário, com o contador de prompt nativo lido
em cada passo:

| Passo | O que a tela mostrou | Prompts nativos de notificação |
| --- | --- | --- |
| Conta criada | "Avisos no seu celular" com o motivo e os botões "Agora não" / "Permitir avisos" | 0 |
| "Permitir avisos" | o aparelho respondeu e a tela foi para "Avisos só dentro do app", com o caminho dos Ajustes | 1 |
| "Agora não" (nova conta) | o diálogo fecha e o catálogo continua navegável | 0 |
| Recarregar a aba | nenhum aviso volta; a chave `ipebook.permissaoPerguntada.notifications` ficou no aparelho | 0 |

**Fotos (T006, CA2 e CA4)** — anúncio criado do zero (Estante → Anunciar livro → modalidade Doação,
título e autor) até a etapa de fotos:

| Passo | O que a tela mostrou | Seletor nativo de arquivo aberto |
| --- | --- | --- |
| Tocar em "Foto da capa" | a folha de origem "Tirar foto / Escolher da galeria / Cancelar" | 0 |
| "Tirar foto" | "Fotos do seu livro" explicando o acesso e a saída da capa ilustrativa | 0 |
| "Permitir e escolher" | o seletor do sistema foi aberto, uma única vez, depois do motivo | 1 |
| "Escolher da galeria" de novo | o motivo voltou a ser exibido antes de qualquer acesso | 1 |
| "Publicar sem foto" | o diálogo fecha sem abrir nada; a etapa seguinte seguiu normal | 1 |
| "Publicar anúncio" sem foto | tela de sucesso: "Seu livro ganhou um novo começo. O anúncio já aparece para leitores de Piripiri." | 1 |

**Defeito encontrado e corrigido por esta verificação:** na primeira passada o aviso de avisos nunca
aparecia. O motivo é que `useAuthViewModel` guarda a sessão por instância de hook: a raiz do app
montou antes de existir conta logada, `sessionUserId` ficou `null` e o `refresh()` do aviso nunca foi
chamado na mesma execução do cadastro. `useAuthViewModel` passou a expor `refreshSession` (relê
`getSession` e só redesenha se o id mudou) e `PushRegistration` recebeu a rota atual (`pathname`, o
mesmo padrão de `InitialRouteGate`) para reler a sessão enquanto não houver conta. Os diálogos
acima foram conferidos depois dessa correção.

**Observação fora do escopo:** a etapa 1 tem o leitor de código de barras, que abre o
`BarcodeScannerModal` com a própria explicação de câmera ("Permissão de Câmera Necessária"). É um
aviso anterior ao da Spec 020, de outra tela, e não foi alterado.

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
- `tests/components/pushRegistration.test.tsx` (5): explica ao entrar na conta, mostra o estado de
  recusa sem travar o app e relê a sessão ao navegar — é o que faz o aviso sair na mesma execução do
  login, conferida no navegador acima.
- `tests/hooks/useAuthViewModel.test.tsx` (14, três novos de `refreshSession`): publica a conta que
  apareceu no aparelho depois da montagem, não redesenha com a mesma sessão e mantém o estado quando
  a leitura falha.
- `tests/components/createListingStep2.test.tsx` (4): o motivo vem antes do seletor em capa e
  lombada/páginas, "Publicar sem foto" não pede acesso, e o alerta de recusa traz a saída da capa
  ilustrativa.

## Limitações e pendências

- **O prompt nativo do Android continua por conferir em aparelho.** A ordem explicação → aviso do
  sistema → estado de recusa foi verificada em navegador real (seções acima), mas na web quem responde
  é a API `Notification` do navegador e o seletor de arquivos do sistema; no aparelho os avisos vêm de
  `Notifications.requestPermissionsAsync` (Expo) e do `expo-image-picker`, que não disparam em node nem
  na web. A passada no dispositivo segue pendente, como nas Specs 006/007.
- Na web em modo memória a sessão vive na memória do navegador, então o fluxo de cadastro → aviso só é
  reproduzível sem recarregar a aba — foi assim que as tabelas acima foram coletadas (uma execução
  contínua por cenário, com o registro de "já perguntado" limpo antes).
- A folha de origem da foto e o diálogo de motivo são dois `Modal` que se trocam no mesmo toque. Em
  Android isso costuma funcionar, mas há histórico de transição de modal duplo; se aparecer na beta,
  mover o motivo para dentro do `PhotoSourceSheet` resolve.
- Depois da recusa, a reativação é orientada pelos Ajustes do aparelho. Um controle em "Central de
  notificações" que reabra o prompt fica como acompanhamento da spec. Entregue pela Spec 127 em
  2026-11-05: a banner "Notificações desativadas" passou a ter o botão "Pedir permissão de novo", que
  reabre exatamente o mesmo `PermissionPromptDialog` (ver `specs/127-reativar-avisos-de-dentro-do-app/validacao.md`).
- Nenhuma tela do app pede permissão de localização: a beta escolhe o bairro manualmente dentro de
  Piripiri, então não existe prompt nativo de GPS a explicar (escopo da própria spec, Seção 2).
