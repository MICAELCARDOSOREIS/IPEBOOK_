# 0068 — Mapa estático do Mapbox em "Combinar encontro"

Data: 2026-10-27. Status: aceito; substituído parcialmente pelo [ADR 0069](0069-mapa-interativo-mapbox-no-app.md) no app nativo (a web mantém o mapa estático).

## Contexto
A escolha do local do encontro era só uma lista de texto (Spec 094). Pediu-se o mapa do Mapbox. O app já roda em APK de desenvolvimento, Expo Go e web.

## Decisão
Usar a Mapbox Static Images API: uma `Image` com URL montada por função pura (`src/view/meetingMapUrl.ts`), com o token público em `EXPO_PUBLIC_MAPBOX_TOKEN`. Sem token ou com erro, o mapa não é exibido.

## Alternativas consideradas
- `@rnmapbox/maps` + `mapbox-gl` (interativo): exige módulo nativo, token secreto de download, novo APK e dois componentes (nativo e web). Desproporcional para 4 pontos fixos.

## Consequências
- Funciona em todas as plataformas sem novo APK e sem dependência nova.
- Não há zoom nem toque no pino; a escolha continua pela lista.
- O token público fica exposto no bundle: restringir por URL/uso no painel do Mapbox. Cada carga do mapa conta na cota da Static Images API.
- Se o interativo for desejado depois, um novo ADR substitui este.
