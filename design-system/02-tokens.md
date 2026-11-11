# Tokens

Fonte canônica dos valores: [`tokens.json`](tokens.json) ([ADR 0010](../docs/adr/0010-design-system-substitui-design-kit.md)).
Em código, [`src/view/tokens.ts`](../src/view/tokens.ts) é o espelho tipado que expõe a API consumida pelos componentes:
`colors` (paleta clara), `darkColors` (paleta escura), `spacing`, `radius`, `typography`,
`motion`, `elevation` e `accessibility`. Os nomes da API TypeScript não são uma cópia literal
dos nomes M3 do JSON; a tabela de conversão abaixo é o contrato para implementação. Em caso de
divergência, o valor do JSON canônico prevalece e o módulo TypeScript deve ser atualizado no
mesmo trabalho.

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

### Cor (temas claro e escuro)

| Token | Claro | Uso | Origem |
| --- | --- | --- | --- |
| `primary` | `#2b6334` | Ação principal, item ativo, links, progresso (7,2:1 sobre `surface`) | Herdado (papel `primary` do M3; valor é a cor-semente da marca) |
| `on-primary` | `#ffffff` | Texto/ícone sobre `primary` (7,5:1) | Herdado |
| `secondary-container` | `#dce9dc` | Tag Venda, chip selecionado, item ativo da navegação | Adaptado — M3 define o papel; o uso fixo "sempre Venda" é da marca |
| `tertiary-container` | `#FDE68A` | Tag Troca e acentos solares de troca (Spec 116 / ADR 0104) | Adaptado — papel tonal ouro de ipê vivo |
| `on-tertiary-container` | `#451A03` | Texto sobre `tertiary-container` (>8:1 WCAG AAA) | Adaptado |
| `doacao-container` | `#f4ddd3` | Tag Doação | **Novo** — quarto papel de contêiner que o M3 não define |
| `on-doacao-container` | `#6e3a28` | Texto sobre `doacao-container` (7:1) | Novo |
| `error` | `#b3261e` | Erro de campo, botão Perigo (6,3:1 sobre `surface`) | Herdado |
| `surface` | `#fcfaf5` | Fundo de tela e barra superior | Herdado |
| `surface-container-low` | `#f7f3ec` | Cartões, campos | Herdado |
| `surface-container-high` | `#ece6dd` | Busca, diálogo, bolha recebida | Herdado |
| `on-surface` | `#1d1b18` | Texto principal (16,5:1 sobre `surface`) | Herdado |
| `on-surface-variant` | `#4d4740` | Texto de apoio, ícone inativo (8,8:1) | Herdado |
| `outline` | `#7e776f` | Borda de campo e botão Contornado (4,2:1) | Herdado |
| `focus-ring` | `#4e8a68` | Anel de foco (2 px de largura e 4 px de folga na API TypeScript) | Adaptado — cor própria da marca, não o azul padrão do M3 |
| `brand-brown` | `#58331f` | Logotipo e títulos da marca (10,6:1) | Novo — papel de marca sem equivalente M3 |
| `brand-amber` / `cover-sun` | `#F59E0B` / `#DDAF38` | Âmbar solar e sol das capas ilustrativas; nunca texto | Novo |
| `book-page` | `#fcfaf5` | Papel pólen para leitura confortável sem ofuscamento | Novo — Metáfora do Livro |
| `book-ink` | `#3c302a` | Tinta mineral/café com contraste AAA (>12:1) | Novo — Metáfora do Livro |
| `nature-foliage` | `#2b6334` | Verde botânico da copa do ipê para botões principais | Novo — Metáfora Botânica |
| `nature-foliage-deep` | `#1e4e27` | Verde folhagem profundo para área da capa de livros à Venda e foco | Novo — Metáfora Botânica |
| `ipe-bloom` | `#F5B718` | Amarelo ouro canônico da florada do ipê para banner de doações, capa/tag de Doação e favoritos | Novo — Metáfora do Ipê |
| `ipe-petal-soft` | `#FFFBEB` | Chão de pétalas de ipê frescas para fundos e acolhimento | Novo — Metáfora do Ipê |
| `ipe-ribbon` | `#F5B718` | Fita marcadora de página de cetim do ipê | Novo — Metáfora do Livro & Ipê |

### Cores Canônicas por Modalidade na Vitrine e Filtros

Para manter a fidelidade editorial desenhada para a identidade do IpêBook (ADR 0104):
- **Venda:** Verde Folhagem Profundo (`#1E4E27`, `tokens.colors.nature.foliageDeep`) na área superior da capa (`carouselCardCoverArea`), badge em pílula verde com texto branco (`#FFFFFF`) e ponto sólido verde no chip.
- **Troca:** Marrom Tronco/Couro (`#58331F`, `tokens.colors.brandBrown`) na área superior da capa, badge em pílula marrom com texto branco (`#FFFFFF`) e ponto sólido marrom no chip.
- **Doação:** Amarelo Ouro Solar (`#F5B718`, `tokens.colors.ipe.bloom`) na área superior da capa, badge em pílula amarela com texto marrom tronco profundo (`#451A03`, contraste AAA 8,3:1), ponto sólido amarelo no chip e fundo do banner comunitário *"Doações da semana"*.

Lista completa (~50 tokens, claro e escuro) em
[`tokens.json`](tokens.json), campo `color.tokens`.

### Tipografia

| Token | Família | Tamanho | Peso | Altura de linha | Uso | Origem |
| --- | --- | --- | --- | --- | --- | --- |
| `displayLarge` (brand-large-title) | Source Serif 4 | 32 px | 700 | 40 px | Título de tela raiz, logotipo | Novo — família extra sobre a escala M3 |
| `brand-card-title` | Source Serif 4 | 19 px | 700 | 24 px | Título de livro em cartões/linhas de lista e título do estado vazio | Novo — definido no JSON; a escala TypeScript atual usa `fontFamily.brand` com estilos existentes |
| `m3-title-lg` | Roboto | 22 px | 400 | 28 px | Título da barra superior | Herdado |
| `m3-body-lg` | Roboto | 16 px | 400 | 24 px | Texto de campo, busca, bolha de mensagem | Herdado |
| `m3-body-md` | Roboto | 14 px | 400 | 20 px | Texto corrido, descrições | Herdado |
| `m3-label-lg` | Roboto (500) | 14 px | 500 | 20 px | Rótulo de botão, chip, aba | Herdado |
| `m3-label-sm` | Roboto (500) | 11 px | 500 | 16 px | Rótulo da barra de navegação | Herdado |

Escala completa (Android M3, iOS, Web, Documentação) em `tokens.json`, campo
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

`tokens.json` usa nomes de papel M3 (`primary`, `on-surface-variant`...); o módulo
TypeScript consumido pelo código usa uma API própria com um grupo `colors.m3` só para os papéis
M3 ainda sem equivalente nas chaves antigas (ver [ADR 0010](../docs/adr/0010-design-system-substitui-design-kit.md)).
Os exemplos de código em [04-componentes/](04-componentes/) são didáticos e podem usar
`tokens.colors` para manter o exemplo curto. Em produção, componentes que participam do tema
devem obter a paleta por `useTheme()`; a coluna "Em código" abaixo define os nomes disponíveis,
**não** os nomes M3 da tabela de cor desta seção.

| Papel M3 (`tokens.json`) | Em código (`tokens.colors`) |
| --- | --- |
| `primary` | `action` |
| `on-primary` | `colors.m3.onPrimary` |
| `surface` | `surface` |
| `on-surface` | `text` |
| `on-surface-variant` | `secondaryText` |
| `outline` | `border` |
| `secondary-container` (fundo de item ativo, Tag Venda) | `soft` (item ativo) / `badge.sale.background` (Tag) |
| `on-secondary-container` | `badge.sale.text` |
| `tertiary-container` / `on-tertiary-container` | `badge.trade.background` / `badge.trade.text` |
| `doacao-container` / `on-doacao-container` | `badge.donation.background` / `badge.donation.text` |
| `error` | `error` |
| `focus-ring` | `colors.m3.focusRing` |
| `book-page` / `book-ink` | `colors.book.page` / `colors.book.ink` |
| `nature-foliage` / `nature-sprout` | `colors.nature.foliage` / `colors.nature.sprout` |
| `ipe-bloom` / `ipe-bloom-deep` / `ipe-ribbon` | `colors.ipe.bloom` / `colors.ipe.bloomDeep` / `colors.ipe.ribbon` |
| `scrim` | não há chave própria em `tokens.ts`; o componente `Dialog` mantém uma constante local documentada |
| papéis M3 sem chave antiga equivalente (`onSurface`, `surfaceContainer*`, `focusRing` etc.) | `colors.m3.*` |

`on-primary` e `focus-ring` já têm token em `colors.m3`. `scrim` continua sem uma chave
dedicada na API TypeScript; o `Dialog` usa uma constante local nomeada e vinculada ao token
conceitual do JSON. Novos componentes não devem repetir essa constante sem necessidade.

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
| `ribbon.ipe` | `colors.ipe.ribbon` | Novo |

## 4. Modo escuro

Os tokens semânticos de cor têm valores `light` e `dark` em `tokens.json` (por exemplo,
`primary` claro `#2b6334` e escuro `#98d6a2`). A paleta escura é exposta por `darkColors` e
selecionada pelo `ThemeProvider`, conforme a preferência resolvida pelo
`useThemeViewModel`. A paleta noturna foi refinada para garantir conforto visual e contraste AAA:
- As badges mantêm suas cores canônicas e vibrantes de domínio nos dois temas (ADR 0104), garantindo identificação imediata;
- `badge.sale` usa verde botânico profundo (`#1E4E27`) com texto `#FFFFFF`;
- `badge.trade` usa marrom tronco (`#58331F`) com texto `#FFFFFF`;
- `badge.donation` e `badge.reserved` usam amarelo ouro solar (`#F5B718`) com texto marrom profundo (`#451A03`, 8,3:1);
- `ipe.container` no escuro usa `#38290E` e texto `#FFE099` (10,5:1).
Todas as combinações atingem ou superam WCAG AAA para texto e elementos de status.

## 5. Versão legível por máquina

A versão machine-readable dos tokens reside em [`tokens.json`](tokens.json), mantida sincronizada
com a implementação ativa de [`src/view/tokens.ts`](../src/view/tokens.ts) como fonte canônica de verdade
(ver [ADR 0010](../docs/adr/0010-design-system-substitui-design-kit.md) e [ADR 0104](../docs/adr/0104-cores-canonicas-modalidades-e-vitrine-home.md)).
