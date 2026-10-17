# Estado e continuidade

Documento consolidado de continuidade técnica e produto do Ipebook (Piripiri, PI).

Conferência atual: **2026-10-17** (base: branch `develop`). Projeto: `~/IPEBOOK_`.

---

## 1. Estado Verificado em Execução

Todas as métricas abaixo foram aferidas diretamente por execução dos scripts de validação:

- **Testes automatizados**: **428 testes passando** em **71 arquivos de teste** (`npm test` / `npx vitest run`), cobrindo testes unitários de entidades, validadores, casos de uso, adaptadores de dados (memória e Supabase), hooks/viewmodels, componentes de interface e cenários de integração ponta a ponta (SC-001, SC-002, autenticação, recuperação de senha, moderação, pausa e edição).
- **Cobertura de código**: Acima do limiar estrito de 80% em todas as 4 dimensões (Statements: > 89%, Branches: > 81%, Functions: > 85%, Lines: > 90%).
- **Integridade arquitetural**: **100% em conformidade** no MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`), verificado pelo comando `npm run check:architecture` (0 violações). Apenas `src/di/container.ts` e testes têm permissão para instanciar ou importar adaptadores de `src/infra/`.
- **Validação de banco e migrações SQL**: 6 migrações executadas e validadas em banco real isolado via PGlite (`npm run test:sql`):
  1. `202610130001_v2_schema.sql` (estrutura inicial de livros e pedidos)
  2. `202610130002_rls_hardening.sql` (políticas de Row Level Security e permissões granulares)
  3. `202610150003_favoritos_alertas.sql` (tabelas de favoritos, alertas de busca e notificações)
  4. `202610170001_denuncias.sql` (tabela de moderação comunitária `v2_reports`)
  5. `202610170002_fotos_anuncios.sql` (colunas de fotos, localidade e categoria em `v2_books`)
  6. `202610170003_pausar_anuncio.sql` (status pausado e restrição de ciclo de vida em `v2_books`)
- **Backend Supabase ativo**: O backend está configurado com `EXPO_PUBLIC_BACKEND=supabase` em `.env` e `.env.example`, integrado ao projeto oficial `xiuuiggpccpgrwkzeloc`. O histórico de migrações remotas foi reconciliado e `supabase db push` está operando normalmente.
- **Rotas Web compiladas (`npm run build:web`)**: Exportação estática do Expo Router gerou com sucesso o pacote web em `dist/`, totalizando **22 rotas estáticas**:
  - `/` (Catálogo e vitrine inicial com selo da beta em Piripiri, PI)
  - `/pesquisa` (Busca no catálogo por termo e filtros)
  - `/livro/[id]` (Detalhes completos do anúncio, capa com foto real/fallback, dados do autor e do anunciante)
  - `/anunciar` (Formulário de cadastro de anúncio com upload/remoção de foto e 17 bairros de Piripiri)
  - `/editar-anuncio/[id]` (Edição completa de anúncios cadastrados pelo usuário)
  - `/meus-anuncios` (Listagem de anúncios do usuário, com opções de editar, pausar/retomar, exclusão confirmada via Diálogo e feedbacks via Snackbar)
  - `/pedidos-recebidos` (Propostas recebidas de interessados, com aceitar e recusar)
  - `/meus-pedidos` (Propostas enviadas pelo usuário)
  - `/negociacao/[id]` (Detalhes do encontro acordado com pontos públicos seguros em Piripiri)
  - `/favoritos` (Livros marcados como favoritos pelo usuário)
  - `/alertas` (Alertas de busca por interesse, com pausa/retomada e exclusão confirmada por Diálogo)
  - `/notificacoes` (Central de notificações com filtros de lidas/não lidas)
  - `/denunciar/[id]` (Formulário de denúncia de anúncio e moderação comunitária)
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

---

## 4. Pendências Reais da Beta

As únicas tarefas abertas necessárias para a conclusão da versão beta são:

1. **#87 (Publicação da Web no Cloudflare Pages)**: Configurar e validar o deploy do bundle gerado em `dist/` no Cloudflare Pages.
2. **#90 (Alinhamento dos campos da tela de anunciar ao design system)**: Substituir inputs simples por componentes de formulário do design system (seleção de modalidade, categoria e bairros de Piripiri).
3. **#91 (Editar e pausar anúncio: modelo e interface)**: Permitir alterar dados e alternar o status do anúncio entre disponível e pausado sem precisar excluí-lo.
4. **#92 (Alinhamento do design system)**: Suprir componentes pendentes documentados em `design-system/04-componentes/` (ex: `Snackbar`, `Badge`).
5. **#94 (Histórico de buscas recentes)**: Persistência local das últimas buscas com opção de limpeza confirmada via `Dialog`.
6. **#55 (Tela de perfil do usuário - Maria Clara)**: Implementação da rota `/perfil` conforme spec 006.

---

## 5. Rastreabilidade das Especificações

- `specs/001-estrutura-mvvm/`: Fundação arquitetural do Ipebook em 7 camadas.
- `specs/002-estrategia-testes/`: Estratégia de testes ISO/IEC 25010 e cobertura mínima de 80%.
- `specs/003-autenticacao-e-cadastro-de-anuncio/`: Cadastro de livro, autenticação básica e listagem na vitrine.
- `specs/004-negociacao-simples/`: Negociação simples (solicitação e resposta) com reserva atômica de concorrentes.
- `specs/007-contas-persistentes/`: Persistência no Supabase com RLS e validação multi-contas.
- `specs/008-meus-anuncios/`: Gestão dos próprios anúncios com indicadores de status.
- `specs/009-detalhes-da-negociacao/`: Ponto de encontro comunitário seguro em Piripiri.
- `specs/010-termos-e-privacidade/`: Conformidade LGPD e regras da comunidade.
- `specs/011-denuncia-de-anuncio/`: Moderação comunitária de anúncios impróprios.
- `specs/012-central-de-ajuda-e-faq/`: FAQ, categorias e guia de segurança.
- `specs/013-cancelar-anuncio/`: Cancelamento de anúncio com proteção de posse e integridade referencial.
- `specs/014-exclusao-de-conta/`: Direito ao esquecimento LGPD com confirmação textual.
- `specs/015-central-de-notificacoes/`: Notificações transacionais com filtros de lidas.
- `specs/016-favoritos-e-alertas-de-busca/`: Favoritos e alertas com gatilho transacional no banco.
- `specs/017-rascunhos-de-anuncio/`: (Escopo levantado, encerrado como não planejado para a beta).
- `specs/020-permissoes-da-plataforma/`: (Escopo levantado, encerrado como não planejado para a beta).
- `specs/022-restricao-geografica-piripiri/`: Restrição da beta à cidade de Piripiri, PI e seus bairros.
- `specs/023-fotos-do-anuncio/`: Upload de fotos, armazenamento em bucket público do Supabase Storage e capas de livro.
