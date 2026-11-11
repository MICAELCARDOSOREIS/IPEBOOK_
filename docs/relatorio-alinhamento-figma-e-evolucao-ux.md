# Relatório de Alinhamento: Implementação vs. Figma

> **Status:** Documento técnico de referência para a equipe de design  
> **Data:** Novembro de 2026  
> **Objetivo:** Mapear todas as evoluções de UI, UX, acessibilidade (WCAG 2.2 AA) e fluidez implementadas no código do IpêBook que diferem dos mockups originais do Figma, fornecendo um guia prático de atualização para sincronizar os layouts no Figma.

---

## 1. Visão Geral e Motivações da Evolução

Durante o ciclo de desenvolvimento, testes com leitores em Piripiri e a auditoria de acessibilidade digital e design craft (baseada nas diretrizes WCAG 2.2 nível AA, Material Design 3 e ISO/IEC 25010), diversas telas receberam melhorias fundamentais que transcendem o layout estático inicial do Figma.

As principais razões para as divergências entre o código e o Figma são:
1. **Acessibilidade Digital Estrita (WCAG 2.2 AA)**:
   - Contraste mínimo de 4.5:1 para textos normais e 3:1 para limites de controles interativos (critério 1.4.11).
   - Áreas de toque confortáveis de no mínimo 48×48 dp (`hitSlop`).
   - Rótulos contextuais completos para leitores de tela (TalkBack e VoiceOver) sem colapso de nós filhos.
2. **Ergonomia Móvel e Thumb Zone**:
   - Botões principais de avanço e conclusão fixados na zona de alcance do polegar.
   - Prevenção de toques acidentais entre ações destrutivas e secundárias.
3. **Gestão de Teclado e Rolagem Contínua**:
   - Ajuste dinâmico de insets em telas edge-to-edge (Expo SDK 58) via `KeyboardAwareRoot`.
   - Dispensa de teclado ao rolar listas (`keyboardDismissMode="on-drag"`).
   - Processamento imediato do primeiro toque (`keyboardShouldPersistTaps="handled"`).
4. **Estados de Interface Ricos (Zero State & Loading Craft)**:
   - Estados vazios acolhedores e acionáveis, em vez de telas em branco.
   - Ação de "Desfazer" (*Undo*) para operações sensíveis.

---

## 2. Mapa Detalhado de Alterações por Tela

### 2.1. Home / Início (`02.01 · Início`, `12:128` e `146:457`)

| Elemento | Como está no Figma | Como foi implementado no Código | Motivo da Alteração | Como Atualizar no Figma |
| :--- | :--- | :--- | :--- | :--- |
| **Bordas dos Chips de Modalidade** | Borda fina em tom neutro suave (`outlineVariant` ~1.5:1) | Borda com contraste de **4.23:1** (`#7e776f` / `colors.m3.outline`) | Cumprir critério WCAG 1.4.11 para percepção de controles interativos | Aplicar cor de contorno `outline` (escurecer borda não selecionada) nos componentes de Chip. |
| **Tipografia dos Contadores e Preços** | Fonte padrão mista com variação de largura de números | `fontVariant: ["tabular-nums"]` em todos os valores monetários e contadores | Evita jitter/tremor visual em cards e carrosséis dinâmicos | Manter alinhamento numérico consistente em caixas de texto com números tabulares. |
| **Grid Responsivo no Mobile** | Lista vertical única ou carrossel com corte lateral brusco | Grade de 2 colunas no celular com respiro harmônico e cards com proporção concêntrica de raio | Otimização de visualização e aproveitamento de tela em dispositivos de 360–412dp | Ajustar frame mobile para grade de 2 colunas (`gap: 12px`, padding lateral `16px`). |
| **Carrosséis Horizontais** | Rolagem nativa sem indicador de fim | `showsHorizontalScrollIndicator={false}` e `overScrollMode="never"` | Elimina barras nativas cinzas sobrepostas às capas dos livros | N/A (especificação de comportamento). |

---

### 2.2. Explorar e Busca (`02.03 · Filtros`, `99:1733`, `183:3499` e `02.04 · Resultados`)

| Elemento | Como está no Figma | Como foi implementado no Código | Motivo da Alteração | Como Atualizar no Figma |
| :--- | :--- | :--- | :--- | :--- |
| **Botão de Ordenação** | Link simples em texto sem área de clique destacada | Pílula interativa com fundo `surfaceContainerHigh`, altura 40dp e ícone de swap | Ergonomia de toque na Thumb Zone e clareza de estado clicável | Substituir texto solto por cápsula/pílula com background cinza suave e texto primário. |
| **Limpeza de Filtros e Desfazer** | Apenas botão "Limpar filtros" estático | Limpeza acompanhada de Snackbar flutuante com botão **"Desfazer"** (*Undo*) | Evita perda acidental de parâmetros de busca elaborados pelo usuário | Criar variante do frame `02.04` exibindo a Snackbar com botão "Desfazer". |
| **Persistência de Filtros** | Cada abertura de tela reseta a busca | Filtros aplicados e ordenação são salvos no storage local do aparelho | Fluidez ao navegar entre detalhes de livro e voltar para a busca | Indicar em nota de design que a tela preserva o estado ativo da última busca. |
| **Chips de Categorias Rápidas** | Chips estáticos | ScrollView horizontal com chip "Todos" ativo por padrão e tons cromáticos por categoria | Flexibilidade para explorar múltiplas categorias sem abrir modal de filtros | Atualizar o carrossel de chips abaixo da barra de busca. |

---

### 2.3. Detalhes do Livro (`03.01`–`03.03 · Detalhe do livro`)

| Elemento | Como está no Figma | Como foi implementado no Código | Motivo da Alteração | Como Atualizar no Figma |
| :--- | :--- | :--- | :--- | :--- |
| **Botões de Ação na Hero (Voltar, Compartilhar, Favoritar)** | Ícones soltos sobre a imagem com áreas de toque inferiores a 40dp | Botões circulares com diâmetro mínimo de **48×48 dp**, `hitSlop` calibrado e `withPress` | WCAG 2.5.5 / 2.5.8 (Target Size) e prevenção de toques perdidos | Expandir o container visual/hit-area dos botões circulares da Hero para 48×48px. |
| **Barra Inferior Fixa (Ação Principal)** | Botão colado no rodapé cobrindo a última seção da página | `SafeAreaView edges={["bottom"]}` com `paddingBottom` dinâmico no ScrollView (`scrollBottomPadding.withBottomBar`) | Evita que a barra de "Tenho interesse" encubra links de denúncia ou livros parecidos | No layout mobile, adicionar padding inferior de 128px no fim do conteúdo rolável. |
| **Feedback de Favorito** | Apenas troca de ícone preenchido | Animação suave com feedback via Snackbar contextual ("Livro adicionado aos Favoritos") e ação rápida | Clareza imediata sobre o destino do livro salvo | Incluir mockup da notificação flutuante de confirmação. |

---

### 2.4. Publicação e Anúncio de Livros (`04.01`, `04.04`, `04.05`, `04.07`)

| Elemento | Como está no Figma | Como foi implementado no Código | Motivo da Alteração | Como Atualizar no Figma |
| :--- | :--- | :--- | :--- | :--- |
| **Campos de Texto (TextFields)** | Linhas ou caixas padrão sem especificação clara de foco e erro | Material 3 Outlined com floating label estável (`top: 16`), aria-live e contraste 3:1 | Acessibilidade cognitiva e prevenção de saltos de layout | Adicionar estados de foco, erro (borda vermelha com texto de ajuda) e desabilitado nos componentes. |
| **Remoção de Fotos na Etapa 2** | Ícone "X" minúsculo no canto superior da foto (~24dp) | Botão circular com `hitSlop={12}` garantindo área de toque de **48×48 dp** e fundo semitransparente | Impede toque acidental na foto ao tentar excluí-la e vice-versa | Aumentar a área de clique do botão "X" de exclusão de imagem. |
| **Ações Fixas com Teclado Aberto** | Barra de botões fixa cobrindo inputs durante digitação | Barra fixa oculta no mobile durante foco no teclado, com avanço via tecla "Next/Done" | Impede que o teclado virtual esmague o formulário e tape o input atual | Documentar comportamento de teclado nos fluxos de formulário. |
| **Etapa 3 - Box / Coleção** | Ausente no Figma inicial | Checkbox opcional de "Box ou coleção de livros" com campo numérico de volumes componentes | Requisito da comunidade para coleções de mangás, HQs e sagas literárias | Adicionar seção de Box/Coleção entre os campos de Conservação e Descrição. |

---

### 2.5. Estante / Meus Anúncios (`05.01`, `05.02`, `05.03`)

| Elemento | Como está no Figma | Como foi implementado no Código | Motivo da Alteração | Como Atualizar no Figma |
| :--- | :--- | :--- | :--- | :--- |
| **Botão Flutuante (FAB) "Anunciar Livro"** | Botão no cabeçalho ou flutuante sem considerar a barra de navegação | FAB Material 3 com posição calculada: `navBarPaddingBottom + navBarDockHeight + 16px` | Evita que o FAB sobreponha a cápsula de navegação flutuante inferior | Posicionar o FAB 16px acima do topo da barra flutuante de navegação nos protótipos. |
| **Card de Rascunhos** | Rascunhos ficavam em lista separada ou botão pequeno | Card em destaque (`DraftsCard`) na estante, exibido condicionalmente quando há rascunhos reais | Facilita a retomada de anúncios iniciados sem poluir a tela vazia | Adicionar variante da Estante com o card "Anúncios em andamento". |
| **Compartilhamento 1-Toque** | Apenas menu de 3 pontos para gerenciar | Botão direto de WhatsApp em cada linha de livro da estante | Aumenta a circulação orgânica de livros nos grupos locais de Piripiri | Inserir ícone de compartilhamento WhatsApp ao lado da seta de gerenciamento. |
| **Raios Concêntricos nas Linhas** | Cantos retos ou raios aleatórios | Fórmula de raios concêntricos: $R_{externo} = 16\text{dp}$, $R_{interno} = 12\text{dp}$ | Elimina a sensação visual de quinas "esmagadas" | Ajustar border-radius dos cards internos da estante. |

---

### 2.6. Pedidos, Propostas e Negociação (`06.01`–`06.05`)

| Elemento | Como está no Figma | Como foi implementado no Código | Motivo da Alteração | Como Atualizar no Figma |
| :--- | :--- | :--- | :--- | :--- |
| **Filtros de Pedidos** | Abas rígidas | Carrossel horizontal de pílulas com contadores tabulares: `Todos`, `Pendentes`, `Aceitos`, `Finalizados`, `Histórico` | Suporte a leitura rápida e alternância imediata de status | Atualizar a barra de filtros no topo da tela de pedidos recebidos/enviados. |
| **Rótulos dos Botões de Ação** | Botões genéricos "Aceitar" / "Recusar" | Rótulos acessíveis contextuais: *"Aceitar proposta de [Nome] para o anúncio [Título]"* | WCAG 2.4.4 / 2.4.6 (Contexto do link e da ação para usuários de tecnologias assistivas) | Adicionar especificação de acessibilidade nas anotações de design. |
| **Modal de Proposta (`ProposalSheet`)** | Janela rígida sem rolagem adaptativa | BottomSheet com raio canônico de **28dp**, dispensa de teclado ao arrastar (`on-drag`) e campo de mensagem com contador | Fluidez em telas compactas ao selecionar livro de contrapartida | Atualizar o raio dos cantos superiores do modal para 28px. |

---

### 2.7. Perfil e Configurações (`07.01`–`07.03`)

| Elemento | Como está no Figma | Como foi implementado no Código | Motivo da Alteração | Como Atualizar no Figma |
| :--- | :--- | :--- | :--- | :--- |
| **Avaliação por Estrelas** | Estrelas em amarelo claro com contraste insuficiente (<2:1) | Estrela com preenchimento em tom âmbar profundo (`#8C5000` / `colors.ipe.bloomDeep`) com contraste **>3.2:1** | WCAG 1.4.3 e 1.4.11 para visualização em fundo claro e escuro | Atualizar a paleta de cores das estrelas de avaliação para a nova cor âmbar. |
| **Linhas de Menu de Configurações** | Apenas texto central clicável | Linha inteira interativa com altura mínima de **48dp**, ícone semântico e seta indicativa | Ergonomia de toque sem exigir precisão milimétrica | Aumentar a altura de toque das linhas de opções para 48px. |
| **Ação de Salvar Perfil** | Botão preso no topo ou no rodapé fora de vista | Ação flutuante na Thumb Zone; ao abrir teclado, o botão se integra ao formulário com submissão direta via teclado | Permite salvar o perfil imediatamente sem forçar o fechamento manual do teclado | Documentar comportamento híbrido mobile da barra de salvar. |

---

### 2.8. Modais do Sistema & Seletor de Bairros

| Elemento | Como está no Figma | Como foi implementado no Código | Motivo da Alteração | Como Atualizar no Figma |
| :--- | :--- | :--- | :--- | :--- |
| **Diálogos de Confirmação (`Dialog.tsx`)** | Diálogos com raio de 12–16dp | Raio canônico Material 3 de **28dp** (`tokens.radius.xxl`), backdrop com fechamento ao toque externo | Consistência formal com a linguagem Material You | Atualizar componentes de Dialog para cantos arredondados de 28px. |
| **Seletor de Bairros (`NeighborhoodSelectorModal`)** | Lista estática sem busca | Campo de busca rápida no topo + lista com dispensa de teclado ao arrastar + estado vazio empático com botão de reset | Busca rápida entre os 17 bairros de Piripiri | Atualizar o componente modal de bairros com a barra de busca e estado vazio. |

---

## 3. Resumo da Paleta e Tokens de Design Atualizados

Para garantir que o arquivo de design tokens no Figma fique perfeitamente alinhado com o `src/view/tokens.ts`:

| Token | Valor no Código | Uso / Aplicação |
| :--- | :--- | :--- |
| `colors.m3.outline` | `#7E776F` | Contornos de botões outlined e chips (garante contraste > 3:1) |
| `colors.ipe.bloomDeep` | `#8C5000` | Estrelas de avaliação e destaques âmbar de alto contraste |
| `tokens.radius.xxl` | `28px` | Diálogos (`Dialog`), BottomSheets e painéis modais |
| `tokens.radius.card` | `16px` | Cards principais de livros e estante |
| `tokens.radius.cardSmall` | `12px` | Cards secundários aninhados |
| `tokens.accessibility.touchTarget` | `48px` | Altura e largura mínimas de qualquer controle interativo |
| `tokens.spacing[16]` | `16px` | Padding padrão de borda em telas móveis |

---

## 4. Checklist Prático para a Equipe de Design no Figma

- [ ] **1. Paleta de Cores**: Substituir a cor de borda de chips e botões outlined para a nova cor de alto contraste (`#7E776F`).
- [ ] **2. Estrelas de Avaliação**: Atualizar a cor das estrelas preenchidas no Perfil e na Negociação para `#8C5000`.
- [ ] **3. Cantos Arredondados**: Atualizar modais, BottomSheets e diálogos para raio de 28px.
- [ ] **4. Áreas de Toque**: Garantir que botões de cabeçalho, fechar e ícones de exclusão tenham caixa de toque delimitada de no mínimo 48×48px.
- [ ] **5. Estados Vazios (Zero States)**: Adicionar os novos layouts de estados vazios (Busca sem resultados com sugestão, Estante vazia com CTA de anúncio, Pedidos vazios com dicas de troca).
- [ ] **6. Insets Inferiores**: Incluir a folga inferior de 128px nos frames mobile com barra de navegação ativa para simular com fidelidade a rolagem real do aplicativo.
