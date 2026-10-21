# Spec 041 — PWA: Service Worker e cache offline de assets e catálogo

**Responsável:** Agente Especialista (`pessoa:agente-especialista`)
**Data:** 21 de outubro de 2026
**Issue:** #176
**Componentes:** `public/sw.js`, `public/_headers`, `src/model/services/iPwaService.ts`, `src/infra/services/pwaService.ts`, `src/infra/pwa/serviceWorkerLogic.ts`, `src/viewmodel/usePwaViewModel.ts`, `src/view/components/PwaRegister.tsx`, `src/app/_layout.tsx`, `src/app/+html.tsx`.

## Problema

O IpêBook é distribuído na Web (via Cloudflare Pages) como Progressive Web App (PWA) instalável no navegador do celular e no computador (Spec 025 e ADR 0020). No contexto comunitário de Piripiri (Piauí), conexões móveis são frequentemente instáveis ou sofrem quedas momentâneas de sinal.

Antes desta especificação:
1. **Ausência de Service Worker:** o carregamento dependia estritamente de requisições vivas de rede a cada acesso. Sem sinal de internet, o usuário recebia a tela padrão de erro de rede do navegador (ex.: "Sem conexão à internet" com o dinossauro), impedindo o carregamento do App Shell.
2. **Ausência de cache offline do catálogo de livros:** se a conexão oscilasse durante a navegação, consultas anteriores da lista de livros eram perdidas, impedindo consultas em modo offline.
3. **Ausência de estratégia de atualização transparente para assets estáticos:** arquivos JS/CSS gerados pelo Expo poderiam demorar para revalidar ou exigir recarregamento forçado.
4. **Falta de registro resiliente no ciclo de vida web:** a inicialização não possuía uma camada arquitetural limpa em TypeScript para gerenciar o registro seguro do Service Worker, distinguindo ambientes de teste, nativos e navegadores reais.

## Escopo

- Implementar arquivo executável do Service Worker em `public/sw.js` para ser copiado estaticamente no build do Expo Web (`dist/sw.js`).
- Configurar pré-cache estático do App Shell no evento `install` (`/`, `/index.html`, `/manifest.json`, favicons, ícones essenciais e páginas base).
- Implementar estratégia Stale-While-Revalidate para assets estáticos (scripts, estilos, fontes e imagens locais em `_expo/static/` e assets).
- Implementar estratégia Network-First com fallback para Cache e resposta amigável estruturada para requisições de catálogo do Supabase (`/rest/v1/livros*`).
- Gerenciar o ciclo de vida do Service Worker (`skipWaiting` na instalação, `clients.claim` na ativação e purga de caches legados no evento `activate`).
- Criar abstrações na arquitetura MVVM (`IPwaService`, `PwaService`, `usePwaViewModel`, `PwaRegister`) para registro não intrusivo e testabilidade.
- Integrar o registro no `src/app/+html.tsx` (para carregamento inicial estático) e em `src/app/_layout.tsx` (via componente `PwaRegister` em conformidade com as regras de camadas).
- Adicionar cabeçalhos de controle de cache para `/sw.js` em `public/_headers`.
- Fora do escopo: sincronização em segundo plano (Background Sync) para envio de novos anúncios ou mensagens offline (funcionalidade futura da fase pós-beta).

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Pré-cache do App Shell):** durante o evento `install`, o Service Worker pré-carrega os recursos essenciais do App Shell em cache estático dedicado (`ipebook-static-v1`).
- **RN-02 (Ativação e Limpeza de Caches Anteriores):** no evento `activate`, caches pertencentes a versões legadas são excluídos atomicamente, e o novo Service Worker assume o controle dos clientes abertos imediatamente via `clients.claim()`.
- **RN-03 (Estratégia Stale-While-Revalidate para Assets Estáticos):** requisições de assets estáticos (scripts JS, estilos CSS, fontes do Google e ícones locais) retornam imediatamente a versão em cache (se disponível) enquanto uma requisição de rede em segundo plano atualiza o cache para o próximo acesso.
- **RN-04 (Estratégia Network-First para Catálogo):** requisições GET para o catálogo de livros do Supabase tentam a rede primeiro. Se bem-sucedidas, armazenam a resposta atualizada no cache dedicado de catálogo (`ipebook-catalog-v1`). Em caso de falha de conexão ou timeout de rede, recuperam a versão mais recente em cache; caso não haja versão em cache, retornam uma resposta amigável offline sem travar o aplicativo.
- **RN-05 (Fallback de Navegação SPA):** requisições de navegação HTML que falhem por falta de conexão utilizam a página em cache correspondente ou recorrem ao `index.html` do App Shell, permitindo que a aplicação SPA carregue suas rotas locais mesmo offline.
- **RN-06 (Registro Seguro e Isolamento de Plataforma):** o registro do Service Worker ocorre estritamente na plataforma Web (`Platform.OS === 'web'`), em navegadores que suportam a API (`'serviceWorker' in navigator`) e protocolos seguros (`https:` ou `http://localhost`). Em plataformas nativas (Android/iOS) e ambientes de teste (Node/Vitest), a rotina não executa operações inválidas.
- **RN-07 (Resiliência e Ausência de Exceções Não Tratadas):** qualquer falha no registro ou na execução do Service Worker é capturada silenciosamente ou reportada via logger seguro, nunca impedindo o funcionamento normal da aplicação.

## Critérios de Aceite

1. O arquivo `public/sw.js` existe e é exportado para `dist/sw.js` na execução de `npm run build:web`.
2. O Service Worker intercepta requisições de assets estáticos com a estratégia Stale-While-Revalidate e requisições do catálogo com Network-First e fallback de cache.
3. Quando desconectado da internet, o App Shell e recursos já visitados continuam abrindo sem a tela de erro nativa do navegador.
4. Requisições do catálogo em modo offline utilizam o cache existente ou recebem resposta JSON estruturada amigável sem lançar erro fatal.
5. Versões anteriores de caches locais são eliminadas automaticamente no evento `activate`.
6. A inicialização na web registra o Service Worker de forma segura sem lançar erros em plataformas nativas ou ambientes de teste.
7. O arquivo `public/_headers` contém regras específicas para `/sw.js` com `max-age=0, must-revalidate` e `Service-Worker-Allowed: /`.
8. Todas as regras arquiteturais (`scripts/verificar-arquitetura.mjs`) são respeitadas, mantendo as camadas MVVM intactas.
9. A suíte completa de validação (`npm run validate`) e o build web (`npm run build:web`) passam com 100% de sucesso.

## Validação

- Testes unitários do serviço de PWA cobrindo verificação de suporte, registro com sucesso, tratamento de erro, desregistro e isolamento em plataformas não-web.
- Testes unitários da lógica de classificação de rotas e estratégias de cache do Service Worker cobrindo App Shell, Stale-While-Revalidate, Network-First e respostas offline.
- Teste do componente e hook de registro do Service Worker na árvore do React.
- Validação do build com `expo export --platform web` confirmando a geração de `dist/sw.js` e a preservação das diretivas em `dist/_headers`.
