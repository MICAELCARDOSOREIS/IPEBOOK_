# Spec 138 — Suíte de Testes E2E Web via Chrome CDP (sem Playwright)

- **Status:** Concluída
- **Data:** 2026-11-17
- **ADR relacionado:** [ADR 0112 — Testes E2E Web com Chrome CDP nativo](../../docs/adr/0112-e2e-web-cdp.md)

## 1. Objetivo

Estabelecer uma suíte automatizada, reproduzível e versionada de testes End-to-End (E2E) para a versão Web do IpêBook, executada em navegador real (`google-chrome --headless=new`) por meio do Chrome DevTools Protocol (CDP) puro em Node.js 24, sem uso de Playwright nem dependências externas.

## 2. Escopo

- Exportação Web dedicada em modo memória (`EXPO_PUBLIC_BACKEND=memory`) para `dist-e2e/` (ignorado no Git).
- Servidor HTTP estático local servindo `dist-e2e/` com suporte a rotas estáticas do Expo Router e fallback SPA (`index.html`).
- Cliente CDP minimalista em `tests/e2e/cdp.mjs` (WebSocket nativo do Node 24) com utilitários de navegação, espera por texto/seletor, preenchimento de campos via `Input.insertText` compatível com React 19 / React Native Web, clique por coordenadas reais via `Input.dispatchMouseEvent`, simulação de estado online/offline (`Network.emulateNetworkConditions` + `navigator.onLine`), verificação de ausência de erros JS/console e captura de tela em falhas.
- Suíte de 7 cenários E2E em `tests/e2e/run.mjs` cobrindo os fluxos críticos do usuário com navegação SPA pela interface real:
  1. **Boas-vindas, catálogo público (Desktop 1440×900 e Mobile 390×844), busca e detalhe:** abertura de Boas-vindas em Desktop e Mobile sem transbordamento horizontal, navegação para `/pesquisa` pública em Mobile e Desktop, busca textual por `"Dom Casmurro"` e abertura do detalhe (`/livro/[id]`).
  2. **Cadastro, edição de perfil e limpeza de histórico em configurações:** fluxo completo de Boas-vindas -> `/criar-conta`, dispensa do diálogo explicativo de notificações (`"Avisos no seu celular"` -> `"Agora não"`), edição de nome público no perfil e limpeza de histórico de buscas nas configurações.
  3. **Publicação em 3 etapas, pausa/retomada, edição e exclusão na Estante:** criação de anúncio em `/anunciar`, conferência em `/meus-anuncios`, pausa e retomada em `/gerenciar-anuncio/[id]`, edição de título em `/editar-anuncio/[id]` e exclusão confirmada.
  4. **Favoritar livro no detalhe, conferir em Favoritos e remover:** marcação de `"O Pequeno Príncipe"` como favorito, verificação em Favoritos e remoção retornando ao estado vazio.
  5. **Enviar pedido de livro e cancelar em Conversas:** solicitação de negociação em `"O Pequeno Príncipe"` e cancelamento confirmado em Conversas (`/meus-pedidos`).
  6. **Ciclo completo entre 2 contas na mesma sessão SPA:** Conta A publica livro -> sai -> Conta B cria conta e envia pedido -> sai -> Conta A entra, aceita o pedido, envia mensagem no chat e convida encontro em ponto seguro -> sai -> Conta B confirma encontro no chat embutido -> sai -> Conta A gera código de entrega de 8 caracteres -> sai -> Conta B confirma entrega pelo código e envia avaliação de 5 estrelas.
  7. **Resiliência offline/online e banner de conexão:** simulação CDP de desconexão exibindo `"Sem conexão com a internet"` e ocultação automática ao reconectar.
- Integração no CI (`.github/workflows/validacao.yml`) com `npm run test:e2e:build`.

### Fora de escopo

- Execução contra o projeto Supabase remoto de produção/homologação (a suíte roda de forma isolada em modo memória).
- Fluxos E2E nativos Android com Maestro (pendentes de dispositivo/emulador conectado).

## 3. Critérios de Aceite

- **CA01 (Zero Playwright):** Nenhuma dependência ou referência de execução a Playwright; apenas Node 24 + `google-chrome` via CDP.
- **CA02 (Build isolada):** `dist-e2e/` é gerado com `EXPO_PUBLIC_BACKEND=memory` sem alterar `.env` nem sobrescrever `dist/` de produção.
- **CA03 (Fluxos críticos verdes):** Todos os 7 cenários E2E passam em execução sequencial limpa, sem erros não tratados no navegador (`Runtime.exceptionThrown` / `console.error` inesperado).
- **CA04 (Responsividade básica):** O catálogo inicial é validado tanto em viewport Desktop (`1440×900`) quanto Mobile (`390×844`) sem transbordamento horizontal.
- **CA05 (Diagnóstico em falha):** Qualquer falha salva screenshot e log do console em `coverage/e2e-falhas/` e encerra o processo com código diferente de zero, sem deixar processos Chrome órfãos.
- **CA06 (Integração no repositório e CI):** `npm run validate` continua passando e `.github/workflows/validacao.yml` executa `npm run test:e2e:build`.

## Correções da auditoria web de 21/11/2026

- O logotipo do cabeçalho desktop é um link para o início e pode ser acionado por teclado.
- Ao abrir uma página protegida sem sessão na Web, a entrada e o cadastro preservam o caminho interno e a consulta. O retorno do OAuth lê o mesmo destino no armazenamento temporário da aba. O fluxo de boas-vindas continua exibido na primeira abertura do início.
- Cada página Web apresenta um marco de conteúdo principal. Rotas dinâmicas, retorno de autenticação e endereço inexistente têm títulos descritivos. Após carregar um livro, seu título continua identificando o detalhe na aba do navegador.
- A 320 px, a orientação do campo de pesquisa e o título da seção da página inicial cabem na tela. Os locais dos cartões podem usar mais de uma linha.
- Validar os fluxos no Chrome com contas em memória e os títulos de rota no Jest. O HTTP 500 observado uma vez no servidor de desenvolvimento ficou fora do escopo desta correção.
