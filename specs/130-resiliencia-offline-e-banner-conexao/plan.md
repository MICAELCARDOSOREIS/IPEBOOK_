# Plano de Implementação — Spec 130: Resiliência offline e banner global de conectividade

## Arquitetura e Estratégia de Implementação

### 1. Banner Global de Conectividade
- Criar `src/view/components/ConnectionStatusBanner.tsx`:
  - Consome `useNetworkStatus(networkStatusDataSource)`.
  - Injetado via `container.networkStatusDataSource` ou recebido opcionalmente como prop para testes isolados.
  - Exibe banner discreto no topo, com `accessibilityRole="alert"` e `accessibilityLiveRegion="polite"`.
  - Se `isOnline === true`, retorna `null`.
- Integrar no `src/app/_layout.tsx` abaixo do `ThemedStatusBar` / dentro do container raiz.

### 2. Cache Offline da Estante em `CachedBookDataSource`
- Atualizar `src/infra/datasources/cachedBookDataSource.ts`:
  - Função auxiliar `ownerListKey(ownerId: string): string` -> `ipebook:cache:books:owner:${ownerId}`.
  - Em `listByOwner(ownerId)`:
    - Tenta `this.primary.listByOwner(ownerId)`.
    - Ao obter sucesso, grava no cache `this.writeCache(this.ownerListKey(ownerId), fresh)`.
    - Ao capturar erro de rede, tenta `this.readCache(this.ownerListKey(ownerId))`. Se houver itens, retorna. Caso contrário, repassa o erro.
  - Em `create`, `update`, `updateStatus`, `delete`: além de `this.invalidate()`, invalidar caches de owner conhecidos ou purgar chaves iniciadas por `ipebook:cache:books:owner:`.

### 3. Blindagem de Envio no Chat
- Em `src/view/conversations/chat.tsx`:
  - Usar `useNetworkStatus(networkStatusDataSource)`.
  - Quando `!isOnline`, desabilitar o botão de envio (`disabled={!isOnline || ...}`), alterar opacidade/estilo visual e ajustar `accessibilityLabel` para *"Sem conexão com a internet"*.

### 4. Validação e Testes
- Testes unitários para `ConnectionStatusBanner`.
- Testes unitários para `CachedBookDataSource.listByOwner`.
- Testes de interface para o botão de chat desabilitado offline.
- Executar `npm run validate`.
