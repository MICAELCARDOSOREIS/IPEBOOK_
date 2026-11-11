# Relatório de Alinhamento e Auditoria Exaustiva: Código vs. Figma

> **Status:** Documento técnico de referência definitiva para a equipe de design  
> **Data:** Novembro de 2026  
> **Escopo:** 100% das telas, fluxos e modais do IpêBook (42 módulos em 8 fluxos funcionais)  
> **Objetivo:** Fornecer à equipe de design uma auditoria detalhada de cada divergência entre os mockups originais do Figma e o aplicativo implementado, explicando as justificativas técnicas/UX e fornecendo instruções exatas para atualizar o arquivo do Figma.

---

## 1. Por que o Código Divergiu do Figma Original?

O projeto Ipebook evoluiu significativamente durante a fase de validação com leitores em Piripiri (PI) e na auditoria rigorosa de acessibilidade digital e design craft baseada nas seguintes normas:
1. **WCAG 2.2 Nível AA**:
   - Piso de contraste mínimo de **3:1** para limites visuais de componentes interativos (Critério 1.4.11 - *Non-text Contrast*), onde os tons cinzas claros originais do Figma (`#d3ccc2`) falhavam e foram elevados para `colors.m3.outline` (`#7E776F`, atingindo 4.23:1).
   - Área mínima de toque de **48×48 dp** com `hitSlop` calibrado (Critério 2.5.8 - *Target Size Minimum*), eliminando botões e ícones pequenos (~24dp) que geravam toques perdidos no celular.
   - Preservação da árvore de nós acessíveis para leitores de tela (TalkBack / VoiceOver), utilizando `accessibilityHint` em vez de mascarar containers com `accessibilityLabel` opaco.
2. **Material Design 3 Canônico (M3)**:
   - Raio arredondado canônico de **28 dp** (`tokens.radius.xxl`) em diálogos e BottomSheets modais, substituindo raios arbitrários de 12–16 dp.
   - Fórmula de **raios concêntricos** ($R_{externo} = R_{interno} + \text{Padding}$) em cards aninhados e linhas da estante, eliminando quinas esmagadas.
3. **Ergonomia Móvel e Thumb Zone**:
   - Ações principais de submissão e avanço posicionadas no terço inferior da tela, ao alcance natural do polegar.
   - Gerenciamento inteligente de teclado no Expo SDK 58 (edge-to-edge) via `KeyboardAwareRoot`, evitando que o teclado virtual esmague campos de entrada ou encubra botões.
4. **Prevenção de Falhas e Resiliência (Zero States & Feedback)**:
   - Ação de **"Desfazer"** (*Undo*) via Snackbar para operações de limpeza ou exclusão acidental.
   - Estados vazios (*Zero States*) acolhedores com ilustrações, microcópia empática e chamada imediata para ação (CTA).

---

## 2. Inventário Exaustivo de Telas por Fluxo

---

### FLUXO 01 — Boas-vindas, Onboarding e Autenticação

#### 1.1. Boas-vindas (`welcome.tsx` / `welcomeRoute.tsx`)
- **Frames no Figma:** `01.01 · Boas-vindas` (`146:457`), `01.02`
- **O que mudou no código:** 
  - Cards de modalidades (Venda, Troca, Doação) com cores canônicas e contraste testado (ADR 0104).
  - Web larga em duas colunas responsivas com logotipo editorial e botão de alternância de tema integrado.
  - Microcópia adaptativa para convite Beta (`wide ? "ao lado" : "abaixo"`).
- **Como atualizar no Figma:** Alinhar o frame mobile com cards de cantos de 16px e paleta canônica (Venda `#436815`, Troca `#745B00`, Doação `#9C4146`).

#### 1.2. Seções "Como Funciona" e Segurança (`aboutSections.tsx`)
- **Frames no Figma:** `01.02 · Como funciona` (`146:610`)
- **O que mudou no código:** 
  - Estruturação semântica de títulos com `aria-level={2}`.
  - Seção de segurança comunitária de Piripiri destacada com ícone de escudo e bordas de 16dp.
- **Como atualizar no Figma:** Adicionar a seção de segurança comunitária e os passos ilustrados de encontro em pontos públicos.

#### 1.3. Termos de Uso e Privacidade (`termsAndPrivacy.tsx`)
- **Frames no Figma:** `01.03 · Termos e Privacidade` (`354:5810`)
- **O que mudou no código:** 
  - Seletor de abas acessível (`accessibilityRole="tab"`), busca textual e visualização em duas colunas na web larga.
- **Como atualizar no Figma:** Incluir a aba alternável "Termos de Uso" e "Política de Privacidade" com leitura limpa e espaçamento entre cláusulas.

#### 1.4. Entrar com E-mail (`signIn.tsx`)
- **Frames no Figma:** `01.10 · Entrar com e-mail` (`354:6017`)
- **O que mudou no código:** 
  - Encadeamento de teclado: tecla "Próximo" foca a senha e "Entrar" no teclado já submete o login.
  - Mensagens de erro em cartão com `InlineErrorCard` e aria-live.
- **Como atualizar no Figma:** Inserir o estado de erro contextual e botão "Continuar com Google" destacado.

#### 1.5. Criar Conta (`signUp.tsx`)
- **Frames no Figma:** `01.11 · Criar conta` (`354:6200`)
- **O que mudou no código:** 
  - Checkbox acessível de aceite dos termos com link direto para leitura sem perder dados já digitados.
  - Tela de confirmação "Quase lá! Confirme seu e-mail" com ícone de e-mail e orientações de spam.
- **Como atualizar no Figma:** Desenhar o frame de sucesso pós-cadastro com orientações de confirmação de e-mail.

#### 1.6. Esqueci minha Senha e Redefinição (`forgotPassword.tsx` / `resetPassword.tsx`)
- **Frames no Figma:** `01.12 · Recuperar senha`, `01.13`
- **O que mudou no código:** 
  - Validação de formato de e-mail antes do envio e feedback de sucesso com botão para reenviar link.
- **Como atualizar no Figma:** Incluir o banner de e-mail de redefinição enviado.

#### 1.7. Exclusão de Conta (`deleteAccount.tsx` / `deleteAccountScreen.tsx`)
- **Frames no Figma:** `07.15 · Excluir conta`
- **O que mudou no código:** 
  - Advertência clara sobre perda irreversível de dados, histórico de trocas e avaliações, com confirmação em diálogo destrutivo.
- **Como atualizar no Figma:** Criar tela de exclusão de conta em tons de alerta vermelho com texto explicativo.

#### 1.8. Convite Beta (`betaInviteScreen.tsx`)
- **Frames no Figma:** Não existia no Figma inicial.
- **O que mudou no código:** 
  - Tela especial para recrutamento de leitores locais no Piauí, com destaques das 3 modalidades e botão Google OAuth.
- **Como atualizar no Figma:** Criar novo componente/frame `Beta Invite` seguindo os padrões do IpêBook.

---

### FLUXO 02 — Descoberta, Vitrine e Busca

#### 2.1. Início / Home (`home.tsx` / `CatalogCarousel.tsx`)
- **Frames no Figma:** `02.01 · Início` (`12:128` / Web `146:457`)
- **O que mudou no código:** 
  - Chips de modalidades com contorno de contraste 4.23:1 (`#7E776F`).
  - Carrossel no mobile transformado em **grade de 2 colunas** com números tabulares nos preços.
  - Botão flutuante de chat (`HomeFloatingChatButton`) suspenso sobre a barra de navegação.
- **Como atualizar no Figma:** Ajustar a vitrine mobile para grade de 2 colunas e escurecer a borda dos chips não selecionados.

#### 2.2. Explorar e Busca (`search.tsx` / `SearchBookCard.tsx`)
- **Frames no Figma:** `02.02 · Explorar`, `02.04 · Resultados com filtro` (`145:1500`)
- **O que mudou no código:** 
  - Botão de ordenação transformado em pílula ergonômica com fundo `surfaceContainerHigh`.
  - Ação de **Desfazer** (*Undo*) na Snackbar ao limpar filtros.
  - Persistência automática dos filtros e ordenação entre sessões.
  - Chevron de navegação isolado do botão de favoritar para evitar toques concorrentes.
- **Como atualizar no Figma:** Atualizar o botão de ordenação para formato pílula e adicionar a Snackbar de desfazer.

#### 2.3. Modal e Sidebar de Filtros (`FilterSheet.tsx` / `WebFilterSidebar.tsx`)
- **Frames no Figma:** `02.03 · Filtrar livros` (`34:229`)
- **O que mudou no código:** 
  - Filtro por bairro específico de Piripiri integrado ao modal de bairros.
  - Filtro para "Somente boxes e coleções" (Spec 112).
  - Opção de faixa de preço com chips: "Todos", "Gratuitos", "Até R$ 20", "Até R$ 50".
- **Como atualizar no Figma:** Incluir a seção de bairro e o toggle de "Box e coleções" no layout do filtro.

#### 2.4. Favoritos (`favorites.tsx` / `favoritesScreen.tsx`)
- **Frames no Figma:** `02.05 · Favoritos`
- **O que mudou no código:** 
  - Estado vazio com ilustração do Ipê e botão direto "Explorar livros".
  - Banner informativo de privacidade no rodapé: *"Favoritos ficam só com você. Quem anunciou não vê quem salvou o livro."*
- **Como atualizar no Figma:** Adicionar a ilustração e a nota de privacidade no frame de Favoritos.

#### 2.5. Alertas de Busca (`searchAlerts.tsx`, `manageAlert.tsx`, `editAlert.tsx`)
- **Frames no Figma:** `02.07 · Meus alertas` (`145:2921`), `02.08 · Avisaremos você` (`19:420`)
- **O que mudou no código:** 
  - Formulário integrado de criação de alerta com seleção de modalidade e categoria.
  - Lista de alertas ativos com contadores de livros encontrados e botão de excluir alerta.
  - Estado vazio para visitantes com CTA de login.
- **Como atualizar no Figma:** Alinhar o card de alerta cadastrado com tags de categoria e badge de cidade fixa em "Piripiri, PI".

#### 2.6. Seletor de Bairros (`NeighborhoodSelectorModal.tsx`)
- **Frames no Figma:** `Modal de Bairros`
- **O que mudou no código:** 
  - Campo de busca rápida no topo com `returnKeyType="search"` e `autoCorrect={false}`.
  - Recolhimento suave do teclado ao rolar a lista de bairros (`keyboardDismissMode="on-drag"`).
  - Estado vazio amigável ("Nenhum bairro encontrado para '{termo}'") com botão "Ver todos os bairros".
- **Como atualizar no Figma:** Incluir a barra de pesquisa e a visualização do estado vazio no modal.

---

### FLUXO 03 — Detalhes do Livro e Perfil Público

#### 3.1. Detalhes do Livro (`bookDetail.tsx` / `BookDetailSections.tsx`)
- **Frames no Figma:** `03.01`, `03.02`, `03.03 · Detalhe do livro`
- **O que mudou no código:** 
  - Hero com botões circulares de **48×48 dp** e fundo translúcido para garantir legibilidade sobre qualquer capa.
  - Folga de rolagem inferior dinâmica (`scrollBottomPadding.withBottomBar`) para que a barra fixa não cubra links finais.
  - Metadados editoriais estendidos (Editora, Ano, Páginas, Sinopse via ISBN).
- **Como atualizar no Figma:** Aumentar a área dos botões de voltar/compartilhar/favoritar na imagem de capa e adicionar padding inferior de 128px no frame.

#### 3.2. Galeria em Tela Cheia (`photoGallery.tsx`)
- **Frames no Figma:** `03.04 · Fotos em tela cheia`
- **O que mudou no código:** 
  - Carrossel horizontal em tela cheia com fundo preto imersivo, indicador numérico (ex: "1 de 3") e botão de fechar acessível com 48dp.
- **Como atualizar no Figma:** Adicionar o indicador numérico no topo da tela.

#### 3.3. Ficha de Livro Reservado / Entregue (`ReservedListingSheet.tsx`)
- **Frames no Figma:** `03.05`
- **O que mudou no código:** 
  - BottomSheet com raio M3 de **28dp**, avisando sobre a reserva e sugerindo explorar outros livros da mesma categoria ou ver o perfil do anunciante.
- **Como atualizar no Figma:** Atualizar o raio dos cantos para 28px e adicionar as ações secundárias de recomendação.

#### 3.4. Perfil Público de Outro Leitor (`publicProfile.tsx` / `ownerListings.tsx`)
- **Frames no Figma:** `03.06 · Perfil público`
- **O que mudou no código:** 
  - Proteção de privacidade: o identificador interno nunca é exposto na interface (Spec 043).
  - Exibição de bairro em Piripiri, total de livros compartilhados e média de avaliações recebidas.
  - Botão principal: "Conversar com [Nome]" levando direto ao chat seguro.
- **Como atualizar no Figma:** Alinhar o card de perfil público e a lista de livros disponíveis daquele leitor.

#### 3.5. Denúncia de Anúncio (`reportListing.tsx`)
- **Frames no Figma:** `03.07 · Denunciar anúncio`
- **O que mudou no código:** 
  - Exigência de autenticação com tela informativa clara caso visitante tente denunciar.
  - Opções em radiogroup semântico, campo de detalhes opcional e tela de confirmação de envio em 24h.
- **Como atualizar no Figma:** Criar variante do formulário com as opções de denúncia e confirmação.

---

### FLUXO 04 — Publicação e Gestão de Anúncios

#### 4.1. Anunciar — Etapa 1: Dados do Livro (`createListingStep1.tsx` / `BarcodeScannerModal.tsx`)
- **Frames no Figma:** `04.01 · Anunciar — etapa 1` (`12:210`)
- **O que mudou no código:** 
  - Leitor de código de barras via câmera integrado com anúncio de voz acessível ao bipar o ISBN.
  - Encadeamento dinâmico de teclado: Título → Autor → Preço (apenas se modalidade for Venda).
  - Floating labels M3 estáveis que não tremem ao digitar.
- **Como atualizar no Figma:** Adicionar o botão com ícone de código de barras ao lado do campo de ISBN.

#### 4.2. Anunciar — Etapa 2: Fotos do Livro (`createListingStep2.tsx` / `AddPhotoCard.tsx`)
- **Frames no Figma:** `04.04 · Mostre seu livro` (`28:685`)
- **O que mudou no código:** 
  - Botão de exclusão de fotos com área de toque calibrada para **48×48 dp** (`hitSlop={12}`).
  - BottomSheet de escolha de origem (`PhotoSourceSheet`) com opções: "Tirar foto agora" e "Escolher da galeria".
- **Como atualizar no Figma:** Aumentar a área do "X" de exclusão de fotos para 48px.

#### 4.3. Anunciar — Etapa 3: Detalhes e Conservação (`createListingStep3.tsx`)
- **Frames no Figma:** `04.05 · Detalhes do livro` (`12:360`)
- **O que mudou no código:** 
  - Inclusão do checkbox "Box ou coleção de livros" e campo de quantidade de volumes.
  - Chips de conservação ("Novo", "Seminovo", "Marcas leves", "Desgastado") com visual M3 unificado.
- **Como atualizar no Figma:** Adicionar a seção de Box/Coleção de livros logo acima da descrição.

#### 4.4. Sucesso de Publicação (`createListingSuccess.tsx`)
- **Frames no Figma:** `04.07 · Anúncio publicado` (`12:418`)
- **O que mudou no código:** 
  - Animação celebratória com pétalas de Ipê (`IpePetalsCelebration`).
  - Botão de compartilhamento em 1 toque no WhatsApp com link e card promocional prontos.
- **Como atualizar no Figma:** Adicionar o botão verde de WhatsApp com destaque visual.

#### 4.5. Gerenciar Anúncio (`manageListing.tsx`)
- **Frames no Figma:** `04.08 · Gerenciar anúncio` (`149:3348`), `04.20 · Excluir anúncio?` (`397:6961`)
- **O que mudou no código:** 
  - Opções completas de ciclo de vida: Pausar/Ativar anúncio, Marcar como reservado, Marcar como entregue e Editar.
  - Diálogo de confirmação destrutiva com estilo Material 3 e raio de 28dp.
- **Como atualizar no Figma:** Atualizar o modal de exclusão para raio de 28px.

#### 4.6. Rascunhos da Estante (`drafts.tsx` / `DraftsCard.tsx`)
- **Frames no Figma:** `04.10 · Rascunhos`
- **O que mudou no código:** 
  - Card dedicado na estante quando houver rascunhos em andamento, informando em qual etapa o usuário parou.
- **Como atualizar no Figma:** Criar o card "Anúncios em andamento" na estante.

---

### FLUXO 05 — Estante e Circulação

#### 5.1. Estante com Livros (`myListings.tsx` / `myListingsListingsTab.tsx` / `shelfRow.tsx`)
- **Frames no Figma:** `05.01 · Estante` (`25:302`)
- **O que mudou no código:** 
  - FAB posicionado 16px acima da barra de navegação flutuante.
  - Carrossel horizontal de filtros de status (`Todos`, `Ativos`, `Pausados`, `Reservados`).
  - Linhas da estante com raios concêntricos (16dp card / 12dp capa) e botão direto de WhatsApp.
  - Entrelinha de títulos de 2 linhas ajustada para 22dp para evitar colisões tipográficas.
- **Como atualizar no Figma:** Reposicionar o FAB para não cobrir a barra de navegação e inserir o botão de WhatsApp nas linhas.

#### 5.2. Estante Vazia (`myListingsEmpty.tsx`)
- **Frames no Figma:** `05.02 · Estante vazia` (`25:430`)
- **O que mudou no código:** 
  - Ícone de estante em container circular, manchete acolhedora e botão "Como funciona" que leva à central de ajuda.
- **Como atualizar no Figma:** Adicionar o link/botão "Como funciona" abaixo do botão principal.

#### 5.3. Seletor de Abas da Estante (`ShelfTabSheet.tsx`)
- **Frames no Figma:** `05.04`
- **O que mudou no código:** 
  - Raio canônico M3 de **28 dp**, backdrop interativo com fechamento ao toque externo e handle visual central.
- **Como atualizar no Figma:** Atualizar cantos superiores para raio de 28px.

---

### FLUXO 06 — Negociação, Chat, Encontros e Entrega

#### 6.1. Pedidos Enviados e Recebidos (`sentRequests.tsx` / `receivedRequests.tsx` / `requestListLayout.tsx`)
- **Frames no Figma:** `06.01`, `06.02 · Pedidos`
- **O que mudou no código:** 
  - Carrossel horizontal de filtros de status com contadores numéricos tabulares.
  - Rótulos acessíveis contextuais ("Aceitar proposta de [Nome] para o anúncio [Livro]").
  - Diálogo de aceite mantido aberto com mensagem de erro caso ocorra falha de rede.
- **Como atualizar no Figma:** Inserir a barra de filtros horizontais nos pedidos.

#### 6.2. Detalhe da Negociação e Linha do Tempo (`requestDetail.tsx`)
- **Frames no Figma:** `06.03 · Detalhe do pedido`, `06.05 · Encontro combinado`
- **O que mudou no código:** 
  - Linha do tempo de progresso (Proposta → Aceite → Encontro → Entrega) com indicadores acessíveis de conclusão.
  - Pull-to-refresh para atualização rápida do status do encontro.
- **Como atualizar no Figma:** Adicionar o stepper/linha do tempo visual de progresso.

#### 6.3. Combinar Encontro Seguro em Piripiri (`scheduleMeeting.tsx` / `MeetingMap.tsx`)
- **Frames no Figma:** `06.04 · Combinar encontro`, `06.13 · Reagendar`
- **O que mudou no código:** 
  - Mapa interativo dos 4 pontos públicos oficiais de Piripiri (Praça da Bandeira, IFPI, Estação Ferroviária e Parque Curumim) com pinos numerados idênticos à lista textual.
  - Carrossel horizontal com seleção de dias da semana e horários recomendados por ponto.
- **Como atualizar no Figma:** Alinhar o mapa e a lista de 4 pontos públicos com os horários recomendados.

#### 6.4. Chat de Negociação (`chat.tsx` / `ChatProposalCards.tsx`)
- **Frames no Figma:** `06.06 · Chat de negociação`
- **O que mudou no código:** 
  - Cards de proposta com altura mínima de 48dp.
  - Chips com sugestões de mensagens rápidas de introdução no início da conversa.
  - Contador de caracteres acessível (alerta após 800 caracteres) e envio automático via tecla Enter no desktop.
- **Como atualizar no Figma:** Adicionar os chips de sugestões rápidas de mensagens na conversa vazia.

#### 6.5. Confirmação de Entrega Presencial (`delivery.tsx`)
- **Frames no Figma:** `06.07 · Confirmar entrega`
- **O que mudou no código:** 
  - Dupla modalidade de validação: Leitor de QR Code integrado via câmera OU digitação de código numérico de segurança formatado em blocos ("K7M2 QXWA") para leitura oral no local.
  - Contador regressivo em tempo real com expiração do código de entrega.
- **Como atualizar no Figma:** Adicionar a aba de inserção manual de código além do QR Code.

#### 6.6. Avaliação Mútua da Negociação (`NegotiationRatingModal.tsx` / `userRatingsPanel.tsx`)
- **Frames no Figma:** `06.08 · Avaliação da negociação`
- **O que mudou no código:** 
  - Modal com estrelas acessíveis em tom âmbar profundo (`#8C5000` / `bloomDeep`, contraste >3.2:1), campo de elogio ou observação e envio único com proteção contra notas duplicadas.
- **Como atualizar no Figma:** Atualizar as estrelas para a cor âmbar e adicionar o modal de avaliação.

---

### FLUXO 07 — Perfil, Reputação e Configurações

#### 7.1. Hub do Perfil (`profileHub.tsx` / `ProfileHubSections.tsx`)
- **Frames no Figma:** `07.01 · Meu Perfil` (`563:8321`)
- **O que mudou no código (ADR 0060):** 
  - O Figma original desenhava 8 linhas longas de opções no hub. O código organizou a estrutura em: Card do Leitor + Resumo da Estante + Entrada única para Configurações no topo + Ações rápidas (Convidar amigos, Ajuda).
  - Estrelas de avaliação média com contraste elevado.
- **Como atualizar no Figma:** Agrupar opções secundárias dentro da tela de Configurações, simplificando o hub principal conforme o ADR 0060.

#### 7.2. Editar Perfil (`profile.tsx`)
- **Frames no Figma:** `07.02 · Editar perfil` (`145:2408`)
- **O que mudou no código:** 
  - Acesso rápido aos bairros mais frequentes em chips abaixo do campo.
  - Campo de Instagram com prefixo @ automático e validação preventiva.
  - Botão de salvar inteligente: flutuante no repouso e integrado ao formulário quando o teclado está ativo, permitindo salvar com a tecla "Concluído" do teclado.
- **Como atualizar no Figma:** Adicionar os chips de acesso rápido aos bairros abaixo do seletor.

#### 7.3. Central de Configurações (`settings.tsx`)
- **Frames no Figma:** `07.03 · Configurações`
- **O que mudou no código:** 
  - Seletor de tema nativo (Claro, Escuro e Sistema).
  - Linhas inteiras clicáveis com altura mínima de 48dp.
  - Acesso organizado a Segurança, Avaliações, Histórico de encontros e Pessoas bloqueadas.
- **Como atualizar no Figma:** Organizar a lista de configurações em seções com cards agrupados.

#### 7.4. Segurança e Senha (`security.tsx`)
- **Frames no Figma:** `07.04`
- **O que mudou no código:** 
  - Envio de e-mail de redefinição com feedback acessível e botão desabilitado durante o carregamento para evitar requisições múltiplas.
- **Como atualizar no Figma:** Desenhar o layout de segurança com card de alteração de senha.

#### 7.5. Avaliações Recebidas (`receivedRatings.tsx`)
- **Frames no Figma:** `07.05 · Avaliações`
- **O que mudou no código:** 
  - Lista de avaliações com estrelas âmbar (`#8C5000`), nome da pessoa leitora e data da troca.
  - Estado vazio acolhedor: *"Você ainda não recebeu avaliações. Complete trocas para construir sua reputação."*
- **Como atualizar no Figma:** Atualizar as estrelas para o tom âmbar e incluir o estado vazio.

#### 7.6. Histórico de Encontros (`meetingHistory.tsx`)
- **Frames no Figma:** `07.06`
- **O que mudou no código:** 
  - Lista de encontros passados em Piripiri com badge de status ("Concluído", "Cancelado"), data formatada e ponto público utilizado.
- **Como atualizar no Figma:** Desenhar os cards de encontros finalizados com os 4 pontos de Piripiri.

#### 7.7. Pessoas Bloqueadas (`blockedUsers.tsx`) e Denúncia de Usuário (`reportUser.tsx`)
- **Frames no Figma:** `07.10` a `07.12` (ADR 0039)
- **O que mudou no código:** 
  - Lista de usuários bloqueados com botão "Desbloquear" de fácil reversão e texto educativo sobre privacidade.
  - Denúncia de usuário com radiogroup semântico de motivos e garantia de anonimato.
- **Como atualizar no Figma:** Incluir o frame de gerenciamento de pessoas bloqueadas e o modal de denúncia.

#### 7.8. Painel de Moderação (`moderation.tsx`)
- **Frames no Figma:** Não desenhado no Figma de usuário final.
- **O que mudou no código:** 
  - Painel administrativo para triagem de denúncias da comunidade em Piripiri, com decisão de pausar anúncio ou arquivar denúncia.
- **Como atualizar no Figma:** Opcional: criar biblioteca de telas administrativas se for escopo do time de design.

---

### FLUXO 08 — Notificações, Convidar Amigos e Ajuda

#### 8.1. Central de Notificações (`notifications.tsx` / `notificationsScreen.tsx`)
- **Frames no Figma:** `08.01 · Notificações`
- **O que mudou no código:** 
  - Agrupamento inteligente de avisos por relevância (Propostas recebidas, Encontros agendados, Mensagens).
  - Marcador de "Lida" / "Não lida" com alto contraste e botão "Marcar todas como lidas".
- **Como atualizar no Figma:** Adicionar o indicador de mensagens não lidas e a ação de marcar todas.

#### 8.2. Convidar Amigos e Compartilhar App (`inviteFriends.tsx` / `InviteCard.tsx`)
- **Frames no Figma:** `08.02 · Convidar amigos` (ADR 0040)
- **O que mudou no código:** 
  - Cartão visual ilustrado pronto para compartilhamento com captura automática de imagem em PNG.
  - Botão de 1 toque para WhatsApp e botão de cópia de link com confirmação via Snackbar.
- **Como atualizar no Figma:** Inserir o cartão ilustrado com a mensagem de convite da comunidade.

#### 8.3. Central de Ajuda e Dúvidas Frequentes (`helpAndFaq.tsx`)
- **Frames no Figma:** `08.03 · Ajuda`
- **O que mudou no código:** 
  - Campo de busca em tempo real com normalização de acentos e termos locais.
  - Distribuição responsiva em 2 colunas com expansão inteligente de linha ímpar na web larga.
  - E-mail oficial de contato atualizado para `ipebook738@gmail.com`.
- **Como atualizar no Figma:** Adicionar o campo de busca de dúvidas no topo da tela de ajuda.

---

## 3. Guia Rápido de Tokens para Atualização no Figma

| Categoria | Nome do Token | Valor Canônico | Onde Aplicar no Figma |
| :--- | :--- | :--- | :--- |
| **Cor** | `colors.m3.outline` | `#7E776F` | Bordas de todos os botões outlined, chips não selecionados e caixas de seleção. |
| **Cor** | `colors.ipe.bloomDeep` | `#8C5000` | Todas as estrelas preenchidas de avaliação e badges de alerta âmbar. |
| **Cor** | `colors.m3.surfaceContainer` | `#F5EFE7` | Fundo de barras inferiores fixas de navegação e rodapés de ação. |
| **Raio** | `tokens.radius.xxl` | `28px` | Cantos de todos os Diálogos (`Dialog`) e BottomSheets modais. |
| **Raio** | `tokens.radius.card` | `16px` | Cards principais de livros, carrosséis e containers da estante. |
| **Raio** | `tokens.radius.cardSmall` | `12px` | Elementos internos aninhados em cards (raios concêntricos). |
| **Área de Toque** | `tokens.accessibility.touchTarget`| `48px` | Tamanho mínimo de qualquer botão, ícone de cabeçalho ou ação clicável. |
| **Espaçamento** | `scrollBottomPadding.withBottomBar`| `128px` | Respiro final em telas mobile para acomodar a barra de navegação flutuante. |

---

## 4. Recomendações de Próximos Passos para o Design

1. **Atualizar a Biblioteca de Componentes Base**:
   - Ajustar as propriedades de raio dos modais para 28px.
   - Ajustar a cor de contorno dos componentes de Chip e Botão Outlined para `#7E776F`.
   - Garantir que ícones de ação rápida (fechar, voltar, deletar) possuam moldura transparente (*padding box*) de 48×48px.
2. **Revisar o Hub do Perfil (`07.01`)**:
   - Atualizar o layout para refletir o ADR 0060 (entrada única de Configurações em vez de 8 linhas desdobradas).
3. **Incluir Telas de Estado Vazio**:
   - Criar variantes dos frames com os estados vazios ricos agora implementados (Favoritos vazios, Busca sem resultados, Estante sem livros).
