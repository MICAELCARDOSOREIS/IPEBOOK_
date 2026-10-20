# Estado e continuidade

Documento consolidado de continuidade técnica e produto do Ipebook (Piripiri, PI).

Conferência atual: **2026-10-20** (base: branch `develop`). Projeto: `~/IPEBOOK_`.

---

## 1. Estado Verificado em Execução

Todas as métricas abaixo foram aferidas diretamente por execução dos scripts de validação:

- **Testes automatizados**: **595 testes passando** em **95 arquivos de teste** (`npm test` / `npx vitest run`), cobrindo testes unitários de entidades, validadores, casos de uso, semente de catálogo, adaptadores de dados (memória, Supabase e AsyncStorage), hooks/viewmodels, componentes de interface e cenários de integração ponta a ponta.
- **Cobertura de código**: Acima do limiar estrito de 80% em todas as 4 dimensões (Statements: 89,27%, Branches: 80,19%, Functions: 87,23%, Lines: 90,82%).
- **Integridade arquitetural**: **100% em conformidade** no MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`), verificado pelo comando `npm run check:architecture` (0 violações). Apenas `src/di/container.ts` e testes têm permissão para instanciar ou importar adaptadores de `src/infra/`.
- **Validação de banco e migrações SQL**: 11 migrações executadas e validadas em banco real isolado via PGlite (`npm run test:sql`):
  1. `202610130001_v2_schema.sql` (estrutura inicial de livros e pedidos)
  2. `202610130002_rls_hardening.sql` (políticas de Row Level Security e permissões granulares)
  3. `202610150003_favoritos_alertas.sql` (tabelas de favoritos, alertas de busca e notificações)
  4. `202610170001_denuncias.sql` (tabela de moderação comunitária `v2_reports`)
  5. `202610170002_fotos_anuncios.sql` (colunas de fotos, localidade e categoria em `v2_books`)
  6. `202610170003_pausar_anuncio.sql` (status pausado e restrição de ciclo de vida em `v2_books`)
  7. `202610180001_indices_busca_catalogo.sql` (índices parciais e compostos de performance para vitrine, localização, modalidade e moderação - ADR 0021)
  8. `202610200001_perfil_publico_e_avaliacoes.sql` (tabelas `v2_profiles` e `v2_ratings`, com RLS, para o perfil público do anunciante - Spec 018, Issue #73)
- **Semente Oficial da Beta (`npm run db:seed`)**: Script `scripts/popular-catalogo-piripiri.mjs` gerando 10 anúncios realistas distribuídos pelos bairros de Piripiri, PI com exportação SQL via `--sql`.
- **Backend Supabase ativo**: O backend está configurado com `EXPO_PUBLIC_BACKEND=supabase` em `.env` e `.env.example`, integrado ao projeto oficial `xiuuiggpccpgrwkzeloc`. O histórico de migrações remotas foi reconciliado e `supabase db push` está operando normalmente.
- **Rotas Web compiladas (`npm run build:web`)**: Exportação estática do Expo Router gerou com sucesso o pacote web em `dist/`, totalizando **24 rotas estáticas**:
  - `/` (Catálogo e vitrine inicial com selo da beta em Piripiri, PI)
  - `/perfil/[userId]` (Perfil público, somente leitura, de quem anuncia — nome, avaliação média e negociações concluídas - Spec 018, Issue #73)
  - `/bem-vindo` (Boas-vindas e primeiro acesso com escolha opcional de bairro - Spec 026, ADR 0022)
  - `/pesquisa` (Busca no catálogo por termo e filtros, com histórico recente no dispositivo - Spec 027)
  - `/livro/[id]` (Detalhes completos do anúncio, capa com foto real/fallback, dados do autor e do anunciante)
  - `/anunciar` (Formulário de cadastro de anúncio com upload/remoção de foto e 17 bairros de Piripiri)
  - `/editar-anuncio/[id]` (Edição completa de anúncios cadastrados pelo usuário - Spec 024, ADR 0018)
  - `/meus-anuncios` (Listagem de anúncios do usuário, com opções de editar, pausar/retomar, exclusão confirmada via Diálogo e feedbacks via Snackbar)
  - `/pedidos-recebidos` (Propostas recebidas de interessados, com aceitar e recusar)
  - `/meus-pedidos` (Propostas enviadas pelo usuário)
  - `/negociacao/[id]` (Detalhes do encontro acordado com pontos públicos seguros em Piripiri)
  - `/favoritos` (Livros marcados como favoritos pelo usuário)
  - `/alertas` (Alertas de busca por interesse, com pausa/retomada e exclusão confirmada por Diálogo)
  - `/notificacoes` (Central de notificações com filtros de lidas/não lidas)
  - `/denunciar/[id]` (Formulário de denúncia de anúncio e moderação comunitária - Spec 011)
  - `/ajuda` (Central de ajuda, FAQ e dicas de segurança comunitária em Piripiri)
  - `/termos` (Termos de uso e política de privacidade LGPD)
  - `/excluir-conta` (Direito ao esquecimento LGPD com digitação da palavra EXCLUIR)
  - `/entrar` (Login de usuário com e-mail e senha)
  - `/criar-conta` (Registro de nova conta)
  - `/esqueci-senha` (Solicitação de link de redefinição de senha)
  - `/redefinir-senha` (Definição de nova senha via token)
  - `/+not-found` (Página de rota não encontrada)
  - `/_sitemap` (Mapa de rotas)

---

## 2. Relação entre Telas do Figma e Telas Implementadas

O inventário de design (`design-system/telas-android-figma.md`) lista 137 telas no Figma correspondentes a todos os fluxos conceituais explorados durante a fase inicial de IHC.

No app ativo em desenvolvimento, 21 rotas cobrem as jornadas essenciais da beta. A discrepância numérica entre 137 e 21 decorre de **decisões deliberadas de escopo e arquitetura**, devidamente documentadas em ADRs:

1. **Fluxo 05 · Estante (fora de escopo pelo ADR 0011)**:
   - O Figma previa uma aba "Estante" dedicada à catalogação pessoal de livros lidos/a ler.
   - O ADR 0011 definiu a barra de navegação principal com apenas 3 destinos essenciais: **Início**, **Pesquisa** e **Perfil**, mantendo o foco do Ipebook na circulação e desapego comunitário de livros entre leitores.
2. **Fluxo 06 · Conversa / Chat em Tempo Real (fora de escopo pelo ADR 0011 e Specs 004/009)**:
   - O Figma explorou telas de chat bidirecional instantâneo (`MessageBubble`, etc.).
   - O projeto deliberadamente adotou negociação assíncrona orientada a estados (`pending` → `accepted` / `rejected`), com ponto de encontro público seguro em Piripiri (Praça da Bandeira, Estação Ferroviária, Praça de Eventos) sugerido automaticamente na tela de Negociação (`/negociacao/[id]`). Isso elimina a complexidade, custos e riscos de segurança de um mensageiro em tempo real na versão beta.
3. **Multi-plataforma iOS / Web detalhada (ADR 0008)**:
   - As 144 telas de iPhone (`design-system/telas-iphone-figma.md`) e 126 telas de Web (`design-system/telas-web-figma.md`) foram catalogadas no repositório como inventário de referência para o futuro.
   - O escopo obrigatório da beta é estritamente **Android (Material 3)** e **Web responsiva**, operando sobre a mesma árvore de componentes React Native.

---

## 3. Marcos Consolidados da Trilha Beta (Outubro de 2026)

- **Issue #79 (Migração de moderação)**: Criada a migração `202610170001_denuncias.sql` adicionando a tabela `v2_reports` e políticas de RLS, validada no PGlite.
- **Issue #80 (Reconciliação do histórico do Supabase)**: Histórico remoto corrigido com `supabase migration repair`, desbloqueando `supabase db push`.
- **Issue #81 (Ativação e validação do backend Supabase)**: `EXPO_PUBLIC_BACKEND=supabase` configurado em `.env` e validado com duas contas reais ponta a ponta (`specs/007-contas-persistentes/validacao.md`).
- **Issue #83 (Restrição da beta a Piripiri, PI)**: Criada a Spec 022 e o ADR 0016. Adicionados 17 bairros oficiais em `src/model/entities/location.ts`, validação geográfica e selo visual "Beta exclusiva em Piripiri, PI".
- **Issue #82 (Fotos do anúncio)**: Criada a Spec 023 e o ADR 0017. Migração `202610170002_fotos_anuncios.sql` aplicada; campos `photo_url`, `photos`, `category`, `city`, `state`, `neighborhood` integrados; componentes `BookCover` (com imagem real e fallback determinístico) e `AddPhotoCard` com preview e remoção.
- **Issue #84 (Auditoria de dependências)**: Auditoria técnica documentando que a vulnerabilidade em `shell-quote` pertence exclusivamente a `react-devtools-core` em ambiente local e não compõe o bundle web final. Confirmada a ausência de credenciais Mapbox.
- **Issue #85 (Gates de sessão e cobertura)**: Testes de unidade e componentes cobrindo todos os screen wrappers e gates de autenticação.
- **Issue #88 (Destino Perfil na barra de navegação)**: Corrigido o direcionamento da tab Perfil: implementado suporte a destinos desabilitados com acessibilidade (`accessibilityState={{ disabled: true }}` e rótulo `"Perfil (em breve)"`), evitando erros de rota inexistente enquanto a issue #55 estiver em desenvolvimento.
- **Issue #89 (Componente Dialog e confirmação destrutiva)**: Criado o componente `Dialog` em `src/view/components/Dialog.tsx` conforme `design-system/04-componentes/dialogo.md` (com foco acessível, fechamento pelo botão voltar, alvo de 48 dp e variantes neutra e destrutiva). Integrado na tela `MyListings` (com mensagem de êxito) e na tela `SearchAlerts`.
- **Issue #86 (Spine de Arquitetura e Higiene do Repositório)**: Integrado o spine de arquitetura com 20 invariantes (`docs/arquitetura/architecture-ipebook/`), limpos worktrees e eliminadas 15 branches obsoletas.
- **Issue #90 (Formulários do anúncio e design system)**: Concluída, integrada e fechada. Campos alinhados com tokens e validação de bairros de Piripiri.
- **Issue #91 (Editar e pausar anúncio)**: Concluída, integrada e fechada. Spec 024 e ADR 0018 criados. Migração `202610170003_pausar_anuncio.sql` aplicada.
- **Issue #92 (Alinhamento do design system às telas reais e ao Figma)**: Concluída, integrada e fechada. Spec 006 revisada, ADR 0019 criado, componentes `Tag` e `Snackbar` implementados com acessibilidade.
- **Issue #87 (Preparação para publicação Web no Cloudflare Pages)**: Concluída e integrada. Spec 025 e ADR 0020 criados, remoção de `vercel.json`, criação de `public/_headers`, `public/_redirects` e `docs/implantacao-cloudflare.md`.
- **Issue #95 (Editar alerta de busca)**: Concluída e integrada via PR #99. Permite alterar termo de alerta existente na rota `/alertas`.
- **Issue #96 (Auditoria de acessibilidade das telas)**: Concluída e integrada via PR #101. Auditoria documentada em `docs/auditoria-acessibilidade.md`, derivando as issues corretivas #104, #105 e #106 (as três corrigidas; PRs #110, #113 e #111 aguardando revisão/merge).
- **Issue #76 (Spec 021 — Estados globais de carregamento e erro)**: Implementada. Componentes `LoadingState`, `ErrorState` e `OfflineState` reaproveitáveis (`design-system/04-componentes/estados-do-sistema.md`), detecção real de conectividade via `@react-native-community/netinfo` (ADR 0028) e hook `useAsyncState` disponível para ViewModels futuros. Aplicada em home, favoritos, meus anúncios, notificações, pedidos (recebidos/enviados) e pesquisa.
- **Issue #98 (Boas-vindas e primeiro acesso)**: Concluída e integrada via PR #102. Spec 026 e ADR 0022 criados. Rota `/bem-vindo`, persistência de primeiro acesso no dispositivo e escolha de bairro de Piripiri.
- **Issue #108 / #94 (Histórico de buscas recentes e desambiguação de spec)**: Concluída e integrada via PR #100. Spec numerada como 027 para evitar colisão com a spec 026. Armazenamento no dispositivo via `AsyncStorage`, isolado por conta e limpo ao excluir a conta.
- **Alinhamento das telas de autenticação ao Figma (US1 e US2 / Micael)**: Concluído e integrado. Telas de Entrar (`01.02`), Criar conta (`01.03`), Recuperar acesso (`01.04`), Confira seu e-mail (`01.05`) e Nova senha (`01.06` e `01.07`) alinhadas às especificações do Figma Android Material 3 e Web Responsivo, com `TopAppBar`, cards centralizados responsivos, confirmação de senha e validação interativa comprovada via ADB no dispositivo físico Android.
- **Issue #73 (Perfil público do anunciante e fotos do anúncio)**: Spec 018 implementada. Rota `/perfil/[userId]` (somente leitura: nome, avaliação média ou "Sem avaliações ainda", negociações concluídas) acessível a partir do detalhe do anúncio; galeria de fotos em tela cheia como modal em `bookDetail.tsx`, sem ação quando o anúncio só tem capa ilustrativa. Migração `202610200001_perfil_publico_e_avaliacoes.sql` (`v2_profiles`, `v2_ratings`). Limitações registradas em `specs/018-perfil-publico-do-anunciante-e-fotos/validacao.md` (nome padrão até a edição de perfil #55/#56; sem fluxo de avaliação ainda).
- **Issue #115 (Exclusão definitiva de conta no Supabase / LGPD)**: Concluída e integrada via PR #118. Migração `202610200002_rpc_exclusao_conta.sql` com função `security definer` `public.delete_user_account` com verificação estrita `auth.uid() = target_user_id` e exclusão atômica em cascata (anúncios, pedidos, favoritos, alertas, denúncias, notificações e usuário em `auth.users`).
- **Issue #116 (Storage — Bucket `book-photos` e Políticas de RLS)**: Concluída e integrada via PR #119. Migração `202610200003_storage_book_photos.sql` criando o bucket público com limite de 5MB e formatos de imagem permitidos, com políticas RLS estritas de upload e exclusão pelo proprietário (`storage.foldername(name)[1] = auth.uid()::text`). Contrato `IPhotoStorageDataSource`, adaptadores Supabase/Memória e testes unitários.
- **Issue #117 (Performance — Paginação no catálogo de livros)**: Concluída e integrada via PR #120. Parâmetros opcionais `limit` e `offset` implementados em `IBookDataSource` e `IBookUseCases`, com cláusula `.range()` no Supabase (limite padrão 20) e testes cobrindo fatiamento e limites.
- **Issue #121 (Web/PWA — Web App Manifest e meta tags para instalação)**: Concluída e integrada via PR #122. Criação de `public/manifest.json` com metadados do IpêBook (`#0D47A1` / `#F6F1E8`), suporte standalone, injeção de `<html lang="pt-BR">` e meta tags via `src/app/+html.tsx`, cabeçalhos MIME em `public/_headers` e validação com `npm run build:web`.
- **Issue #123 (Operação — Health check do Supabase em tempo real)**: Concluída e integrada via PR #124. Script seguro `scripts/verificar-saude-supabase.mjs` acessível via `npm run health:supabase`, verificando credenciais, latência de resposta, conectividade com PostgREST e bucket `book-photos`.
- **Issue #126 (CI/CD — Pipeline de validação contínua com GitHub Actions)**: Concluída e integrada via PR #131. Refatoração de `.github/workflows/validacao.yml` com acionamento em `main` e `develop` e steps granulares e transparentes.
- **Issue #127 (Banco de Dados — Busca textual com extensão pg_trgm e índices)**: Concluída e integrada via PR #132. Migração `202610200004_extensao_pg_trgm_indices.sql` com índice composto `idx_v2_books_title_author_pattern` e bloco resiliente de ativação de `pg_trgm` e índice GIN no Supabase.
- **Issue #128 (Segurança / LGPD — Exportação e portabilidade de dados do usuário)**: Concluída e integrada via PR #133. Implementação de `UserExportData`, `IUserDataExportDataSource`, `UserDataExportUseCases`, adaptadores em memória e Supabase e injeção em `container.ts`.
- **Issue #129 (Infra / Otimização — Serviço de validação de imagens antes do upload)**: Concluída e integrada via PR #134. Implementação de `ImageOptimizationService` com checagem de tamanho (5 MB), formatos permitidos (JPEG, PNG, WebP) e sanitização contra path traversal.
- **Issue #130 (Segurança / Domínio — Sanitização contra injeção em campos de texto)**: Concluída e integrada via PR #135. Validador `textSanitizer.ts` neutralizando scripts, tags HTML e caracteres de controle em títulos, autores, bairros e denúncias comunitárias.
- **Trilha de Resiliência, Infra e Segurança (Micael — Outubro de 2026)**:
  - **ADRs 0023 a 0027**: Formalizadas as decisões arquiteturais de CI no GitHub Actions (0023), busca acelerada `pg_trgm` (0024), portabilidade LGPD (0025), sanitização preventiva (0026) e resiliência/logging/rate limiting/release (0027).
  - **Logging Estruturado e Sanitizado (`SafeLogger`)**: Implementação de `ILogger` em `src/infra/services/safeLogger.ts` com mascaramento automático de senhas, JWTs e chaves sensíveis contra vazamento de dados pessoais.
  - **Rate Limiting no Cliente (`ClientRateLimiter`)**: Algoritmo de janela deslizante (sliding window) em `src/infra/services/clientRateLimiter.ts` protegendo formulários contra múltiplos cliques e requisições repetidas.
  - **Cache Resiliente Offline-first (`CachedBookDataSource`)**: Decorator em `src/infra/datasources/cachedBookDataSource.ts` com fallback automático via `AsyncStorage` caso haja falha de conexão, garantindo exibição de anúncios sem rede.
  - **Script de Verificação Pré-deploy (`npm run verify:release`)**: Script consolidado em `scripts/verificar-release.mjs` que valida sequencialmente `.env.example`, TypeScript, 7 camadas arquiteturais, 11 migrações SQL com RLS, testes unitários, build estático web e arquivos de distribuição em `dist/`.

---

## 4. Situação das Issues da Trilha

### Issues Abertas

1. **#109 (Comprovar publicação e fluxo Web no Cloudflare Pages)**:
   - **Situação**: A infraestrutura de build e cabeçalhos está pronta e validada localmente (`dist/`, `public/_headers`, `public/_redirects`, ADR 0020, spec 025). Falta a comprovação em ambiente de destino (projeto Cloudflare Pages, domínio e verificação pós-deploy), que depende de ações e credenciais externas do responsável. Enquanto não comprovada em URL pública, o estado permanece como "preparado para publicação".
2. **#104, #105, #106 (Acessibilidade)**:
   - Correções de semântica de abas (#106, PR #111), foco de teclado em diálogos (#105, PR #113) e associação de erros em formulários (#104, PR #110), identificadas na auditoria #96 (atribuídas a Maria Clara). Implementadas e validadas localmente; aguardando revisão/merge em `develop`.
3. **#93 (Filtrar e ordenar o catálogo de livros)**:
   - Refinamento de busca por categoria, modalidade e ordenação.
4. **#55 (Perfil do usuário)**:
   - Edição do próprio perfil/configurações (fluxo 07), ainda não implementada. A visão pública
     de leitura (issue #73) foi concluída separadamente (ver Seção 3).

---

## 5. Rastreabilidade das Especificações

- `specs/001-estrutura-mvvm/`: Fundação arquitetural do Ipebook em 7 camadas.
- `specs/002-estrategia-testes/`: Estratégia de testes ISO/IEC 25010 e cobertura mínima de 80%.
- `specs/003-autenticacao-e-cadastro-de-anuncio/`: Cadastro de livro, autenticação básica e listagem na vitrine.
- `specs/004-negociacao-simples/`: Negociação simples (solicitação e resposta) com reserva atômica de concorrentes.
- `specs/005-catalogo-de-livros/`: Catálogo de livros e visualização de itens disponíveis.
- `specs/006-redesign-v1-design-system/`: Design system Material 3, tokens e auditoria de acessibilidade.
- `specs/007-contas-persistentes/`: Persistência no Supabase com RLS e validação multi-contas.
- `specs/008-meus-anuncios/`: Gestão dos próprios anúncios com indicadores de status.
- `specs/009-detalhes-negociacao-encontro/`: Ponto de encontro comunitário seguro em Piripiri.
- `specs/010-termos-e-privacidade/`: Conformidade LGPD e regras da comunidade.
- `specs/011-denuncia-anuncio/`: Moderação comunitária de anúncios impróprios.
- `specs/012-central-ajuda-faq/`: FAQ, categorias e guia de segurança.
- `specs/013-cancelar-anuncio/`: Cancelamento de anúncio com proteção de posse e integridade referencial.
- `specs/014-exclusao-conta/`: Direito ao esquecimento LGPD com confirmação textual.
- `specs/015-central-notificacoes/`: Notificações transacionais com filtros de lidas.
- `specs/016-favoritos-e-alertas-de-busca/`: Favoritos e alertas com gatilho transacional no banco.
- `specs/017-rascunhos-de-anuncio/`: (Escopo levantado, encerrado como não planejado para a beta).
- `specs/018-perfil-publico-do-anunciante-e-fotos/`: Perfil público do anunciante.
- `specs/019-compartilhar-anuncio/`: Compartilhamento de anúncio (Issue #74, implementado).
- `specs/020-permissoes-da-plataforma/`: (Escopo levantado, encerrado como não planejado para a beta).
- `specs/021-estados-globais-de-carregamento-e-erro/`: Tratamento global de carregamento, sem conexão e erro (Issue #76, implementado, ADR 0028).
- `specs/022-restricao-geografica-piripiri/`: Restrição da beta à cidade de Piripiri, PI e seus bairros.
- `specs/023-fotos-do-anuncio/`: Upload de fotos, armazenamento em bucket público do Supabase Storage e capas de livro.
- `specs/024-editar-e-pausar-anuncio/`: Edição de anúncio e controle de status de pausa temporária.
- `specs/025-publicacao-web-cloudflare-pages/`: Configuração de build, roteamento SPA e cabeçalhos para Cloudflare Pages.
- `specs/026-boas-vindas-primeiro-acesso/`: Boas-vindas e primeiro acesso ao app com escolha opcional de bairro (ADR 0022).
- `specs/027-historico-buscas-recentes/`: Histórico de buscas recentes salvo no dispositivo via `AsyncStorage` (Issue #94, PR #100).
