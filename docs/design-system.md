# Design System — IpêBook

**Disciplina:** Interação Humano-Computador (IHC) & Programação para Dispositivos Móveis (PDM)  
**Instituição:** Instituto Federal do Piauí (IFPI) — Campus Piripiri  
**Equipe:** Maria Clara Almeida Martins, Micael Cardoso Reis, Antonio Carlos Gomes, Eric Vinícius dos Santos Oliveira  
**Versão do Documento:** 1.0  
**Fonte Visual Oficial:** [Figma — IpêBook](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%25C3%25AABook?t=xKQbpBwLpirB2jV2-0)  
**Contratos Técnicos:** [`design-system/tokens.json`](../design-system/tokens.json) e [`src/view/tokens.ts`](../src/view/tokens.ts)  
**Decisão Arquitetural:** [ADR 0004 — Design System e Tokens de IHC](adr/0004-design-system-e-tokens-ihc.md), [ADR 0010 — design-system/ substitui design-kit/ como fonte única](adr/0010-design-system-substitui-design-kit.md)
**Entrega completa (atividade IHC + PDM):** [`design-system/`](../design-system/)

---

## 1. Visão Geral e Princípios de IHC

O **Design System do IpêBook** formaliza as decisões de design, identidade visual e experiência do usuário (UX/UI) para o aplicativo móvel comunitário de venda, troca e doação de livros em Piripiri (PI).

### Princípios Norteadores
1. **Clareza antes da decoração:** O conteúdo literário (títulos, autores, capas e condições de negociação) é o protagonista. A interface não compete visualmente com as obras.
2. **Identidade Local e Acolhedora:** O design evoca o calor e a natureza de Piripiri através do Ipê Amarelo, do papel amarelado de livros físicos e de tons de verde que remetem à leitura serena e à sustentabilidade da reutilização.
3. **Acessibilidade por Padrão (WCAG 2.1 / 2.2 AA):**
   - Contraste cromático adequado entre texto e fundo.
   - Alvos de toque com área mínima de **48 × 48 dp**.
   - Informações críticas nunca transmitidas exclusivamente por cor.
   - Suporte nativo a leitores de tela e ampliação de fontes.
4. **Respeito às Plataformas Nativas:** Elementos interativos proporcionam ergonomia adequada tanto em telas de smartphones (390–430 dp) quanto em tablets e Web institucional.

---

## 2. Paleta de Cores (Identidade Visual Ipê)

A paleta de cores foi extraída e padronizada diretamente a partir das coleções de variáveis do arquivo oficial do Figma.

### 2.1 Cores Fundamentais da Marca

| Token | Hex | Amostra | Finalidade e Justificativa de IHC |
| :--- | :---: | :---: | :--- |
| `color.background` | `#F6F1E8` | Creme Suave | Fundo geral do app. Reproduz a textura acolhedora de folhas de livro (pólen/creme), reduzindo a fadiga visual em comparação ao branco puro (`#FFFFFF`). |
| `color.surface` | `#FCFAF5` | Creme Claro | Superfície de cartões, listas e seções elevadas, criando hierarquia de profundidade sutil sem necessidade de sombras pesadas. |
| `color.text` | `#3C302A` | Marrom Profundo | Cor principal de leitura e títulos. Proporciona alto contraste (> 8.5:1) sobre `#F6F1E8`, superando o critério WCAG AAA. |
| `color.secondaryText`| `#645B55` | Cinza Acolhedor | Metadados, subtítulos e textos auxiliares (contraste > 4.6:1 sobre o fundo). |
| `color.action` | `#2C5E45` | Verde Ipê Folha | Ações principais, botões afirmativos e destaque de navegação ativa. Transmite segurança e estabilidade. |
| `color.actionDeep` | `#2F503D` | Verde Profundo | Estados pressionados de botões e cabeçalhos escuros. |
| `color.highlight` | `#F4B942` | Amarelo-Ipê | Cor de celebração e identidade regional, remetendo à flor do Ipê Amarelo. Utilizada em detalhes de marca, marcadores e badges de reserva. |
| `color.gold` | `#D99719` | Ouro Antigo | Variação com alto contraste para ícones e estrelas de avaliação. |
| `color.soft` | `#E7F0EA` | Verde Névoa | Fundos de seleção, chips neutros e áreas de toque em repouso. |
| `color.border` | `#8F8478` | Traço Suave | Divisores, contornos de inputs e linhas de separação discretas. |

### 2.2 Semântica do Produto (Badges de Modalidade)

Para garantir que pessoas com daltonismo compreendam o anúncio, **cada modalidade combina cor de fundo, cor de texto e rótulo textual explícito**:

| Modalidade | Fundo (`background`) | Texto (`text`) | Significado no Produto |
| :--- | :---: | :---: | :--- |
| **Venda** | `#DCE8DE` | `#18291F` | Livro comercializado por valor financeiro em BRL. |
| **Troca** | `#F8D88A` | `#3A2A10` | Livro disponível para permuta por outro título. |
| **Doação** | `#F4DDD3` | `#6E3A28` | Livro disponibilizado gratuitamente para a comunidade. |
| **Reservado** | `#F4B942` | `#3C302A` | Livro em processo ativo de negociação/encontro. |
| **Concluído** | `#2F6B4F` | `#FFFFFF` | Negociação finalizada com sucesso. |

### 2.3 Capas Ilustrativas (Livros sem foto)

Quando um usuário cadastra um anúncio sem enviar foto da câmera, o app gera uma capa estilizada com fundo editorial:
- **Azul Noturno:** `#253C4F` (contraste com texto `#F6F1E8`)
- **Marrom Terra:** `#633E36` (contraste com texto `#F6F1E8`)
- **Verde Floresta:** `#30574A` (contraste com texto `#F6F1E8`)

### 2.4 Estados de Sistema e Feedback

- **Sucesso:** `#2F6B4F` (confirmação de operações concluídas)
- **Erro:** `#B3261E` (mensagens de alerta e validação de formulários)
- **Container de Erro:** `#F9DEDC` (fundo suave para caixas de erro)

---

## 3. Tipografia e Escala Tipográfica

A tipografia do IpêBook equilibra o conforto ergonômico da leitura em dispositivos móveis com a elegância do meio editorial.

### 3.1 Famílias Tipográficas
- **Interface e Controles (UI):** **Roboto** (Google Fonts / Sistema Nativo). Sans-serif versátil, neutra e com legibilidade otimizada para renderização em densidades variadas de pixels.
- **Identidade e Títulos de Destaque (Brand):** **Source Serif 4 Bold** (conforme [ADR 0007](adr/0007-serifa-da-marca.md)). Serifa humanista inspirada na tradição tipográfica de livros impressos, aplicada no logotipo e no cabeçalho inicial.

### 3.2 Escala Tipográfica Formal

| Nível / Estilo | Peso | Tamanho (`fontSize`) | Altura de Linha (`lineHeight`) | Aplicação no Aplicativo |
| :--- | :---: | :---: | :---: | :--- |
| **Display Large** | Bold (700) | 32 px | 40 px | Logotipo do IpêBook e títulos de boas-vindas do onboarding. |
| **Title Large** | SemiBold (600) | 24 px | 32 px | Títulos principais de tela (ex.: "Catálogo", "Detalhes do Livro"). |
| **Title Medium** | SemiBold (600) | 18 px | 26 px | Títulos de seções, modais e cartões de livros. |
| **Body Large** | Regular (400) | 16 px | 24 px | Texto de leitura corrente, sinopses, mensagens e campos de entrada. |
| **Body Medium** | Regular (400) | 14 px | 20 px | Informações de autor, data de publicação e orientações secundárias. |
| **Label Medium** | Medium (500) | 12 px | 16 px | Badges de modalidade, tags de status e legendas de abas. |

---

## 4. Espaçamentos, Dimensões e Layout

O sistema adota uma escala métrica baseada em múltiplos de **4 e 8 dp**, garantindo alinhamento harmônico de caixas e ritmo vertical consistente.

### 4.1 Escala de Espaçamento (`spacing`)

| Token | Valor (dp/px) | Uso Típico |
| :--- | :---: | :--- |
| `spacing[4]` | 4 px | Microespaçamentos entre ícone e rótulo em badges. |
| `spacing[8]` | 8 px | Espaço entre elementos compactos (título e subtítulo do livro). |
| `spacing[12]` | 12 px | Espaçamento interno de botões compactos e campos de formulário. |
| `spacing[16]` | 16 px | Margem padrão de telas compactas e preenchimento de cards. |
| `spacing[20]` | 20 px | Preenchimento interno horizontal de botões interativos principais. |
| `spacing[24]` | 24 px | Margem lateral padrão do aplicativo em dispositivos móveis. |
| `spacing[32]` | 32 px | Distância entre seções independentes de conteúdo. |
| `spacing[48]` | 48 px | Margem vertical para cabeçalhos e separação de blocos principais. |
| `spacing[56]` | 56 px | Altura de barras de navegação inferiores e cabeçalhos fixos. |
| `spacing[64]` | 64 px | Margem inferior em listas longas para evitar sobreposição pela navegação. |

### 4.2 Cantos Arredondados (`radius`)

- **Small (`8 px`):** Botões de ação, campos de formulário e inputs de texto.
- **Medium (`14 px`):** Cards de livros, caixas de diálogo e superfícies de destaque.
- **Large (`18 px`):** Painéis flutuantes e modais centrais.
- **Extra Large (`24 px`):** Folhas de ação deslizantes (*bottom sheets*).
- **Full (`9999 px`):** Chips de filtro, badges de modalidade e avatares de usuário.

---

## 5. Acessibilidade e Interação Humano-Computador (IHC)

As diretrizes de IHC atendem estritamente às normas internacionais de usabilidade e aos critérios do professor da disciplina.

### 5.1 Alvos de Toque Mínimos (Touch Targets)
- **Requisito Obrigatório:** Todo componente interativo (botões, ícones clicáveis, links, chips e itens de lista) possui área de contato mínima de **48 × 48 dp** (`accessibility.touchTarget = 48`).
- **Implementação:** Botões e áreas de toque usam `minHeight: 48` e `minWidth: 48` no React Native, garantindo acionamento confortável com o polegar sem disparos acidentais em elementos vizinhos.

### 5.2 Rótulos e Semântica para Leitores de Tela
- **Cabeçalhos Semânticos:** Todo título utiliza `accessibilityRole="header"`.
- **Botões e Ações:** Botões declaram `accessibilityRole="button"` e rótulos concisos que explicam a ação disparada (ex.: "Tentar novamente o carregamento de livros").
- **Alertas de Erro:** Mensagens de falha utilizam `accessibilityRole="alert"` para que o leitor de tela (TalkBack / VoiceOver) anuncie o problema imediatamente ao usuário.
- **Elementos Decorativos:** Elementos meramente estilísticos (como traços decorativos e ícones secundários) recebem `accessible={false}` para evitar poluição sonora no leitor.

### 5.3 Estados de Feedback Essenciais
Para garantir que o usuário nunca fique desorientado, toda tela implementa quatro estados mandatórios:
1. **Carregando (`loading`):** `ActivityIndicator` com cor temática de ação (`#2C5E45`) acompanhado de texto descritivo claro ("Carregando livros…").
2. **Vazio (`empty`):** Mensagem acolhedora que explica a ausência de dados e antecipa o que acontecerá quando houver conteúdo disponível.
3. **Erro com Recuperação (`error + retry`):** Mensagem em linguagem simples, sem termos técnicos indecifráveis, com botão de 48 dp para "Tentar novamente".
4. **Sucesso / Preenchido (`content`):** Apresentação hierarquizada dos dados com tipografia e espaçamentos do sistema.

### 5.4 Movimento e Transições (`motion`)
- **Microinterações:** 100 ms a 150 ms para feedback de toque (*pressed*) e seleções rápidas.
- **Transições Padrão:** 250 ms a 300 ms para abertura de modais e transição de abas.
- **Acessibilidade de Movimento:** Respeita a configuração de movimento reduzido do sistema operacional (`prefers-reduced-motion`), desativando transições bruscas quando solicitado pelo usuário.

---

## 6. Governança e Rastreabilidade do Código

- O arquivo JSON [`design-system/tokens.json`](../design-system/tokens.json) é o contrato canônico entre o Figma e o código (ver [ADR 0010](adr/0010-design-system-substitui-design-kit.md)).
- O módulo [`src/view/tokens.ts`](../src/view/tokens.ts) consome esse contrato e o disponibiliza fortemente tipado em TypeScript para os componentes React Native.
- As regras arquiteturais garantem que os tokens residam exclusivamente na camada de **View (UI)**, sem vazamento para as camadas de ViewModel, Caso de Uso ou Modelo.
