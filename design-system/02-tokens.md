# Tokens

Fonte canônica: [`design-kit/tokens.json`](../design-kit/tokens.json) (ADR 0009). Formato do
nome: `categoria.papel.variação`. Em código, `src/view/tokens.ts` expõe esses mesmos valores
(tema claro).

## 1. Primitivos (o valor bruto)

O IpêBook não define uma escala de cor primitiva própria (tipo `blue-600`) — os valores hex
entram direto como tokens semânticos do Material 3, prática comum em temas M3 gerados a partir
de uma cor-semente única (aqui, o verde ipê-do-cerrado).

### Espaço (grade de 4 px — compatível com o grid de 4 dp do Material 3)

| Token | Valor | Origem |
| --- | --- | --- |
| `space-1` | 4 px | Herdado (unidade base do grid M3) |
| `space-2` | 8 px | Herdado |
| `space-3` | 12 px | Herdado |
| `space-4` | 16 px | Herdado |
| `space-5` | 20 px | Herdado |
| `space-6` | 24 px | Herdado |
| `space-8` | 32 px | Herdado |
| `space-10` | 40 px | Herdado |
| `space-12` | 48 px | Herdado |
| `space-16` | 64 px | Herdado |

## 2. Semânticos (o significado)

### Cor (tema claro — tema escuro adiado, ver [01-principios.md](01-principios.md) §5)

| Token | Claro | Uso | Origem |
| --- | --- | --- | --- |
| `primary` | `#2c5e45` | Ação principal, item ativo, links, progresso (7,2:1 sobre `surface`) | Herdado (papel `primary` do M3; valor é a cor-semente da marca) |
| `on-primary` | `#ffffff` | Texto/ícone sobre `primary` (7,5:1) | Herdado |
| `secondary-container` | `#dce8de` | Tag Venda, chip selecionado, item ativo da navegação | Adaptado — M3 define o papel; o uso fixo "sempre Venda" é da marca |
| `tertiary-container` | `#f8d88a` | Tag Troca | Adaptado — mesmo motivo |
| `doacao-container` | `#f4ddd3` | Tag Doação | **Novo** — quarto papel de contêiner que o M3 não define |
| `on-doacao-container` | `#6e3a28` | Texto sobre `doacao-container` (7:1) | Novo |
| `error` | `#b3261e` | Erro de campo, botão Perigo (6,3:1 sobre `surface`) | Herdado |
| `surface` | `#fcfaf5` | Fundo de tela e barra superior | Herdado |
| `surface-container-low` | `#f7f3ec` | Cartões, campos | Herdado |
| `surface-container-high` | `#ece6dd` | Busca, diálogo, bolha recebida | Herdado |
| `on-surface` | `#1d1b18` | Texto principal (16,5:1 sobre `surface`) | Herdado |
| `on-surface-variant` | `#4d4740` | Texto de apoio, ícone inativo (8,8:1) | Herdado |
| `outline` | `#7e776f` | Borda de campo e botão Contornado (4,2:1) | Herdado |
| `focus-ring` | `#4e8a68` | Anel de foco, 3 px por fora (3,9:1 sobre `surface`) | Adaptado — cor própria da marca, não o azul padrão do M3 |
| `brand-brown` | `#58331f` | Logotipo e títulos da marca (10,6:1) | Novo — papel de marca sem equivalente M3 |
| `brand-amber` / `cover-sun` | `#f2bc45` / `#ddaf38` | Sol das capas ilustrativas; nunca texto | Novo |

Lista completa (~50 tokens, claro e escuro) em
[`design-kit/tokens.json`](../design-kit/tokens.json), campo `color.tokens`.

### Tipografia

| Token | Família | Tamanho | Peso | Altura de linha | Uso | Origem |
| --- | --- | --- | --- | --- | --- | --- |
| `displayLarge` (brand-large-title) | Source Serif 4 | 32 px | 700 | 40 px | Título de tela raiz, logotipo | Novo — família extra sobre a escala M3 |
| `brand-card-title` | Source Serif 4 | 19 px | 700 | 24 px | Título de livro em cartões/linhas de lista e título do estado vazio | Novo — não existe ainda em `src/view/tokens.ts`; ver nota abaixo |
| `m3-title-lg` | Roboto | 22 px | 400 | 28 px | Título da barra superior | Herdado |
| `m3-body-lg` | Roboto | 16 px | 400 | 24 px | Texto de campo, busca, bolha de mensagem | Herdado |
| `m3-body-md` | Roboto | 14 px | 400 | 20 px | Texto corrido, descrições | Herdado |
| `m3-label-lg` | Roboto (500) | 14 px | 500 | 20 px | Rótulo de botão, chip, aba | Herdado |
| `m3-label-sm` | Roboto (500) | 11 px | 500 | 16 px | Rótulo da barra de navegação | Herdado |

Escala completa (Android M3, iOS, Web, Documentação) em `design-kit/tokens.json`, campo
`type.groups`.

### Forma e elevação

| Token | Valor | Uso | Origem |
| --- | --- | --- | --- |
| `radius-sm` | 8 px | Chip, tag | Herdado |
| `radius-lg` | 16 px | Cartões, FAB | Herdado |
| `radius-xxl` | 28 px | Diálogo | Herdado |
| `radius-full` | 9999 px | Botão em pílula, busca, avatar, badge | Herdado |
| `elevation-1` | sombra dupla, ~30%/15% | Cartões elevados (capas) | Herdado |
| `elevation-3` | sombra única, ~18% | FAB, diálogo, snackbar | Herdado |

### Movimento

| Token | Valor | Uso | Origem |
| --- | --- | --- | --- |
| `duration-short2` | 100 ms | Toque e foco | Herdado |
| `duration-short4` | 200 ms | Chips, troca de aba | Herdado |
| `duration-medium2` | 300 ms | Diálogo, snackbar | Herdado |

### Nomes no código (`src/view/tokens.ts`)

`design-kit/tokens.json` usa nomes de papel M3 (`primary`, `on-surface-variant`...); o módulo
TypeScript consumido pelo código usa uma API própria com um grupo `colors.m3` só para os papéis
M3 ainda sem equivalente nas chaves antigas (ver [ADR 0009](../docs/adr/0009-design-kit-tokens-como-fonte-unica.md)).
Os exemplos de código em [04-componentes/](04-componentes/) usam a coluna "Em código" abaixo —
**não** os nomes M3 da tabela de cor desta seção.

| Papel M3 (`tokens.json`) | Em código (`tokens.colors`) |
| --- | --- |
| `primary` | `action` |
| `on-primary` | branco literal (`#ffffff`) — ainda não tem token próprio |
| `surface` | `surface` |
| `on-surface` | `text` |
| `on-surface-variant` | `secondaryText` |
| `outline` | `border` |
| `secondary-container` (fundo de item ativo, Tag Venda) | `soft` (item ativo) / `badge.sale.background` (Tag) |
| `on-secondary-container` | `badge.sale.text` |
| `tertiary-container` / `on-tertiary-container` | `badge.trade.background` / `badge.trade.text` |
| `doacao-container` / `on-doacao-container` | `badge.donation.background` / `badge.donation.text` |
| `error` | `error` |
| `focus-ring` | não tem token em `tokens.ts` — usar o valor de `design-kit/tokens.json` (`#4e8a68`) |
| `scrim` | não tem token em `tokens.ts` — usar o valor de `design-kit/tokens.json` (`#00000052` claro) |
| papéis M3 sem chave antiga equivalente (`onSurface`, `surfaceContainer*`, `focusRing` etc.) | `colors.m3.*` |

`on-primary`, `focus-ring` e `scrim` são uma lacuna real: ainda não têm token próprio em
`src/view/tokens.ts`. Até alguém adicioná-los a `colors.m3`, qualquer código novo que precise
desses papéis deve citar o valor de `design-kit/tokens.json` num comentário, não escrever o hex
sem explicação (ver exemplo em [04-componentes/dialogo.md](04-componentes/dialogo.md)).

## 3. Tokens de componente (onde é usado)

| Token | Aponta para | Origem |
| --- | --- | --- |
| `button.bg` (filled) | `primary` | Herdado |
| `button.label` (filled) | `on-primary` | Herdado |
| `button.radius` | `radius-full` | Herdado |
| `button.bg-pressed` | `primary` + camada 12% | Herdado |
| `button.bg-disabled` | `on-surface` 12% / rótulo 38% | Herdado |
| `textfield.border` | `outline` (normal) / `primary` (foco) / `error` (erro) | Herdado |
| `tag.venda.bg` | `secondary-container` | Adaptado |
| `tag.troca.bg` | `tertiary-container` | Adaptado |
| `tag.doacao.bg` | `doacao-container` | Novo |
| `navitem.active.bg` | `secondary-container` | Herdado |

## 4. Modo escuro

Todos os tokens semânticos de cor já têm um valor `dark` equivalente em
`design-kit/tokens.json` (ex. `primary` claro `#2c5e45` → escuro `#9fd4b3`), mas **não entram em
código nesta etapa** — decisão registrada em
[ADR 0008](../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md). Quando o tema escuro
entrar em escopo, só os tokens semânticos mudam de valor; nenhum componente muda de estrutura.

## 5. Versão legível por máquina

A versão machine-readable já existe: [`design-kit/tokens.json`](../design-kit/tokens.json), no
formato de tokens do artifact original do Figma (campos `name`/`value`/`usage` por token, não o
formato W3C Design Tokens). `src/view/tokens.ts` é o módulo TypeScript gerado a partir dele para
consumo em código (ver [ADR 0009](../docs/adr/0009-design-kit-tokens-como-fonte-unica.md)).
