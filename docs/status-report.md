# Status Report Completo — Ipebook

**Data:** 12 de novembro de 2026  
**Versão:** `0.2.0` (`package.json`)  
**Branch ativa:** `develop` (sincronizada com `origin/develop` em `65517355`, com alterações locais da Spec 118 em working tree)

---

## 1. Resumo Executivo (3P)

- **Progresso:** O Ipebook chegou à versão `0.2.0` com **46 rotas**, **43 migrações SQL aplicadas no Supabase remoto (43/43)**, **2.324 testes automatizados** e cobertura de **90,99% de statements**. No ciclo de 01/11 a 12/11/2026 foram entregues: adequação do PWA no iPhone/Safari ao Apple HIG (Spec 136), remoção de `@rnmapbox/maps`, correção de `/auth/callback`, quitação das dívidas de DI e tamanho de telas (Spec 126), design harmonioso de erros (Spec 131), cadastro dos moderadores no Supabase (Spec 102) e ajuste do compartilhamento direto via WhatsApp (Spec 118, em working tree).
- **Planos:** Consolidar e commitar as alterações locais da Spec 118 após `npm run validate`, atualizar a publicação Web no Cloudflare Pages (`https://ipebook.app`), gerar a build Android `0.2.0` para o beta na Play Store e concluir o teste ponta a ponta com duas contas em aparelho real.
- **Problemas e Riscos:** Há 20 arquivos modificados e 2 itens não rastreados no working tree; a cobertura de *branches* está com margem estreita (**80,22%** para mínimo de 80%); a publicação Web em `https://ipebook.app` precisa ser atualizada; e restam validações em build nativa de produção (Sentry, Google Sign-In, `expo-updates` e QR Code).

---

## 2. Tudo o que Já Temos Implementado

### 2.1 Capacidades do Produto
- **Acesso e Onboarding:** cadastro, login por e-mail/senha, login nativo com Google (`signInWithIdToken` no Android + fallback navegador), recuperação/redefinição de senha, exclusão de conta (com limpeza de fotos no Storage), tela de boas-vindas com seleção de local (`/bem-vindo`) e página pública de convite ao beta (`/beta`).
- **Catálogo, Descoberta e Busca:** tela inicial comunitária com carrossel hiperlocal de Piripiri, PI (17 bairros / Pontos Seguros), busca com filtros por modalidade (*Venda*, *Troca*, *Doação*, *Boxes e coleções*), ordenação avançada, histórico recente no dispositivo, favoritos privados e alertas de busca configuráveis.
- **Publicação e Estante:** fluxo em 3 passos (`/anunciar`) com suporte a até 3 fotos (*Capa*, *Lombada*, *Verso*), redução automática de imagens (1080 px), leitura de código de barras / consulta por ISBN, suporte a boxes de múltiplos volumes (2 a 100), rascunhos locais (`/rascunhos`), edição, pausa/retomada e gerenciamento de anúncios (`/meus-anuncios`, `/gerenciar-anuncio/[id]`).
- **Negociação, Chat, Encontro e Entrega:** modal de proposta com mensagem inicial e seleção de livro para troca, reserva atômica de concorrentes, lista de conversas em tempo real (`supabase_realtime`), chat interno com linha do tempo e cartão de status, agendamento nos Pontos Seguros de Piripiri com mapa e horários de expediente, entrega presencial confirmada por **QR Code** (ou código de 8 caracteres), avaliação mútua (1 a 5 estrelas) e pedido de nota na loja (`expo-store-review`).
- **Notificações, Compartilhamento e PWA:** notificações push locais e remotas com canais por categoria e preferências (`muted_types`), pré-visualização rica Open Graph em links compartilhados (`functions/livro/[id].ts`), compartilhamento em 1 toque no WhatsApp e PWA responsivo com suporte a tema claro/escuro e conformidade Apple HIG no iOS/Safari.
- **Segurança, Moderação e Observabilidade:** RLS no Supabase, limites anti-abuso no banco (`IBLIM`), sanitização de entradas, bloqueio mútuo de usuários, denúncia de anúncios e pessoas, fila de moderação (`/moderacao`), Sentry (`IErrorReporter`) e `expo-updates`.

### 2.2 Arquitetura e Stack
- **Stack principal:** React Native `0.88.1`, Expo `~58.0.24`, Expo Router `~58.0.31`, TypeScript `~6.0.3`, Supabase (`@supabase/supabase-js` `^2.117.3`), Biome `^2.6.5`, Vitest `^5.0.1` e PGlite `^0.5.8`.
- **Arquitetura MVVM em 7 camadas:** `src/view/` desacoplada por contratos de `src/viewmodel/` (50 ViewModels recebendo dependências via fábrica `make*` em `src/di/container.ts`, 0 exceções) e `501` arquivos com grafo de imports limpo.

---

## 3. Fluxos de Janelas e Rotas (`46 rotas` em `src/app/`)

### 3.1 Fluxo de Acesso e Descoberta
`[ /bem-vindo ]` → `[ / (Início) ]` ↔ `[ /pesquisa ]` → `[ /livro/[id] ]` → *(Compartilhar WhatsApp / Favoritar / Solicitar)*  
↘ `[ /entrar | /criar-conta | /esqueci-senha | /redefinir-senha ]` ↔ `[ /auth/callback ]`

### 3.2 Fluxo de Publicação e Estante
`[ /meus-anuncios (Estante) ]` → `[ /anunciar (3 passos + Scanner ISBN) ]` → *(Sucesso / WhatsApp)*  
↳ `[ /rascunhos ]` · `[ /editar-anuncio/[id] ]` · `[ /gerenciar-anuncio/[id] ]`

### 3.3 Fluxo de Negociação, Encontro e Entrega
`[ /livro/[id] ]` → *(ProposalSheet: mensagem + livro de troca)* → `[ /conversas | /meus-pedidos | /pedidos-recebidos ]`  
→ `[ /negociacao/[id] | /conversa/[id] ]` *(Chat em tempo real + Aceite/Recusa)*  
→ `[ /negociacao/[id]/encontro ]` *(Ponto Seguro em Piripiri + Data/Hora)*  
→ `[ /negociacao/[id]/entrega ]` *(QR Code / Código 8 dígitos)* → *(Avaliação mútua 1–5★ + Store Review)*

### 3.4 Fluxo de Perfil, Alertas, Segurança e Suporte
- **Perfil:** `[ /perfil ]` → `[ /perfil/editar ]` · `[ /perfil/[userId] ]` · `[ /perfil/avaliacoes ]` · `[ /perfil/encontros ]` · `[ /perfil/convidar ]`
- **Alertas e Avisos:** `[ /favoritos ]` · `[ /alertas ]` → `[ /alertas/[id] ]` → `[ /alertas/[id]/editar ]` · `[ /notificacoes ]`
- **Configurações, Segurança e Moderação:** `[ /perfil/configuracoes ]` → `[ /perfil/seguranca ]` · `[ /perfil/bloqueados ]` · `[ /excluir-conta ]` · `[ /moderacao ]` · `[ /denunciar/[id] ]` · `[ /denunciar-pessoa/[userId] ]`
- **Institucional e Beta:** `[ /ajuda ]` · `[ /sobre ]` · `[ /termos ]` · `[ /beta ]`

---

## 4. Métricas Técnicas Atuais (`docs/estado.md`)

| Indicador | Valor Atual | Observação |
| :--- | :--- | :--- |
| **Testes automatizados** | **2.325 testes** em **321 arquivos** | Vitest + Testing Library |
| **Cobertura — Statements / Lines** | **90,99%** / **92,43%** | — |
| **Cobertura — Functions / Branches** | **87,79%** / **80,22%** | Branches com margem estreita (mín. 80%) |
| **Arquitetura (imports)** | **501 arquivos limpos** | 0 exceções em ViewModels e tamanho de Views |
| **Rotas estáticas** | **46 rotas** | Expo Router (`src/app/**`) |
| **Especificações / ADRs** | **135 specs** e **109 ADRs** | Sem colisão de numeração |
| **Migrações Supabase** | **43 migrações (43/43 remotas)** | Validadas com PGlite (`npm run test:sql`) |

---

## 5. Pendências e Próximos Passos

- **Working tree e qualidade:** revisar o diff da Spec 118, rodar `npm run validate` completo e commitar na branch `develop`; ampliar margem de *branches* acima de 80%.
- **Publicação Web:** rodar `npm run build:web` e atualizar o Cloudflare Pages (`https://ipebook.app`) para servir as correções recentes de Open Graph e PWA.
- **Lançamento Beta Android (`docs/produto.md`):** gerar build `0.2.0`, testar fluxo completo com duas contas em aparelho real (pedido, chat, encontro, QR, avaliação, avisos, moderação, Sentry e Google Sign-In), publicar na Play Store (`docs/loja/beta-play-store.md`), concluir revisão jurídica dos Termos/Privacidade em link público e avaliar métricas de uso (PostHog) / Supabase separado de testes.
