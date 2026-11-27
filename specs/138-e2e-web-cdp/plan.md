# Plano de Implementação — Spec 138 (E2E Web via Chrome CDP)

## Arquitetura da Solução

1. **Isolamento do Jest e Lint:**
   - Os arquivos da suíte ficam em `tests/e2e/*.mjs` (sem sufixo `.test.ts`/`.test.tsx`), evitando que o Jest os execute no ambiente Node mockado, mas mantendo-os sob verificação do Biome (`npm run lint`).
   - `dist-e2e/` é adicionado ao `.gitignore`.

2. **Camada de Transporte e Automação (`tests/e2e/cdp.mjs`):**
   - Servidor HTTP Node (`node:http`) servindo `dist-e2e/` em `127.0.0.1` com porta efêmera (`0`), resolvendo `.html` para rotas do Expo Router e `index.html` na raiz.
   - Lançamento do `google-chrome --headless=new --remote-debugging-port=0 --user-data-dir=<tmpdir>` lendo a porta ativa de `DevToolsActivePort` ou `stderr`.
   - Cliente CDP usando `WebSocket` nativo do Node 24 (`Page`, `Runtime`, `DOM`, `Emulation`, `Network`).
   - Disparo de eventos compatível com React Native Web (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set` + evento `input`/`change` para inputs controlados).

3. **Cenários E2E (`tests/e2e/run.mjs`):**
   - Cada cenário recebe um helper de contexto limpo (`localStorage.clear()` + navegação para rota inicial) ou nova aba/alvo CDP.
   - Verificação automática de `Runtime.exceptionThrown` em cada cenário.
   - Relatório conciso no stdout com tempo por cenário e total.

4. **Comandos:**
   - `npm run test:e2e`: exporta `dist-e2e/` se ainda não existir (ou se `--build` for passado) e executa todos os cenários.
   - `npm run test:e2e:build`: força novo export em modo memória antes de rodar.

## Acesso ao catálogo pelas boas-vindas

Expor a navegação para a rota pública existente `/pesquisa` por meio da rota de boas-vindas. Reusar os botões e as regras de apresentação por plataforma. Exercitar a ação nas duas larguras já cobertas pelo cenário 1.
