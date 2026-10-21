# 0035 — Service Worker e cache offline de assets e catálogo no PWA

Data: 2026-10-21. Status: aceito.

## Contexto

O IpêBook possui distribuição Web focada no acesso pela comunidade de Piripiri (Piauí), empacotado como PWA estático e hospedado na Cloudflare Pages (ADR 0020). Em áreas periféricas da cidade, conexões de dados móveis (3G/4G) apresentam oscilações frequentes e perdas temporárias de sinal.

Até este momento:
1. O aplicativo web dependia de conexão constante para carregar o App Shell e os pacotes JavaScript/CSS gerados pelo Expo.
2. Não havia um Service Worker ativo na distribuição web (`public/sw.js`), deixando o usuário refém de telas de erro nativas do navegador em situações de desconexão momentânea.
3. Requisições ao catálogo de livros (`/rest/v1/livros*`) não contavam com política de resiliência a nível de rede web no navegador, resultando em falhas visíveis mesmo que o usuário já tivesse visualizado os anúncios minutos antes.
4. Era necessário estabelecer uma arquitetura limpa em camadas para registro do Service Worker que respeitasse o isolamento de plataformas (web vs. nativo) e não violasse a verificação de camadas do projeto (`scripts/verificar-arquitetura.mjs`).

## Decisão

1. **Service Worker Canônico em `public/sw.js`:**
   - Adicionar o arquivo `public/sw.js` contendo a implementação padrão do Service Worker que é copiada diretamente pelo exportador estático do Expo Web para `dist/sw.js`.
   - Gerenciamento de ciclo de vida:
     - Evento `install`: armazena em cache estático dedicado (`ipebook-static-v1`) os assets essenciais do App Shell (`/`, `/index.html`, `/manifest.json`, favicons, ícones e páginas HTML principais) e invoca `self.skipWaiting()`.
     - Evento `activate`: purga atomicamente caches de versões legadas e assume o controle imediato dos clientes via `self.clients.claim()`.
     - Evento `fetch`:
       - Requisições de navegação SPA (`mode === 'navigate'` ou `text/html`): tenta a rede primeiro; em caso de falha de conexão, recorre ao cache local correspondente ou ao `index.html` do App Shell.
       - Requisições de assets estáticos (scripts, estilos, fontes do Google e imagens em `_expo/static/` ou `/assets/`): aplica a estratégia **Stale-While-Revalidate**, servindo a cópia local imediatamente e revalidando em segundo plano.
       - Requisições de catálogo do Supabase (GET em rotas `/rest/v1/livros*`): aplica a estratégia **Network-First**, consultando a rede e atualizando o cache dedicado (`ipebook-catalog-v1`), com fallback para a última resposta válida em cache e, caso indisponível, uma resposta JSON estruturada amigável.
       - Métodos não idempotentes (POST, PATCH, DELETE) e rotas sensíveis de autenticação transitam diretamente para a rede sem cacheamento.

2. **Serviço de Registro PWA na Arquitetura MVVM:**
   - Criar o contrato `src/model/services/iPwaService.ts` com métodos `register()`, `unregister()` e `isSupported()`.
   - Implementar `src/infra/services/pwaService.ts` (`PwaService`) e funções de lógica em `src/infra/pwa/serviceWorkerLogic.ts`, isolando a detecção da plataforma (`Platform.OS === 'web'`), a checagem da disponibilidade da API (`'serviceWorker' in navigator`) e o registro com tratamento de exceções.
   - Registrar `pwaService` no contêiner de injeção de dependência (`src/di/container.ts`).
   - Criar `src/viewmodel/usePwaViewModel.ts` e o componente visual não intrusivo `src/view/components/PwaRegister.tsx`, permitindo a integração segura no layout raiz (`src/app/_layout.tsx`) sem violação das restrições de importação da arquitetura.
   - Adicionar script não obstrutivo no HTML raiz estático (`src/app/+html.tsx`) para registro precoce durante o carregamento do documento na Web.

3. **Configuração de Cabeçalhos no Cloudflare Pages:**
   - Adicionar regras específicas em `public/_headers` para o arquivo `/sw.js`:
     ```
     /sw.js
       Content-Type: application/javascript; charset=utf-8
       Cache-Control: public, max-age=0, must-revalidate
       Service-Worker-Allowed: /
     ```
   - Isso assegura que novas versões do Service Worker sejam detectadas e instaladas imediatamente pelos navegadores sem retenção em cache intermediário.

## Alternativas consideradas

- **Utilizar bibliotecas externas pesadas (como Workbox completo empacotado):** rejeitado para evitar adição de dependências pesadas de build e runtime incompatíveis com a simplicidade do ecossistema Expo Router Web estático. O Service Worker em vanilla JavaScript nativo é leve (< 5 KB), previsível e com custo zero de manutenção externa.
- **Cache offline apenas via AsyncStorage / SQLite:** rejeitado porque o AsyncStorage não intercepta as requisições de rede do navegador (App Shell, scripts JS e requisições HTTP da página web quando instalada como PWA). A combinação de Service Worker para a camada de transporte web e datasources locais para estado do app fornece a melhor cobertura.

## Consequências

- O aplicativo web do IpêBook abre instantaneamente em acessos repetidos e funciona mesmo em modo offline para o App Shell e consultas recentes do catálogo.
- Assets estáticos e scripts atualizam de forma transparente sem quebras na experiência do usuário.
- O Cloudflare Pages serve o Service Worker com cabeçalhos adequados que previnem travamento em versões antigas.
- Zero impacto no comportamento das plataformas móveis nativas (Android/iOS) e nos testes automatizados em ambiente Node.

Vínculos: [Spec 041](../../specs/041-pwa-service-worker-cache-offline/spec.md), [ADR 0020](0020-publicacao-web-cloudflare-pages.md), [ADR 0027](0027-resiliencia-seguranca-e-verificacao-release.md).
