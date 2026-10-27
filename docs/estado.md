# Estado e continuidade

Documento consolidado de continuidade técnica e produto do Ipebook (Piripiri, PI).

Conferência atual: **2026-10-26** (92 specs e 65 ADRs numerados, 206 arquivos de teste e 1.458 testes automatizados 100% passando).

**Layout web largo no padrão do Figma "APP · 30 · Web · Responsivo" (2026-10-27, em andamento):** com janela de 960 px ou mais na web (`useIsWideWeb`), o app troca a barra inferior pelo **cabeçalho web** (`WebHeader`, Figma `34:70`: marca, busca, Início/Pesquisa/Estante, Anunciar, Conversas com selo e avatar com iniciais). A Boas-vindas ganha o layout largo (`01.01`) e Entrar, Criar conta e Esqueci a senha o painel da marca em duas colunas (`AuthShell`, `01.02`–`01.04`). A Início usa grade de 5 colunas e faixa de atalhos (`02.01`); o Explorar tem o painel Filtros à esquerda (`WebFilterSidebar`), resultados em 4 colunas e o cartão "Não achou o livro?" (`02.02`/`02.05`); o Favoritos vira grade com filtros Todos/Disponíveis/Reservados (`02.06`); o detalhe do livro tem duas colunas, com as ações no cartão lateral e miniaturas das fotos (`03.01`); a Estante usa coluna de 1440 px e o botão "Anunciar livro" (`05.01`). Celular e janelas estreitas não mudam. Validado em 1.459 testes e, no Chrome headless por CDP (1440x1000), em Boas-vindas, Entrar, Criar conta, Início e Pesquisa; Favoritos, Estante e Livro não foram vistos (exigem sessão e dados). **Perfil, Anunciar e Conversas (2026-10-27):** o Meu perfil mostra Atividade e Conta em duas colunas (`07.01`), o Anunciar ganha a prévia do anúncio ao lado do formulário (`04.01`) e as Conversas abrem o chat ao lado da lista na web larga (`06.01`) com o painel "Sobre a troca" à direita; a Estante ganha a tabela Livro/Situação/Ação (`05.01`) e o perfil público lista os anúncios da pessoa (`03.04`). Conferidos no Chrome headless por CDP com o app em modo memória (`EXPO_PUBLIC_BACKEND=memory`, porta 8082); o chat embutido não foi visto porque o modo memória não tem conversa aceita. **Pendências:** Conservação do Explorar só tem "Bom estado" (o modelo tem `all`/`good`; o Figma mostra quatro condições); ilustrações das capas (estrelas, ondas, ipê, sol, montanhas) não baixadas; chip de bairro e destaque com números na Início; telas `01.05`–`01.16`; banner "quer trocar" da Estante (`05.01`, não conferido); avaliações no perfil público (`03.04`: o app só lista as avaliações da própria sessão, falta consulta para outra pessoa); telas de confirmação e erro das seções 04, 06, 07 e 09.

**Fotos do anúncio, Configurações e formulários (2026-10-27, Spec 092):** a etapa de fotos de Anunciar agora abre câmera e galeria (antes só aceitava colar um link); Configurações ganhou cartão da conta, bairro padrão, limpar histórico de buscas, "Falar com a equipe" (e-mail do suporte) e sair da conta; campos de senha têm mostrar/ocultar e todos os formulários de acesso usam preenchimento automático e a ação do teclado; modais com barras translúcidas. Validado em 1.458 testes; conferido no Galaxy A16 (galeria e envio) e confirmado funcional pelo usuário.

**Melhorias de usabilidade (2026-10-27, Spec 091):** chat com foto e rolagem ao fim; Anunciar com campos largos, ISBN em uma linha e barra de ações enxuta; cores por modalidade e por categoria (chips e fundo da capa); filtros reorganizados; galeria de fotos corrigida no Android; "Conversar", bloquear e denunciar (anúncio e pessoa) no perfil público; proteção contra toque duplo; canal Realtime único nas notificações; selo de propostas na barra de navegação. Validado em 1.430 testes; **pendente aplicar as migrações `202610270001` e `202610270002` no Supabase remoto e conferir no Galaxy A16**.

**Apagar conversa (2026-10-27, Spec 090):** toque longo numa conversa aceita abre "Apagar conversa?"; a conversa é ocultada só para quem apagou (tabela `v2_hidden_conversations`, migração `202610270001`) e volta se chegar mensagem nova. Validado em 1.400 testes; **pendente aplicar a migração no Supabase remoto e conferir no Galaxy A16**.

**Conversas com proposta no topo, tempo vivo e chat mais legível (2026-10-27, Spec 089):** a proposta recebida pendente fica no topo da lista com o selo "Nova proposta"; o horário relativo se atualiza a cada minuto; o chat ganhou cabeçalho com a foto da outra pessoa, agrupamento de mensagens seguidas, respiro no fim e "Combinar" como botão tonal. Validado em 1.396 testes; **pendente conferência manual no Galaxy A16**.

**Teclado não cobre os campos (2026-10-26, Spec 088):** no Expo SDK 58 em modo tela cheia (edge-to-edge), o `softwareKeyboardLayoutMode: "resize"` não encolhe a janela no Android, e o `KeyboardAvoidingView` com `behavior="padding"` também falha lá, porque calcula o padding pela sobreposição do seu quadro com o quadro do teclado (resultado zero quando a janela nunca encolhe). A raiz `KeyboardAwareRoot` em `src/app/_layout.tsx` agora é a única fonte de desvio do teclado: `useAnimatedKeyboardInset` (`src/view/useKeyboardInset.ts`) lê a geometria reportada pelo evento nativo (`endCoordinates`, em `keyboardWill/Did...`) e entrega um `Animated.Value` que desliza o `paddingBottom` junto com o teclado, no Android e no iOS; na web o navegador já encolhe a área útil. Para não empurrar duas vezes, os `KeyboardAvoidingView` próprios de `chat`, `profile` e `createListing` foram removidos. Validado em 1.388 testes; **pendente conferência manual no Galaxy A16**.

**Fotos menores e Supabase sempre ativo (2026-10-26, Spec 087):** as fotos passam a ser reduzidas para 1080 px antes do envio (`expo-image-manipulator`), em vez de chegar até 1,5 MB, e o workflow `manter-supabase-ativo.yml` consulta o banco a cada 2 dias para o plano gratuito não pausar o projeto. **Pendente: cadastrar os segredos no GitHub e conferir o envio de foto no aparelho.**

**Conversas e notificações em tempo real (2026-10-26, Spec 086):** nenhuma tabela estava na publicação `supabase_realtime`, então a assinatura do chat nunca recebia mensagens. A migração `202610260003` publica mensagens, notificações e pedidos (a RLS filtra o que cada pessoa recebe); a central de notificações e a lista de Conversas recarregam sozinhas, sem piscar. O perfil público também passou a abrir o Instagram ao tocar no @ e a esconder "Conversar"/"Denunciar" no próprio perfil. Validado em 1.381 testes; **pendente aplicar a migração no Supabase remoto e conferir em dois aparelhos**.

**Foto da outra pessoa e encontro mais leve (2026-10-26, Spec 084):** corrigido o avatar que mostrava o ipê mesmo quando a pessoa tinha foto — `getRequestDetail` passou a devolver `counterpartPhotoUrl`, os recebidos `requesterPhotoUrl` e as Conversas buscam nome e foto de quem anunciou. Antes do encontro, "Concluir negociação" fica neutro com o atalho "Já fizemos a entrega" (o botão principal volta depois do encontro); os pontos seguros viraram linhas tocáveis com "Rota". Validado em 1.374 testes e no Galaxy A16.

**Acompanhar encontro com a ação do momento no topo (2026-10-26, Spec 083):** manchete menor, sem o aviso "Negociação aceita!" (a etapa "Aceita" já informa), etapa em andamento destacada em verde e anunciada como "Etapa atual", cartão do encontro antes da pessoa e o cartão "Participantes" virou uma linha com avatar, nome, papel ("Anunciou o livro"/"Quer o livro") e botão "Conversar". Validado em 1.371 testes e no Galaxy A16.

**Conversa em tela cheia (2026-10-26, Spec 082):** o chat deixou de ser modal dentro de "Acompanhar encontro" e virou a rota `/conversa/[id]` no padrão do Figma `06.02`: título com o nome da outra pessoa, cartão do livro com etiqueta da modalidade e "Combinar" (abre `/negociacao/[id]`), balões meus/da outra pessoa com horário "8h40", separadores "Hoje/Ontem/sáb, 24 out" (`src/viewmodel/chatTimeline.ts`), rolagem até a última mensagem, sugestões de primeira mensagem e "Reenviar" na falha. A aba Conversas e "Abrir conversa" levam à tela; o estado vazio segue o `06.09` ("Encontrar um livro"). `NegotiationChatModal` removido. Validado em 1.370 testes e no Galaxy A16.

**Refinos do acompanhamento do encontro (2026-10-26, Spec 080):** puxar para atualizar sem esconder o conteúdo, aviso "Sua vez" quando o convite da outra pessoa espera confirmação e pontos seguros recolhidos quando o encontro já está combinado. Validado em 1.299 testes; sem conferência em aparelho.

**Acompanhamento do encontro (2026-10-26, Spec 079):** "Acompanhar encontro" ganhou andamento Aceita → Encontro → Concluída; o cartão do encontro diz "Hoje"/"Amanhã"/"Em n dias" ou que o horário passou e tem "Como chegar" ao ponto escolhido; a conclusão só é sugerida depois do encontro e o banner muda para "Negociação concluída" após avaliar. Validado em 1.299 testes; sem conferência em aparelho.

**Usabilidade do anúncio (2026-10-26, Spec 077):** "Continuar" da etapa 1 valida título, autor e preço da venda e mostra o erro no campo (antes só ao publicar); cada etapa abre no topo; Voltar do Android recua uma etapa; "Buscar" ISBN fica desativado sem código. Validado em 1.291 testes; sem conferência em aparelho.

**Editar perfil com foto pela câmera/galeria e Instagram (2026-10-26, Spec 081, ADR 0065):** a foto deixou de ser link colado: botões "Galeria" e "Câmera" (`expo-image-picker`, recorte 1:1), validação por *magic bytes* e 5 MB em `ProfilePhotoUseCases` e envio ao bucket `book-photos` em `<id>/perfil/` (sem migração de Storage). "Rede social" virou **Instagram** (`@perfil`, letras/números/ponto/_ até 30, sem link). No Meu perfil o Instagram fica dentro do cartão de leitor e abre o perfil; o selo do ipê saiu desse cartão; plural "1 publicação/1 troca". Upload real confirmado no Galaxy A16. Dependência nova `expo-image-picker`; permissões de câmera/fotos atualizadas no `app.json` (valem no próximo build EAS).

**Correção: coluna `push_token` sem migração (2026-10-26, ADR 0062):** o app lia e gravava `v2_user_preferences.push_token`, mas nenhuma migração criava a coluna; no Supabase remoto a consulta falhava e "Editar perfil" mostrava "Não foi possível consultar as preferências." (telefone e bairro não carregavam nem salvavam). Nova migração aditiva `202610260001_push_token_preferencias.sql` (coluna + `grant` explícito, que faltava e impedia testar a tabela no PGlite), cenário em `scripts/verificar-migracoes.mjs` (falhou antes, passa depois) e checagem da coluna no diagnóstico remoto, que agora acusa a pendência. Coluna confirmada no Supabase remoto em 2026-10-26 (`information_schema` e `npm run health:supabase:remote` com sucesso, 22 de 22 migrações).

**Perfil com a identidade Ipê + livro (2026-10-26, Spec 078):** Meu perfil e Editar perfil ganharam o **cartão de leitor** (`ReaderCard`): fundo âmbar de ipê, lombada marrom como capa de livro, avatar com anel de flor, nome em serifa e o medalhão do ipê em papel recortado (`IpeMark`, `src/view/assets/ipe-medalhao.png`, arte enviada pelo usuário). No Editar perfil o cartão é a pré-visualização ao vivo ("Assim seu cartão aparece"). Números do perfil em serifa marrom e flor de ipê nos rótulos de seção. Tokens `ipe-*` novos em `design-system/tokens.json` e `src/view/tokens.ts`. Depois: o `Avatar` sem foto passou a mostrar o ipê (fim das iniciais) e os ícones do app (Android adaptativo e monocromático, splash, favicon e PWA) passaram a usar a mesma arte; o ícone nativo só muda num build EAS novo. Validado em 1.299 testes e no Galaxy A16 (claro); tema escuro não conferido no aparelho.

**Aba Conversas como lista de conversas e rótulos do perfil (2026-10-26, Spec 076):** o destino "Conversas" (`/meus-pedidos`) deixou de abrir "Meus pedidos" e passou a listar as negociações enviadas e recebidas (sem recusadas) no padrão do Figma `06.01`/`06.09`: avatar, nome da outra pessoa, última mensagem do chat ("Você: …" quando minha), horário relativo e "Sobre <livro>"; pendentes mostram "Proposta recebida"/"Aguardando resposta". Novo `useConversationsViewModel` (reaproveita `useRequestList`, agora genérico) e `src/view/conversations/conversations.tsx`. "Atividade"/"Conta" do Meu perfil passaram à cor primária, como no `07.01`. Limitação: uma consulta de mensagens por negociação aceita. Validado em 1.285 testes e no Galaxy A16.

**Estante no padrão do Figma `05.04`–`05.08` (2026-10-26, Spec 075):** a aba Estante ganhou cabeçalho "Estante" com subtítulo e "+", cartões de resumo por modalidade, seletor de abas por plataforma (*segmented buttons* M3 no Android, controle segmentado do Figma no iPhone) com distintivo de propostas em aberto, cartão "Precisa da sua atenção" com "Ver proposta", lista de anúncios em cartão e estados vazios de Propostas e Concluídos com "Ver meus anúncios". Sem "Recusar" no cartão nem edição em lote; o terceiro cartão conta anúncios para doar. Validado em 1.278 testes e no Galaxy A16; iPhone verificado só por teste.

**Detalhe do livro no padrão Material 3 do Figma `03.01`–`03.03` (2026-10-26, Spec 074):** `src/view/listings/bookDetail.tsx` ganhou capa em destaque de borda a borda na cor da modalidade, botões de ícone tonais sobre a capa, valor com etiqueta, cartão "Aceita em troca"/"Doação para quem vai ler", lista Conservação/Categoria/Retirada e barra fixa com "Compartilhar" (WhatsApp) e ação principal por modalidade ("Tenho interesse", "Propor troca", "Quero receber"). "Conversar" do Figma não foi feito porque o chat só existe dentro de uma negociação. Validado em 174 arquivos / 1.274 testes e no Galaxy A16 (claro e escuro).

**Tempo real no chat, persistência de rascunhos e push token remoto (2026-10-26, Specs 017/060/061, ADR 0062):** consolidadas três capacidades centrais de experiência e infraestrutura.
1. **Chat em tempo real (Spec 061, ADR 0044 e ADR 0062):** o contrato `IMessageDataSource` ganhou `subscribeToMessages`, implementado no `SupabaseMessageDataSource` via Supabase Realtime Channels ouvindo eventos `INSERT` filtrados por `request_id=eq.${requestId}` com desinscrição e remoção limpa do canal (`removeChannel`), e no `MemoryMessageDataSource` com gerenciamento de listeners reativos; o hook `useNegotiationChatViewModel` subscreve reativamente na montagem e deduplica mensagens recebidas por ID.
2. **Rascunhos de anúncio persistidos no dispositivo (Spec 017 / Spec 072, ADR 0062):** `useCreateListingViewModel` passou a gerenciar `saveDraft`, `loadDraft` e `clearDraft` no `AsyncStorage` (`ipebook.rascunho_anuncio`); a tela de anúncio restaura o rascunho anterior ao abrir com formulário vazio, oferece descarte explícito, salva o progresso a cada avanço de etapa e limpa automaticamente ao publicar com sucesso ou reiniciar.
3. **Rascunhos de anúncio no servidor (Spec 017 completos, branch `feat/rascunhos-anuncio-017`):** entregues os rascunhos como entidade persistente fiel à spec, preservando o buffer local do item anterior. `Book["status"]` ganhou `"draft"` e a coluna opcional `draft_step`; a migração `202610260002_rascunhos_anuncio.sql` flexibiliza os CHECKs de título/autor e da regra preço/modalidade só para rascunho, esconde rascunho de terceiros/anônimos na política SELECT e cria DELETE restrito ao dono. Casos de uso `listDrafts`/`saveDraft`/`discardDraft`/`publishDraft`, `validateDraftPayload` tolerante, `useDraftsViewModel`, a tela `Rascunhos` (`/rascunhos`), o botão "Salvar para depois" e o atalho em "Meus anúncios" completam o fluxo; publicar transiciona `draft → available`. **Pendência:** a migração ainda não foi aplicada ao Supabase remoto.
4. **Sincronização remota de Push Token (Spec 060, ADR 0043 e ADR 0062):** o domínio `UserPreferences` passou a contemplar o campo `pushToken`, mapeado na coluna `push_token` de `v2_user_preferences` no Supabase e em memória, com preservação em atualizações parciais via `UserPreferencesUseCases` e exposto no `useUserPreferencesViewModel` com a ação `setPushToken`.
Validado em 177 arquivos / **1.303 testes**, `tsc --noEmit` limpo, `check:architecture` sem violações, `check:numbering` com 73 specs e 62 ADRs e `npm run build:web` exportando a rota `/rascunhos`.

**Editar perfil sem dados inventados e guarda de alterações (2026-10-26, Spec 034 continuação, ADR 0061):** a tela "Editar perfil" (`src/view/profile/profile.tsx`) parou de afirmar coisas falsas e de descartar trabalho em silêncio. O bairro nasceu `null` (antes fixo em **"Centro"**) e mostra "Selecionar bairro" enquanto não houver escolha; o hub (`profileHub.tsx`) passou a consultar `useUserPreferencesViewModel` e exibe o bairro real, caindo para "Piripiri, PI" — o `"Centro"` fixo do cartão saiu junto. "Bairros mais frequentes" virou **"Bairros de Piripiri"**, que é o que os seis atalhos realmente são, com texto apontando o seletor completo. Carregando a sessão a tela mostra `LoadingState` "Carregando sessão" e, sem conta, um cartão "Entre para editar seu perfil" com o botão "Entrar ou criar conta" — o `return null` que deixava tudo em branco acabou. `dirty` é **derivado dos valores carregados** (perfil + preferências), então salvar desliga a guarda sozinho; voltar pela barra superior ou pelo botão físico do Android (`BackHandler`, pulado no Web) abre o diálogo "Descartar alterações?" com "Continuar editando". Foto passou a ter "Remover foto" em um toque, o bloqueio de salvamento por erros em linha ganhou região viva ("Confira os campos destacados para salvar.") e o nome mostrou contador `n/60`; o `accessibilityLabel="Salvar"` redundante saiu do botão (WCAG 2.5.3). O mock compartilhado `tests/mocks/react-native.ts` ganhou `BackHandler`. **A foto continua por link**: escolher da galeria exigiria a dependência nova `expo-image-picker` e decisão própria de storage (só existe o bucket `book-photos`, de capas de livros), registrada como rejeitada no ADR. Validado em 171 arquivos / **1218 testes**, cobertura 89,68% statements / 80,63% branches / 88,28% functions / 90,95% lines, `tsc --noEmit` limpo, `check:architecture` sem violações (327 arquivos), `check:numbering` com 73 specs e 61 ADRs e `test:sql` aprovado. Pendência: o Figma `07.02` não desenha o diálogo de descarte, o botão "Remover foto" nem o estado de convidado.

**Etapa "Detalhes" do anúncio alinhada ao Figma `04.05` (2026-10-26, Spec 072 continuação):** `src/view/listings/createListingStep3.tsx` deixou de ser a fila de 17 chips de bairro e passou a seguir o frame `12:360`. O bairro virou **campo contornado** (nó `99:2259`) que abre o `NeighborhoodSelectorModal` já existente, com `allowAllNeighborhoods={false}` para exigir um bairro único, rótulo flutuante, valor "Centro, Piripiri", botão "Limpar bairro selecionado" e o texto de suporte "Só o bairro aparece no anúncio.". Os grupos Conservação e Categoria usam `Chip size="regular"` (40 dp, área de toque de 48 dp), o rótulo do grupo passou para 16/24 peso médio (antes 18/26 semibold) e o contador da descrição ficou **alinhado à direita** como no Figma (`39/280`), pelo `helperTextAlign` novo em `TextField`. As ações saíram do fim da rolagem e passaram para a **barra fixa inferior** `surface-container` (nós `12:269`, `28:750` e `12:413`), renderizada pelo fluxo em `createListing.tsx` com `KeyboardAvoidingView` no iOS (o Android já usa `softwareKeyboardLayoutMode: "resize"`) e coluna de 560 dp no Web; "Continuar", "Usar estas fotos" e "Publicar anúncio" agora ficam sempre visíveis, e um erro de submissão rola o conteúdo até ele. O botão "Salvar rascunho" do frame **não foi implementado**: rascunhos persistidos são a Spec 017, ainda aberta. Validado em 171 arquivos / 1205 testes, cobertura 89,8% statements / 80,53% branches / 88,33% functions / 91,09% lines, `tsc --noEmit` limpo e `check:architecture` sem violações (327 arquivos). Pendência: conferência visual em dispositivo físico Android.

**Filtro do Explorar alinhado ao Figma `02.03`/`02.04` (2026-10-26, Spec 028 evoluída, ADR 0057):** o painel de filtros embutido saiu de cena. O ícone de ajustes do Explorar passa a abrir a tela **"Filtrar livros"** (`src/view/search/FilterSheet.tsx`), com manchete em serifa, modalidade, categoria dinâmica, condição do livro (novo), preço e ordenação; as escolhas ficam em rascunho e só valem ao tocar em **"Mostrar N livros"**, com `N` recalculado a cada escolha. Os filtros aplicados viram **chips removíveis** (`02.04`) abaixo do resumo da faixa de resultados (`"3 livros à venda · Bom estado"`), e a ordenação ganhou a folha própria `SortSheet` (`"Mais recentes"`, `A-Z`, `Menor preço`, `Maior preço`). O ícone de ajustes exibe distintivo com a quantidade de filtros ativos; a fileira de chips de categoria passou a ser extraída do catálogo carregado (antes era fixa em categorias inexistentes). A lógica pura de filtro, ordenação, chips e resumo vive em `src/viewmodel/searchFilters.ts`, e `Chip` ganhou a variante `size="regular"` (40 dp) usada apenas na tela de filtros.

**Meu perfil curto e Configurações no topo (2026-10-26, Spec 073 continuação, ADR 0060):** "tem muita coisa no perfil" virou corte. A entrada de Configurações saiu da lista e passou a ser uma **engrenagem no cabeçalho** de "Meu perfil" (rótulo "Abrir configurações", alvo de 48 dp, disponível também sem conta); as linhas "Privacidade e dados" e "Pessoas bloqueadas" migraram para a nova seção **"Conta e dados"** de Configurações, exibida apenas com sessão (`Settings` consulta `useAuthViewModel`, como já faz `BlockedUsers`); Termos e Ajuda já estavam em "Sobre o IpêBook". `ProfileHubProps` perdeu quatro callbacks e a seção "Conta" desaparece por inteiro para visitante. O perfil ficou com 7 destinos (4 em Atividade, 2 em Conta e "Sair") contra 12 anteriores. Regra registrada no ADR: o Figma `07.01` ainda desenha as oito linhas e nenhuma engrenagem — **o frame precisa ser atualizado no design system**; os registros das Specs 048/065/072 descrevem o layout anterior e foram preservados como histórico.

**Configurações como hub de preferências do dispositivo (2026-10-26, Spec 073 continuação, ADR 0058):** a tela de Configurações saiu da seção única de aparência e passou a ter conteúdo real, disponível inclusive sem conta. "Dados neste dispositivo" oferece **Limpar dados salvos**, que remove a chave do catálogo offline escrita por `CachedBookDataSource` (mesma constante exportada `BOOKS_LIST_CACHE_KEY`, sem tocar em outras preferências), com estados de carregamento, sucesso e erro amigável anunciados por região viva; "Sobre o IpêBook" exibe a **versão do aplicativo** (`Constants.expoConfig?.version` via `expo-constants`) e atalhos condicionais para Termos, Exportar/excluir dados e Ajuda. Camadas novas: contrato `ILocalCacheDataSource`, adaptadores AsyncStorage/Memória, `LocalCacheUseCases`, `useSettingsViewModel` e registro no container; mock/alias de `expo-constants` no Vitest. Na mesma rodada, Meu perfil sem sessão deixou de exibir o perfil de demonstração ("Lucas Andrade") e passou a mostrar o estado de convidado com entrada "Entrar ou criar conta" e apenas itens públicos. Validado em 171 arquivos / 1203 testes, cobertura 89,82% statements / 80,44% branches / 88,42% functions / 91,11% lines, `check:architecture` sem violações (327 arquivos), `check:numbering` com 73 specs e 60 ADRs e `test:sql` aprovado.

Correções de comportamento da mesma entrega: `resetFilters` limpa filtros e ordenação preservando termo e bairro (antes "Limpar filtros" apagava o termo digitado), a ordenação deixou de contar como filtro ativo e o estado vazio passou a distinguir filtros, termo e catálogo vazio. Validado em 168 arquivos / 1180 testes, `tsc --noEmit` limpo, `check:architecture` sem violações e conferência no Galaxy A16 (contagem 8 → 3 na tela de filtros, chips removíveis, ordenação A-Z e reinício por "Limpar filtros").

**Alinhamento global das telas Android ao Figma (2026-10-26, Spec 072, ADR 0055 e ADR 0056):** 137 telas do inventário visual organizadas em 6 grupos de trabalho disjuntos (Grupos A a F: Acesso, Livro/Comunidade, Publicação, Estante/Negociação, Perfil/Configurações e Descoberta). Componentes compartilhados alinhados às diretrizes M3 (fundo de superfície `#FCFAF5`, campos contornados com rótulo flutuante e raio 4, botões, chips e TopAppBar com serifa da marca `Source Serif 4`). 33 de 33 tarefas concluídas e validadas com 0 violações arquiteturais e verificação em dispositivo físico Android.

**Configurações e tema do perfil (2026-10-26, Spec 073, ADR 0036):** experiência de perfil estruturada com entrada "Configurações" no `ProfileHub` (`src/view/profile/profileHub.tsx`), remoção do seletor duplicado de tema na raiz do hub e criação da tela dedicada `Settings` (`src/view/profile/settings.tsx` e rota `/perfil/configuracoes`), permitindo escolher entre Sistema, Claro e Escuro com persistência local em `AsyncStorage` (`ipebook.preferenciaDeTema`). Sincronização do tema resolvido com a moldura visual do sistema (`expo-status-bar` com `style="auto"` e `"userInterfaceStyle": "automatic"` no `app.json`).

**Entregas consolidadas (2026-10-23):**
- **Spec 060 (Notificações push locais e lembretes de encontros, ADR 0043):** Infraestrutura desacoplada com `expo-notifications` (~58.1.6) para agendamento local de lembretes de encontros com cálculo de antecedência (60 min antes do horário no ponto seguro de Piripiri), canal de notificações no Android com alta prioridade e implementações real (`ExpoPushNotificationService`) e em memória (`MemoryPushNotificationService`) no container de DI.
- **Spec 059 (Leitor de código de barras físico com câmera para ISBN, ADR 0042):** Concretização com hardware da promessa do Figma `04.01` ("Ler ISBN com a câmera"). Integração do `expo-camera` (~58.0.12) via modal acessível `BarcodeScannerModal` com overlay de mira visual e leitura instantânea de EAN-13, EAN-8 e UPC; solicitação de permissão com fallback amigável; encadeamento automático com a busca de metadados da Spec 058. Integrado via PR #201.
- **Spec 058 (Busca e preenchimento de livro por ISBN, ADR 0041):** Concretização interativa do card de ISBN da etapa 1 de anúncio (`/anunciar`, Figma `04.01`), com validação de ISBN-10 e ISBN-13, integração à API aberta da Open Library com timeout resiliente de 5 s e modo memória para testes offline. Integrado via PR #199.
- **Spec 057 (Convidar amigos e compartilhar o app, ADR 0040):** Fechamento do fluxo Figma `08.02` e `07.01` com ação no perfil e rota `/perfil/convidar`, mensagem acolhedora da comunidade de Piripiri, abertura direta do WhatsApp e fallbacks nativo e web. Integrado via PR #198.
- **Spec 056 (Bloqueio e Desbloqueio de Usuários, ADR 0039):** Gestão de pessoas bloqueadas no hub de perfil (`/perfil/bloqueados`, Figma `07.10`–`07.12`), com diálogo acessível de confirmação, tabela `v2_blocked_users` com RLS rígida e migração `202610230002_bloqueio_usuarios.sql`. Integrado via PR #197.
- **Leitura anônima de perfis públicos (ADR 0038 / Spec 053):** Política RLS em `v2_profiles` e `v2_ratings` para visitantes (`anon`) verem o nome de quem anuncia e avaliações comunitárias sem expor dados privados.
- **Modularização arquitetural de telas:** `createListing.tsx` (565 linhas) e `myListings.tsx` (457 linhas) decompostos em submódulos coesos em `src/view/listings/`.
- **Prevenção automatizada de colisões:** Script `scripts/verificar-numeracao.mjs` (`npm run check:numbering`) integrado aos testes e ao pipeline de validação (73 specs e 61 ADRs numerados, sem colisões).
- **Supabase remoto 100% sincronizado (2026-10-26):** as 21 migrações locais (`supabase/migrations/`) estão aplicadas e verificadas no banco remoto via `scripts/verificar-migracoes-remotas.mjs`, incluindo `202610240001_mensagens_negociacao.sql` (Spec 061), aplicada manualmente pelo SQL Editor do painel do Supabase e comprovada pelo `npm run health:supabase:remote` (exit 0). As 12 tabelas, o bucket de Storage e as funções RPC de LGPD, aceite atômico e validação de envio de mensagem estão operacionais. A tabela `v2_negotiation_messages` responde HTTP 401 à chave anon exatamente pelo `revoke` previsto na migração (RLS rígida funcionando como projetado); o script de diagnóstico foi corrigido para tratar 401/403 como "objeto existe e é restrito", eliminando o falso positivo de migração pendente.

**Pendências abertas (2026-10-26):** conferências em dispositivo físico Android das Specs 037, 038, 052, 056, 057, 058, 059 e 060. Concluídas em 2026-10-26: aplicação remota de `202610240001_mensagens_negociacao.sql` e revogação do token de acesso temporário do Supabase usado no `migration repair`.

**Spec 052 validada localmente (Issue #188; criada como 044 e renumerada porque o número passou a ser da spec de alinhamento complementar):** a negociação aceita ganhou o encontro combinado
(Figma `06.04`, `06.05`, `06.11`–`06.14`): convite com local entre os pontos seguros, dia nos próximos
sete dias e faixa de horário; confirmação só pela outra pessoa; reagendamento que volta a aguardar
confirmação; cancelamento com diálogo; aviso `meeting_update` a cada mudança. Nova tabela
`v2_meetings` com RLS e gatilhos (ADR 0037). `npm run validate` passou com 1032 testes em 145
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

- **Testes automatizados**: **1205 testes passando** em **171 arquivos de teste** (`npm run validate`), cobrindo entidades, validadores, casos de uso, adaptadores, viewmodels, componentes e integração.
- **Cobertura de código**: Statements 89,8%, Branches 80,53%, Functions 88,33%, Lines 91,09%.
- **Integridade arquitetural**: **100% em conformidade (327 arquivos verificados)** no MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`), verificado pelo comando `npm run check:architecture` (0 violações). Apenas `src/di/container.ts` e testes têm permissão para instanciar ou importar adaptadores de `src/infra/`.
- **Validação de banco e migrações SQL**: **21 migrações** descobertas e executadas em ordem no PGlite (`npm run test:sql`), com rejeição de versões duplicadas e políticas/RPCs 100% aprovadas. No Supabase remoto, **21 de 21 aplicadas e verificadas** (`npm run health:supabase:remote` com exit 0 em 2026-10-26, incluindo `202610240001_mensagens_negociacao.sql` — Spec 061 / ADR 0044).
- **Semente Oficial da Beta (`npm run db:seed`)**: Script `scripts/popular-catalogo-piripiri.mjs` gerando 10 anúncios realistas distribuídos pelos bairros de Piripiri, PI com exportação SQL via `--sql`.
- **Backend Supabase**: Configurado para desenvolvimento; as 21 migrações aplicadas no banco remoto e o diagnóstico `health:supabase:remote` cobrindo as tabelas operacionais, com `202610240001_mensagens_negociacao.sql` aplicada e verificada em 2026-10-26.
- **Rotas Web compiladas (`npm run build:web`)**: Exportação estática do Expo Router gerou com sucesso o pacote web em `dist/`, totalizando **32 rotas estáticas** (as rotas `/perfil/editar`, `/perfil/avaliacoes` e `/perfil/seguranca` foram acrescentadas pela Spec 048, e `/perfil/configuracoes` pela Spec 073):
  - `/` (Catálogo e vitrine inicial com selo da beta em Piripiri, PI)
  - `/perfil` (Perfil do usuário autenticado)
  - `/perfil/configuracoes` (Configurações e tema do aplicativo - Spec 073)
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

No app ativo em desenvolvimento, 32 rotas cobrem as jornadas essenciais da beta. A discrepância numérica entre 137 e 32 decorre de **decisões deliberadas de escopo e arquitetura**, devidamente documentadas em ADRs:

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
- `specs/052-combinar-encontro/`: Combinar encontro com local, dia e horário, confirmação, reagendamento e cancelamento (Issue #188, implementada, validada localmente e com a migração remota aplicada).
- `specs/053-correcoes-home-pesquisa-detalhe/`: Seis defeitos encontrados em aparelho real via `adb` — Home e Pesquisa não rolavam (lista de livros colapsava para altura 0; resultados ficavam com 146px), UUID de quem anunciou exposto no detalhe, carrossel desalinhando 12dp por clique, título de seção sobrepondo o "Ver mais" e capa de 44dp num card de 152dp. Corrigidos e verificados no aparelho. **Atravessa deliberadamente a fronteira de escopo das Specs 044/045** (os três arquivos são da Maria Clara), com autorização expressa do Micael em 22/10/2026 — ver a seção "Exceção de escopo" da spec. Pendência de leitura anônima de `v2_profiles` resolvida pelo ADR 0038 / migração 202610230001.
- `specs/054-tema-escuro-tokens/`: Tema escuro — infraestrutura (tokens, `ThemeProvider`, preferência no dispositivo) e primeira fatia vertical (Issue #144, ADR 0036; era 044).
- `specs/055-tema-escuro-telas-restantes/`: Tema escuro aplicado às telas e componentes restantes (Issue #189; era 045).
- `specs/056-bloqueio-de-usuarios/`: Bloqueio e desbloqueio de pessoas (Figma `07.10` a `07.12`, ADR 0039), tabela `v2_blocked_users`, rota `/perfil/bloqueados` e confirmação via `Dialog`.
- `specs/057-convidar-amigos/`: Compartilhamento do app e convite de amigos via WhatsApp (Figma `08.02` e `07.01`, ADR 0040).
- `specs/058-busca-livro-isbn/`: Consulta e autopreenchimento de metadados de livros por ISBN via Open Library (Figma `04.01`, ADR 0041).
- `specs/059-scanner-codigo-barras-isbn/`: Scanner físico com câmera para leitura instantânea de código de barras de ISBN (Figma `04.01`, ADR 0042).
- `specs/060-notificacoes-push-e-lembretes/`: Notificações push locais e agendamento de lembretes para encontros nos pontos seguros (ADR 0043).
- `specs/061-chat-mensagens-negociacao/`: Chat e mensagens transacionais dentro da negociação ativa (Figma `06.06`, ADR 0044).
- `specs/062-alinhamento-home-figma/`: Alinhamento visual da tela inicial (Home) ao Figma `02.01` (ADR 0045).
- `specs/063-concluir-negociacao-avaliacoes/`: Conclusão da negociação presencial e avaliação mútua entre leitor e anunciante (Figma `06.09`–`06.10`, ADR 0046).
- `specs/064-alinhamento-estante-figma/`: Alinhamento visual da tela Minha Estante ao Figma `05.01` e `05.02` (ADR 0047).
- `specs/065-alinhamento-perfil-figma/`: Alinhamento visual da tela Meu Perfil ao Figma `07.01` e `07.02` (ADR 0048).
- `specs/066-alinhamento-explorar-figma/`: Alinhamento visual da tela Explorar / Pesquisa ao Figma `02.02` (ADR 0049).
- `specs/067-seletor-bairro-piripiri/`: Seletor de bairro comunitário e filtro territorial de Piripiri na Home e no Explorar (Figma `02.01` e `02.02`, ADR 0050).
- `specs/068-secao-hiperlocal-home-e-filtro-supabase/`: Seção hiperlocal na Home e filtro remoto de bairro no Supabase (Figma `02.01` e `02.02`, ADR 0051).
- `specs/069-alinhamento-encontros-negociacao-figma/`: Alinhamento visual dos encontros e negociação presencial ao Figma (Figma `06.04` e `06.05`, ADR 0052).
- `specs/070-selo-bairro-cards-livro/`: Selo de bairro nos cards de livro na Home e na Pesquisa (Figma `02.01` e `02.02`, ADR 0053).
- `specs/071-historico-encontros-negociacao/`: Histórico de encontros na negociação e perfil (Figma `06.05`, `06.11`, `07.01`, ADR 0054).
- `specs/072-alinhamento-global-figma/`: Alinhamento global das telas Android ao Figma Material 3 (137 telas, Grupos A a F, ADR 0055 e ADR 0056).
- `specs/073-configuracoes-e-tema/`: Configurações e tema do perfil — tela dedicada `/perfil/configuracoes`, seleção entre Sistema, Claro e Escuro e integração à moldura do sistema (ADR 0036).
