# Estado e continuidade

Documento consolidado de continuidade técnica e produto do Ipebook (Piripiri, PI).

Conferência atual: **2026-10-22** (branch `feature/relaxed-thompson-60m08j`, derivada de `develop`).

**Spec 052 validada localmente (Issue #188; criada como 044 e renumerada porque o número passou a ser da spec de alinhamento complementar):** a negociação aceita ganhou o encontro combinado
(Figma `06.04`, `06.05`, `06.11`–`06.14`): convite com local entre os pontos seguros, dia nos próximos
sete dias e faixa de horário; confirmação só pela outra pessoa; reagendamento que volta a aguardar
confirmação; cancelamento com diálogo; aviso `meeting_update` a cada mudança. Nova tabela
`v2_meetings` com RLS e gatilhos (ADR 0036). `npm run validate` passou com 1032 testes em 145
arquivos, já sobre o `develop` com a renumeração das specs (#191); fluxo completo conferido com dois usuários no app compilado para a Web
(`specs/052-combinar-encontro/validacao.md`). Supabase remoto: aplicadas em 2026-10-22 as
migrações `202610200007`, `202610200008`, `202610210001` e `202610210002`; a remoção
das duas políticas substituídas pela `202610200008` foi feita depois (ver "Supabase remoto" abaixo);
a `202610220001_encontros.sql` segue conforme a T012 da Spec 052. Conferência no aparelho Android pendente.

**Higiene da numeração de specs (2026-10-21):** oito pastas de `specs/` dividiam número com outra
spec (031, 032, 033, 038, 039, 040 e 041). Foram renumeradas para 044–051, mantendo o número original
nas specs mais antigas ou mais citadas pelo código: 031 limite de tentativas → fica; 044 alinhamento
complementar (era 031); 045 melhorias das telas (era 032); 046 estados do fluxo de acesso (era 033);
047 métricas da beta (era 038); 048 perfil hub (era 039); 049 saúde e migrações do Supabase remoto
(era 039); 050 compartilhar no WhatsApp (era 040); 051 seções da Home (era 041). Mensagens de commit
anteriores continuam citando os números antigos; consultar o mapa acima. Regra para evitar nova colisão
no `CONTRIBUTING.md`.

**Verificação (2026-10-21):** `npm run validate` passou com **969 testes em 134 arquivos** (cobertura:
92,68% statements, 84,50% branches, 90,21% functions, 93,84% lines). `npm run verify:release` passou
com 31 rotas Web. Foram acrescentados testes de hook para `useFavoritesViewModel`,
`useFavoriteButtonViewModel` e `useSearchAlertsViewModel`, antes com a cobertura mais baixa.

**Supabase remoto — migrações 202610200007 a 202610210002 sincronizadas (2026-10-22):** as 4 migrações mais recentes (`202610200007`,
`202610200008`, `202610210001`, `202610210002`) já estavam aplicadas no banco com versões de
histórico diferentes (`20261022…`), o que fazia o diagnóstico acusar pendência indevida. O SQL
registrado no remoto foi comparado com os arquivos locais: idêntico em duas, e nas outras duas
só diferia na ordem dos comandos. Para igualar o esquema ao da migração local, foram removidas duas
políticas RLS antigas que ela manda descartar (`usuário só cria avaliação em seu próprio nome` e
`Dono responde pedido desta versão`), pois a permissiva antiga anulava a regra nova (aceite só pela RPC
`accept_book_request`; avaliação só entre as partes de um pedido aceito). O histórico foi reconciliado
com `supabase migration repair` e `npm run health:supabase:remote` passou com 17 de 17 aplicadas.
O diagnóstico esperava colunas inexistentes em `v2_user_preferences` (`email_notifications` etc.);
corrigido para `phone` e `neighborhood`, como na migração. O token de acesso usado nesta operação deve
ser revogado após o uso.

**Spec 043 validada localmente:** as telas do Micael foram percorridas no app compilado para a Web,
com dois usuários em memória, e comparadas lado a lado com os nós do Figma renderizados pelo MCP.
Corrigidos: preço com ponto decimal ("R$ 25.00") em seis telas, agora `R$ 25,00` por `formatPrice`;
identificador interno exibido como "Pessoa interessada" em `/pedidos-recebidos` (agora o nome público,
ou "Pessoa da comunidade"); aba "Propostas" da estante, que contava só livros reservados e passou a
listar as propostas recebidas em aberto; botão flutuante que cobria a dica da estante; ponto do
`StepProgress` sobreposto ao nome da etapa. Alinhados ao Figma: estante em linhas com seta para o
gerenciamento (`05.01`/`05.03`), capa em destaque na etapa de fotos (`04.04`), descrição multilinha
com um só contador (`04.05`), manchete com realce e "Ver estante" no sucesso (`04.07`), estados vazios
de Favoritos (`02.14`) e Alertas (`02.13`), horário curto nas notificações (`07.04`) e pontos de
encontro da Ajuda iguais aos da negociação. `npm run validate` passou com 897 testes em 127 arquivos.
Ficam fora (ver `specs/043-telas-micael-figma-ao-vivo/spec.md`): agendamento de encontro de `06.05`,
cor de fundo e rótulo flutuante dos campos (afetam todas as telas, decisão da equipe) e o preço com
ponto em `bookDetail.tsx` e na mensagem de compartilhar, que são da trilha da Maria Clara.

**Spec 048 validada localmente (numerada 039 na entrega original):** `/perfil` deixou de abrir direto o formulário de edição e passou a
ser o hub "Meu perfil" (Figma `07.01`): avatar, estatísticas e menu para Editar perfil (`/perfil/editar`),
Avaliações recebidas (`/perfil/avaliacoes`, novo caso de uso `RatingUseCases`), Notificações,
Segurança e verificação (`/perfil/seguranca`, novo — envia link de redefinição de senha),
Privacidade e dados (linkado à tela já existente `/excluir-conta`), Termos, Ajuda e Sair da conta
(com diálogo de confirmação). Pessoas bloqueadas (`07.10`–`07.12`) ficou fora por exigir
infraestrutura nova (migração/RLS) — spec e PR separados. `npm run validate` passou com 803 testes
em 119 arquivos.

**Spec 038 (galeria) validada localmente:** `PhotoGallery` (`src/view/listings/photoGallery.tsx`) passou a usar
`FlatList` horizontal paginada para swipe lateral, com botões Anterior/Próxima sincronizados,
indicador "Foto X de Y", rótulo de acessibilidade próprio por foto e navegação por teclado na Web
(`ArrowRight`/`ArrowLeft`/`Esc`, mesmo padrão de `Dialog.tsx`). `npm run validate` passou com 784
testes em 114 arquivos. Validação manual de gesto real em dispositivo e teclado em navegador real
ainda pendente — ver `specs/038-galeria-swipe-teclado/validacao.md`.

**Spec 037 validada localmente:** cartões de ponto de encontro seguro em `/negociacao/[id]` passam a
exibir endereço e horário recomendado, com botão "Como chegar" abrindo o app de mapas padrão
(`Linking.openURL`) e mensagem de erro acessível quando a abertura falha. `npm run validate` passou
com 781 testes em 114 arquivos. Validação manual do toque real em dispositivo (abertura efetiva do
Google Maps/Apple Maps) ainda pendente — ver `specs/037-pontos-encontro-mapa/validacao.md`.

**Spec 036 validada localmente:** lista de alertas com navegação para gerenciamento e edição, modalidades persistidas e aplicadas às notificações. `npm run validate` passou com 779 testes em 114 arquivos, além de tipos, arquitetura e SQL/PGlite. `npm run verify:release` passou, incluindo compilação Web com 28 rotas. No Android, `/alertas` sem sessão foi conferida via ADB; o aparelho se desconectou antes da conferência autenticada. O fluxo autenticado completo foi conferido visualmente na Web local via CDP, com sessão temporária em memória removida após o teste. A migração remota, pendente na época por `AccessTokenRequiredError`, foi conferida depois (ver "Supabase remoto — sincronizado").

---

## 1. Estado Verificado em Execução

Todas as métricas abaixo foram aferidas diretamente por execução dos scripts de validação:

- **Testes automatizados**: **969 testes passando** em **134 arquivos de teste** (`npm run validate`), cobrindo entidades, validadores, casos de uso, adaptadores, viewmodels, componentes e integração.
- **Cobertura de código**: Statements 92,68%, Branches 84,50%, Functions 90,21%, Lines 93,84%.
- **Integridade arquitetural**: **100% em conformidade (244 arquivos verificados)** no MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`), verificado pelo comando `npm run check:architecture` (0 violações). Apenas `src/di/container.ts` e testes têm permissão para instanciar ou importar adaptadores de `src/infra/`.
- **Validação de banco e migrações SQL**: **17 migrações** descobertas e executadas em ordem no PGlite (`npm run test:sql`), com rejeição de versões duplicadas. Remotamente, as 17 estão aplicadas (conferido em 2026-10-21; ver "Supabase remoto — sincronizado" acima).
- **Semente Oficial da Beta (`npm run db:seed`)**: Script `scripts/popular-catalogo-piripiri.mjs` gerando 10 anúncios realistas distribuídos pelos bairros de Piripiri, PI com exportação SQL via `--sql`.
- **Backend Supabase**: Configurado para desenvolvimento; as 17 migrações estão aplicadas no banco remoto e o diagnóstico `health:supabase:remote` passou (verificado em 2026-10-21).
- **Rotas Web compiladas (`npm run build:web`)**: Exportação estática do Expo Router gerou com sucesso o pacote web em `dist/`, totalizando **31 rotas estáticas** (as rotas `/perfil/editar`, `/perfil/avaliacoes` e `/perfil/seguranca` foram acrescentadas pela Spec 048):
  - `/` (Catálogo e vitrine inicial com selo da beta em Piripiri, PI)
  - `/perfil` (Perfil do usuário autenticado)
  - `/perfil/editar` (Edição do perfil próprio - Spec 048)
  - `/perfil/avaliacoes` (Avaliações recebidas - Spec 048)
  - `/perfil/seguranca` (Segurança e verificação, envia link de redefinição de senha - Spec 048)
  - `/perfil/[userId]` (Perfil público, somente leitura, de quem anuncia — nome, avaliação média e negociações concluídas - Spec 018, Issue #73)
  - `/bem-vindo` (Boas-vindas e primeiro acesso com escolha opcional de bairro - Spec 026, ADR 0022)
  - `/pesquisa` (Busca no catálogo por termo e filtros, com histórico recente no dispositivo - Spec 027)
  - `/livro/[id]` (Detalhes completos do anúncio, capa com foto real/fallback, dados do autor e do anunciante)
  - `/anunciar` (Formulário de cadastro de anúncio com upload/remoção de foto e 17 bairros de Piripiri)
  - `/editar-anuncio/[id]` (Edição completa de anúncios cadastrados pelo usuário - Spec 024, ADR 0018)
  - `/gerenciar-anuncio/[id]` (Gerenciamento de um anúncio: estado atual, editar, pausar/retomar e excluir - Spec 030)
  - `/meus-anuncios` (Listagem de anúncios do usuário, com opções de editar, pausar/retomar, exclusão confirmada via Diálogo e feedbacks via Snackbar)
  - `/pedidos-recebidos` (Propostas recebidas de interessados, com aceitar e recusar)
  - `/meus-pedidos` (Propostas enviadas pelo usuário)
  - `/negociacao/[id]` (Detalhes do encontro acordado com pontos públicos seguros em Piripiri)
  - `/favoritos` (Livros marcados como favoritos pelo usuário)
  - `/alertas` (Criação e listagem de alertas de busca, com acesso ao gerenciamento individual)
  - `/alertas/[id]` (Gerenciamento, pausa/retomada e exclusão confirmada de um alerta)
  - `/alertas/[id]/editar` (Edição do termo e das modalidades do alerta)
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

No app ativo em desenvolvimento, 31 rotas cobrem as jornadas essenciais da beta. A discrepância numérica entre 137 e 31 decorre de **decisões deliberadas de escopo e arquitetura**, devidamente documentadas em ADRs:

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
- **Alinhamento das telas de autenticação ao Figma (US1 e US2 / Micael)**: Concluído e integrado. Telas de Entrar (`01.02`), Criar conta (`01.03`), Recuperar acesso (`01.04`), Confira seu e-mail (`01.05`) e Nova senha (`01.06` e `01.07`) alinhadas às especificações do Figma Android Material 3 e Web Responsivo, com `TopAppBar`, cards centralizados responsivos, confirmação de senha e validação interativa comprovada via ADB no dispositivo físico Android. **Revisto pela Spec 030** (ver adiante): a conferência nó a nó mostrou que a copy, o campo de nome, o aceite dos termos e os estados de reenvio ainda divergiam do Figma.
- **Issue #73 (Perfil público do anunciante e fotos do anúncio)**: Spec 018 implementada. Rota `/perfil/[userId]` (somente leitura: nome, avaliação média ou "Sem avaliações ainda", negociações concluídas) acessível a partir do detalhe do anúncio; galeria de fotos em tela cheia como modal em `bookDetail.tsx`, sem ação quando o anúncio só tem capa ilustrativa. Migração `202610200006_perfil_publico_e_avaliacoes.sql` (`v2_profiles`, `v2_ratings`). Limitações registradas em `specs/018-perfil-publico-do-anunciante-e-fotos/validacao.md` (nome padrão até a edição de perfil #55/#56; sem fluxo de avaliação ainda).
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
- **Issue #93 (Descoberta — Filtrar e ordenar o catálogo de livros)**: Concluída na Spec 028. Implementada filtragem por modalidade (Troca, Venda, Doação), categoria dinâmica extraída do catálogo, faixas de preço (grátis, até R$ 20, até R$ 50), ordenação (mais recentes, A-Z, menor preço, maior preço), botão de limpeza e tratamento contextualizado de busca vazia, com cobertura de testes unitários e de componentes.
- **Spec 030 — Alinhamento das telas do Micael ao Figma (Outubro de 2026)**: Conferência nó a nó
  entre as telas sob responsabilidade do Micael e o Figma Android, com correção das divergências
  encontradas (a auditoria anterior registrava alinhamento que não se confirmava na comparação).
  - **Design System**: `OutlinedButton` e `TextButton` (variantes que o `botao.md` documentava sem
    implementação), `Checkbox` com `caixa-de-selecao.md` e ícone `mail` no `AppIcon`.
  - **Acesso**: `/entrar` passa a corresponder a `01.10`, `/criar-conta` ganha nome completo
    (persistido em `user_metadata.full_name` e propagado ao perfil público) e aceite explícito dos
    termos; `/esqueci-senha` ganha "Corrigir e-mail" e contador de reenvio de 45 s (`01.05`);
    `/redefinir-senha` segue a copy de `01.06`.
  - **Publicação**: `/anunciar` passa a ter as três etapas reais do Figma (Livro, Fotos, Detalhes)
    com `StepProgress` verdadeiro e tela de sucesso (`04.07`); `/editar-anuncio/[id]` segue `04.09`;
    nova rota `/gerenciar-anuncio/[id]` conforme `04.08`.
  - **Modelo**: `Book` ganha `condition` e `description` (migração
    `202610200005_conservacao_descricao_anuncio.sql`, validada em PGlite) e o bairro deixa de ser
    texto livre — passa a sair de `PIRIPIRI_NEIGHBORHOODS`, que antes só era usada em teste de
    semente.
  - **Descoberta**: `/favoritos` ganha as abas Livros/Alertas, modalidade, preço, conservação e
    bairro na linha, e desfavoritar na própria lista (`02.06`).
  - **Marca**: `theme_color` da Web corrigida de `#0D47A1` para `#2C5E45` e ícones do manifesto
    apontando para `icone-192.png`/`icone-512.png`, que agora existem no pacote publicado — antes o
    manifesto referenciava `/favicon.png`, ausente de `dist/`.
  - **Fora de escopo declarado** (ver `specs/030-alinhamento-telas-micael-figma/spec.md`): login
    com Google e `01.02`, leitura de ISBN pela câmera, rascunhos (Spec 017), permissões da
    plataforma (Spec 020), "Marcar como concluído" em `04.08` e compartilhar (Spec 019).
- **Trilha de Resiliência, Infra e Segurança (Micael — Outubro de 2026)**:
  - **ADRs 0023 a 0027**: Formalizadas as decisões arquiteturais de CI no GitHub Actions (0023), busca acelerada `pg_trgm` (0024), portabilidade LGPD (0025), sanitização preventiva (0026) e resiliência/logging/rate limiting/release (0027).
  - **Logging Estruturado e Sanitizado (`SafeLogger`)**: Implementação de `ILogger` em `src/infra/services/safeLogger.ts` com mascaramento automático de senhas, JWTs e chaves sensíveis contra vazamento de dados pessoais. **Consumido pelos ViewModels a partir da Spec 031**, que registram falha de cadastro, de recuperação de senha, de publicação e de denúncia, além dos bloqueios por excesso de tentativas.
  - **Rate Limiting no Cliente (`ClientRateLimiter`)**: Algoritmo de janela deslizante (sliding window) em `src/infra/services/clientRateLimiter.ts`. **Aplicado às telas na Spec 031**, pelo guarda `src/viewmodel/formRateLimit.ts`: entrar e criar conta (5 tentativas por minuto e por e-mail), recuperar senha e denunciar anúncio (3 por minuto) e publicar anúncio (5 por minuto e por sessão). Entrar com sucesso zera o contador daquela conta.
  - **Cache Resiliente Offline-first (`CachedBookDataSource`)**: Decorator em `src/infra/datasources/cachedBookDataSource.ts` com fallback automático via `AsyncStorage` caso haja falha de conexão, garantindo exibição de anúncios sem rede.
  - **Script de Verificação Pré-deploy (`npm run verify:release`)**: Script consolidado em `scripts/verificar-release.mjs` que valida sequencialmente `.env.example`, TypeScript, 7 camadas arquiteturais, as migrações SQL com RLS, testes unitários, build estático web e arquivos de distribuição em `dist/`.

- **Issue #109 (Publicação e verificação no Cloudflare Pages)**: Concluída e comprovada em ambiente real de destino (`https://ipebook.pages.dev`). Projeto provisionado via Cloudflare CLI (`cf pages projects create --name ipebook`), pacote estático com 25 rotas publicado via Wrangler (`npx wrangler pages deploy dist --project-name ipebook --branch develop`) e regras de rewrite `200` em `public/_redirects` ajustadas para compatibilidade com Clean URLs do Cloudflare Pages (cobrindo `/livro/*`, `/perfil/*`, `/negociacao/*`, `/denunciar/*`, `/editar-anuncio/*` e `/gerenciar-anuncio/*`). Cabeçalhos de segurança CSP, `manifest.json` e acesso direto HTTP 200 em rotas estáticas e dinâmicas verificados no PoP de Fortaleza (`FOR`).

---

## 4. Situação das Issues da Trilha

### Issues Concluídas do Micael (`pessoa:micael`)

- Todas as issues atribuídas a `pessoa:micael` foram concluídas, testadas, integradas em `develop` e encerradas no GitHub (incluindo #93, #109, #115, #116, #117, #121, #123, #126 a #130 e Spec 029).

### Issues Abertas da Maria Clara (`pessoa:maria-clara`)

1. **#55, #56, #74, #97 e #141 a #147**:
   - Backlog de interface e fluxos complementares do Figma atribuído a Maria Clara (`pessoa:maria-clara`), totalizando 11 issues abertas em acompanhamento.

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
- `specs/028-filtrar-e-ordenar-catalogo/`: Filtragem por modalidade, categoria, preço e ordenação do catálogo (Issue #93).
- `specs/029-portabilidade-e-download-dados-lgpd/`: Interface e serviço de download de dados estruturados em JSON (Art. 18 e 19 LGPD).
- `specs/030-alinhamento-telas-micael-figma/`: Alinhamento das telas de autenticação e gerenciamento de anúncio ao Figma.
- `specs/031-limite-de-tentativas-e-log-nas-telas/`: Limite de tentativas e log sanitizado ligados às telas.
- `specs/044-alinhamento-complementar-telas-micael-figma/` (antes 031): Alinhamento complementar de Meus Anúncios, Denúncia e Encontro ao Figma.
- `specs/032-alinhamento-final-telas-micael-figma/`: Abas, filtros e busca em Minha Estante, Notificações e Central de Ajuda.
- `specs/033-correcoes-revisao-integral/`: Correções de integridade arquitetural, aceite atômico de pedidos, portabilidade LGPD e polimento visual comprovado via ADB no dispositivo físico Android contra o PDF oficial de referência.
- `specs/034-preferencias-privadas-perfil/`: Telefone/WhatsApp e bairro padrão privados do perfil (Issue #141).
- `specs/035-alinhamento-visual-telas-micael/`: Alinhamento visual das telas do Micael.
- `specs/036-gerenciar-e-editar-alerta/`: Gerenciamento, edição e modalidades de alertas (ADR 0031).
- `specs/037-pontos-encontro-mapa/`: Endereço, horário e "Como chegar" nos pontos de encontro.
- `specs/038-galeria-swipe-teclado/`: Galeria de fotos com swipe e teclado (Issue #143).
- `specs/040-cache-progressivo-capas-livro/`: Cache progressivo e retry das capas (ADR 0034).
- `specs/041-pwa-service-worker-cache-offline/`: Service Worker e cache offline do PWA (ADR 0035).
- `specs/042-ordenacao-foco-talkback/`: Ordem de foco e anúncios de erro para leitores de tela (Issue #147).
- `specs/045-melhorias-telas-micael/` (antes 032): Melhorias e filtros nas telas do Micael (Issues #160 a #165).
- `specs/046-estados-fluxo-acesso/` (antes 033): Link expirado e e-mail já cadastrado (Issue #97).
- `specs/047-metricas-beta-piripiri/` (antes 038): Script de auditoria e métricas da beta (ADR 0032).
- `specs/048-perfil-hub-fluxo-07/` (antes 039): Hub "Meu perfil".
- `specs/049-saude-migracoes-supabase-remoto/` (antes 039): Verificação de saúde e migrações remotas (ADR 0033).
- `specs/050-compartilhar-whatsapp/` (antes 040): Mensagem formatada e botão do WhatsApp (Issue #145).
- `specs/051-home-secoes-destacadas/` (antes 041): Seções de recém-adicionados e doações (Issue #146).
- `specs/039-alinhamento-fino-telas-micael/`: Alinhamento fino de oito telas do Micael ao canvas Android do Figma, lido nó a nó pelo MCP, com a lista das diferenças que dependem de recursos ainda inexistentes.
- `specs/043-telas-micael-figma-ao-vivo/`: Telas do Micael conferidas no app compilado contra o Figma: defeitos de preço, nome do interessado e aba Propostas, e alinhamento de Estante, Anunciar, estados vazios, notificações e Ajuda.
- `specs/052-combinar-encontro/`: Combinar encontro com local, dia e horário, confirmação, reagendamento e cancelamento (Issue #188, implementada e validada localmente; migração remota pendente).
