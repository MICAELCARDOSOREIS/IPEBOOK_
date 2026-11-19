# Acessibilidade

Razão de contraste = (L1 + 0,05) / (L2 + 0,05), com L1 a luminância relativa da cor mais clara e
L2 a da mais escura (fórmula WCAG). Os seis pares abaixo foram recalculados manualmente e batem
com os valores documentados em `tokens.json`. Os demais tokens de cor não foram auditados manualmente — só têm a razão declarada na origem
(artefato do Figma).

## Contraste dos pares de cor

| Par (texto sobre fundo) | Cores | Razão | Mínimo | Resultado |
| --- | --- | --- | --- | --- |
| `on-surface` sobre `surface` | `#1d1b18` sobre `#fcfaf5` | 16,47:1 | 4,5:1 | Aprovado |
| `on-surface-variant` sobre `surface` | `#4d4740` sobre `#fcfaf5` | 8,79:1 | 4,5:1 | Aprovado |
| `error` sobre `surface` | `#b3261e` sobre `#fcfaf5` | 6,27:1 | 4,5:1 | Aprovado |
| `focus-ring` sobre `surface` | `#4e8a68` sobre `#fcfaf5` | 3,90:1 | 3:1 (elemento gráfico/foco) | Aprovado |
| `on-secondary-container` sobre `secondary-container` | `#132a17` sobre `#dce9dc` | 12,20:1 | 4,5:1 | Aprovado |
| `on-doacao-container` sobre `doacao-container` | `#6e3a28` sobre `#f4ddd3` | 7,02:1 | 4,5:1 | Aprovado |

## Alvos de toque

- Mínimo de 48 dp em todo elemento tocável (Android/Web): botão (52 px, 48 px nas variantes
  Texto/Perigo), item da barra de navegação, campo de texto. O número vem de
  `tokens.accessibility.touchTarget`; nenhum componente fixa 48 como literal solto.
- Chip (32 px) e Tag (20 px, não tocável) são menores visualmente, mas a área de toque do Chip é
  ampliada para 48 dp por padding invisível — confirmar em cada componente de
  [04-componentes/](04-componentes/).
- Padrão quando a arte precisa ficar menor que 48 dp (pino do mapa, ícone pequeno): ampliar a área
  de toque com `hitSlop` no nativo, calculado a partir do token —
  `const PIN_HIT_SLOP = Math.max(0, (tokens.accessibility.touchTarget - PIN_SIZE) / 2)` — e com uma
  extensão invisível (`::after`) na web, definida no CSS global de `src/app/+html.tsx`. O desenho
  permanece 36 dp; o toque chega a 48 dp.
- Linhas de escolhas (chips, modalidades) usam `flexDirection: "row"` com `flexWrap: "wrap"`, para
  quebra em telas estreitas e texto ampliado em vez de corte.

## Foco

- Anel sólido em `colors.m3.focusRing`, por fora do componente, com a largura e a folga
  definidas por `tokens.accessibility.focusWidth` e `tokens.accessibility.focusOffset` — nunca
  removido, nem em botão nem em campo. A API atual usa 2 px de largura e 4 px de folga.
- Ordem de foco segue a ordem visual de leitura (topo → base, esquerda → direita).

## Leitor de tela

- Ícone sozinho sem rótulo visível ganha `accessibilityLabel` ("Voltar", "Limpar busca").
- Badge numérico entra no rótulo do elemento ("Conversas, 3 não lidas"), não fica separado.
- Mensagens de status (sucesso, snackbar) usam `accessibilityLiveRegion="polite"`
  (equivalente React Native de `role="status"`).
- Diálogo prende o foco e devolve ao gatilho ao fechar (ver
  [04-componentes/dialogo.md](04-componentes/dialogo.md)).
- Todo `<Modal>` declara a barreira da camada de trás com `accessibilityViewIsModal` (e
  `navigationBarTranslucent`/`statusBarTranslucent` no Android); a verificação
  `npm run check:design-system` reprova modal sem barreira.
- Estados de tela usam os componentes padrão — `LoadingState`, `ErrorState` e `OfflineState` —, com
  `accessibilityRole="alert"` e `accessibilityLiveRegion="polite"` no texto de erro/offline, para que
  o leitor de tela anuncie a falha sem mover o foco. A tela não monta texto de erro ou de carregamento
  próprio fora desses componentes (Spec 125, ADR 0097).
- Rótulo de botão descreve o destino da ação, não o mecanismo ("Abrir gerenciamento de exportação e
  exclusão dos meus dados", em vez de "Solicitar exclusão").

## Texto ampliado e movimento

- Nenhum componente usa altura fixa em elemento com texto: até 200% do tamanho de fonte do
  sistema, listas e cartões crescem em vez de cortar o texto.
- Com "Remover animações" ativo no sistema, deslocamentos viram esmaecimento
  (`tokens.motion.duration.standard`), sem remover o feedback.

## Acessibilidade no iOS (Apple HIG & Spec 137)

As diretrizes do Apple Human Interface Guidelines (HIG) para acessibilidade no iPhone são atendidas
de forma nativa e isolada (`Platform.OS === "ios"`), sem interferir nas regras de Material Design 3
do Android ou Web:

- **Alvos de toque Apple HIG:**
  O HIG exige área interativa mínima de 44×44 pt. Os botões de navegação, fechar folha inferior e ações
  rápidas no iOS adotam exatamente 44×44 pt (ex.: `TopAppBar.backButton`, `BottomSheet.closeButton`),
  enquanto os botões primários e campos de texto mantêm 48 a 52 dp/pt, superando a exigência mínima.
- **Reduzir Transparência (`UIAccessibilityIsReduceTransparencyEnabled`):**
  Superfícies translúcidas Liquid Glass (`BottomSheet`, `NavigationBar`, `IosCardSurface` e `OutlinedButton`)
  utilizam o hook `useReduceTransparency`. Quando o usuário ativa a redução de transparência nos Ajustes
  do iOS, o efeito de desfoque translúcido ou preenchimento semitransparente é automaticamente substituído
  por superfícies opacas sólidas em `colors.m3.surfaceContainer` ou `colors.background`, eliminando
  interferência visual de fundos e garantindo contraste estrito. Os componentes `ScreenContainer` e
  `TopAppBar` operam diretamente com fundo sólido, sem necessidade de translucidez.
- **Dynamic Type (Tipografia Adaptável) e Escala Multiplataforma:**
  Para suportar os tamanhos ampliados de acessibilidade (Accessibility Sizes AX1–AX5 no iOS e configurações de fonte no Android/Web) sem quebras críticas de layout:
  - O uso defensivo de `maxFontSizeMultiplier` e `numberOfLines={1}` é multiplataforma (protegendo a interface no iOS, Android e Web), sendo o teto restritivo de 1.2x–1.3x reservado exclusivamente para barras e cabeçalhos fixos de navegação:
    - Cabeçalhos fixos e barras superiores (`TopAppBar`, `BottomSheet`) aplicam `maxFontSizeMultiplier={1.3}`
      com `numberOfLines={1}` e `accessibilityRole="header"`, permitindo que o leitor de tela (VoiceOver/TalkBack)
      leia o título integralmente sem que o texto expulse os botões de ação ou sobreponha controles da barra.
    - A barra inferior flutuante (`NavigationBar`) aplica `maxFontSizeMultiplier={1.2}` nos rótulos de abas
      e badges para preservar a geometria da cápsula deslizante e o toque ergonômico.
  - Áreas de conteúdo, cards e formulários não fixam altura vertical (`minHeight` ou livre) e crescem
    dinamicamente para acomodar o texto em tamanhos maiores sem limitação artificial de escala.
- **Leitor de Tela (VoiceOver):**
  - Componentes com semântica de grupo declaram papéis formais (`accessibilityRole="tablist"` na barra
    e `accessibilityRole="tab"` com `accessibilityState={{ selected }}` nos itens).
  - Títulos de telas e seções declaram `accessibilityRole="header"`.
  - Botões de fechar, voltar e limpar utilizam `accessibilityRole="button"` com rótulos descritivos
    em português.
- **Feedback Tátil Acessível (Haptics):**
  Ações significativas (favoritar, aplicar filtros, tocar em botões principais e fechar folhas) disparam
  micro-vibrações táteis (`triggerHaptic` com `selection`, `light` ou `success`) via `expo-haptics`,
  oferecendo confirmação multissensorial independente da pista visual.
