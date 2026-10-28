# 0072 — Mapa interativo do Mapbox na web

Data: 2026-10-28. Status: aceito. Substitui a parte da web do [ADR 0068](0068-mapa-estatico-mapbox-no-encontro.md) (o app nativo já seguia o [ADR 0069](0069-mapa-interativo-mapbox-no-app.md)). Especificação: [094](../../specs/094-mapa-combinar-encontro/spec.md).

## Contexto
A web mostrava só uma imagem estática do Mapbox: sem zoom, sem arraste e sem tocar no pino, enquanto o app tinha o mapa interativo. Pediu-se usar o mapa de verdade também na web.

## Decisão
- Usar `mapbox-gl` 2.15 na web (`MeetingMap.tsx`), carregado por `import()` dinâmico, para não pesar o restante do site. Mesmo comportamento do app: pinos numerados, toque escolhe o local, aproxima do escolhido (zoom 14,5), enquadra os quatro pontos acima do painel e abaixo da barra, tema claro e escuro.
- O logo e a atribuição do Mapbox sobem para logo acima do painel, sem ficar escondidos.
- A imagem estática (`MeetingMapStatic.tsx`) fica como reserva se o navegador não tiver WebGL ou a carga falhar; sem token, nada é desenhado e a lista continua sendo a forma de escolher.
- A política de segurança do site (`public/_headers`) passa a permitir `api.mapbox.com` e `events.mapbox.com` em `connect-src` e `blob:` em `worker-src` e `child-src`, que o Mapbox GL exige.
- Tipos pelo pacote `@types/mapbox-gl`.

## Alternativas consideradas
- Manter a imagem estática na web: sem interação, divergente do app.
- `mapbox-gl` 3: exige tipos próprios e muda a licença para um modelo de cobrança por carga; a 2.15 atende e é a última da linha 2.
- MapLibre GL (código aberto): exigiria outro provedor de mapa e estilo diferente do app.

## Consequências
- A licença do `mapbox-gl` 2.x é a dos Termos do Mapbox: vale com a conta e o token do projeto. Cada carga do mapa conta na cota de cargas do Mapbox.
- O token público precisa aceitar o domínio do site, se tiver restrição de URL na conta do Mapbox.
- O site carrega mais JavaScript, mas só ao abrir "Combinar encontro".
