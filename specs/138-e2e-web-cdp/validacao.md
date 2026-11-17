# Validação — Spec 138 (E2E Web via Chrome CDP)

- **Data:** 2026-11-17
- **Comando executado:** `npm run test:e2e` (contra build isolada gerada por `EXPO_PUBLIC_BACKEND=memory npx expo export --platform web --output-dir dist-e2e`)
- **Ambiente:** Node.js v24.22.1 + Google Chrome headless via CDP puro (sem Playwright)

## Resultados observados

1. **Cenário 1 — Boas-vindas, catálogo público (Desktop/Mobile), busca e detalhe:** `PASSOU (4849ms)`
2. **Cenário 2 — Cadastro, edição de perfil e limpeza de histórico em configurações:** `PASSOU (5381ms)`
3. **Cenário 3 — Publicação em 3 etapas, pausa/retomada, edição e exclusão na Estante:** `PASSOU (7648ms)`
4. **Cenário 4 — Favoritar livro no detalhe, conferir em Favoritos e remover:** `PASSOU (4379ms)`
5. **Cenário 5 — Enviar pedido de livro e cancelar em Conversas:** `PASSOU (4578ms)`
6. **Cenário 6 — Ciclo completo entre 2 contas (anúncio, pedido, aceite, chat, encontro, entrega e avaliação):** `PASSOU (23754ms)`
7. **Cenário 7 — Resiliência offline/online e banner de conexão:** `PASSOU (2995ms)`

**Resumo:** `7/7 cenários aprovados`, 0 exceções JavaScript não tratadas.
