# 0014 — Ícones seguem a biblioteca nativa de cada plataforma

Data: 2026-10-15. Status: aceito.

## Contexto

Ao corrigir a barra de navegação do Figma para os 3 destinos do [ADR 0011](0011-navegacao-tres-destinos.md)
(Início, Pesquisa, Perfil) nas três plataformas, ficou evidente que não havia uma regra explícita
de onde vêm os ícones de cada uma — Android usava o Material 3 Design Kit por já estar instalado
no arquivo, iPhone usava a biblioteca oficial "iOS and iPadOS 26" (SF Symbols) pelo mesmo motivo,
e a Web usava um ícone de busca local desenhado à mão, sem relação com nenhum sistema de
referência.

O [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md) já estabelece que Android segue
Material Design 3 e iOS segue a linguagem visual da Apple como adaptações de plataforma, não um
segundo sistema-base — mas não menciona ícones nem a Web.

## Decisão

Cada plataforma usa a biblioteca de ícones do seu próprio sistema de design nativo:

- **Android** → ícones do **Material Design** (Material Symbols, via Material 3 Design Kit já
  instalado no arquivo Figma).
- **iPhone** → ícones da **HIG da Apple** (SF Symbols, via biblioteca oficial "iOS and iPadOS 26"
  já instalada no arquivo Figma).
- **Web** → ícones do **Fluent 2 System Icons** (Microsoft, open source/MIT). Como a biblioteca
  Figma do Fluent 2 não estava disponível para adicionar ao arquivo no momento desta decisão, os
  ícones web são importados diretamente do SVG oficial do repositório público
  [microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons) e
  tingidos com as variáveis de cor `cor/*` da marca (nunca a cor literal do SVG de origem).

Em nenhuma plataforma o ícone leva a cor padrão da biblioteca de origem: a forma vem da
biblioteca nativa, a cor vem sempre dos tokens `cor/*` do IpêBook (ex. `on-surface-variant` para
estado inativo, `on-secondary-container`/`primary` para estado ativo), do mesmo jeito que já
vale para texto e fundo.

## Alternativas consideradas

- Um único kit de ícones para as três plataformas (ex. só Material Symbols em todo lugar):
  rejeitada — contraria o princípio já aceito no ADR 0008 de que cada plataforma adapta sua
  linguagem nativa, e deixaria iOS/Web com ícones "errados" visualmente para quem usa o sistema
  operacional todo dia.
- Desenhar os ícones da Web à mão (como estava antes): rejeitada — não tem fonte de verdade,
  diverge sutilmente a cada ícone novo e não escala.
- Adicionar a biblioteca Fluent 2 ao Figma e usar componentes da biblioteca, como Android/iOS:
  preferida em tese, mas bloqueada no momento desta decisão (biblioteca não disponível na lista
  de bibliotecas do arquivo); se ficar disponível depois, os ícones web importados por SVG podem
  ser trocados por instâncias da biblioteca sem mudar esta decisão, só a forma de obter o ícone.

## Consequências

- Novo ícone em qualquer tela segue a tabela acima: Android → Material Symbols, iPhone → SF
  Symbols, Web → Fluent 2 System Icons (SVG oficial, tingido com tokens `cor/*`).
- `design-system/04-componentes/` deve citar esta regra ao documentar componentes com ícone,
  em vez de cada autor escolher uma fonte de ícone diferente por conta própria.
- Se a biblioteca Fluent 2 for adicionada ao arquivo Figma no futuro, os ícones web importados via
  SVG podem ser substituídos por instâncias da biblioteca — troca de implementação, não desta
  decisão.
- No código (`src/view/`), a escolha da biblioteca de ícones por plataforma (ex. pacote npm
  correspondente a cada um dos três kits) ainda não foi decidida nem implementada — fica como
  próximo passo, não coberto por este ADR.

Vínculos: [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md),
[ADR 0011](0011-navegacao-tres-destinos.md).
