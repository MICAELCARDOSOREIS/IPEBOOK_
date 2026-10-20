# Validação: Compartilhar Anúncio (Spec 019 / Issue #74)

Data: 2026-10-20.

## O que foi implementado

- `src/usecase/iShareUseCases.ts` e `src/usecase/shareUseCases.ts`: `ShareUseCases` pura (sem
  dependência externa, respeitando o isolamento de camadas), com `buildListingSharePath(bookId)`
  validando o identificador e retornando o caminho relativo do anúncio (`/livro/{id}`).
- `src/viewmodel/useShareListingViewModel.ts`: monta a URL completa com `Linking.createURL`
  (`expo-linking`) a partir do caminho do usecase; no Android usa `Share.share` (menu nativo do
  sistema); na Web copia para a área de transferência via `navigator.clipboard.writeText` e
  sinaliza `linkCopied`.
- `src/di/container.ts`: `shareUseCases` registrado.
- `src/view/listings/bookDetail.tsx`: botão "Compartilhar" (disponível com ou sem sessão) e
  `Snackbar` com "Link copiado" no caminho Web.
- Deep link direto (T001): confirmado sem necessidade de ajuste — `src/app/livro/[id].tsx` é
  rota estática do Expo Router e `InitialRouteGate` só decide a rota inicial em `/`, não bloqueia
  `/livro/[id]` para quem não está autenticado.

## Validação executada

- `npm run typecheck`: limpo.
- `npm run check:architecture`: 195 arquivos verificados, sem violações de import de camada.
- `npm run test:coverage` (via `npm run validate`): **605 testes passando em 97 arquivos**,
  cobertura acima de 80% nas 4 dimensões (thresholds do `vitest.config.mts` aprovados).
- `npm run build:web` (`expo export --platform web`): build concluído com sucesso, 24 rotas
  estáticas exportadas (incluindo `/livro/[id]`), sem erros.

## Testes novos

- `tests/unit/shareUseCases.test.ts`: construção do caminho, normalização de espaços, rejeição
  de identificador vazio.
- `tests/hooks/useShareListingViewModel.test.tsx`: compartilhamento nativo no Android,
  cópia + confirmação na Web, limpeza da confirmação, erro de domínio ao compartilhar.
- `tests/components-mocked/bookDetailView.test.tsx`: botão de compartilhar acessível sem
  sessão, exibição do Snackbar "Link copiado" e de erro de compartilhamento.

## Mocks/infra de teste adicionados

- `tests/mocks/expo-linking.ts` (alias em `vitest.config.mts`), seguindo o mesmo padrão já usado
  para `react-native`, `@react-native-community/netinfo` etc. — necessário porque
  `expo-modules-core`/`expo-linking` reais dependem de globals nativos indisponíveis no Node.
- `Share` adicionado ao mock local de `react-native` (`tests/mocks/react-native.ts`).

## Limitações e pendências

- Verificação manual do menu nativo de compartilhamento do Android e da cópia de link num
  navegador real não foi feita nesta sessão — sem acesso a dispositivo físico/emulador ou
  navegador neste ambiente. Fica como verificação manual recomendada antes da publicação.
