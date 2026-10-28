# 0069 — Mapa interativo do Mapbox no app nativo

Data: 2026-10-27. Status: aceito. Substitui parcialmente o [ADR 0068](0068-mapa-estatico-mapbox-no-encontro.md).

## Contexto
O mapa estático (ADR 0068) não permite zoom, arraste nem toque no pino, e os pontos 2, 3 e 4 ficam sobrepostos por serem praças vizinhas. Pediu-se o mapa interativo e uma nova build do app (Spec 094).

## Decisão
No app nativo, usar `@rnmapbox/maps` 10.3.16 (plugin de configuração do Expo em `app.json`): `MapView` de fundo, câmera enquadrando os 4 pontos acima do painel e `MarkerView` numerado; tocar no pino escolhe o local. O arquivo `MeetingMap.native.tsx` vale só no app; `MeetingMap.tsx` (imagem estática) continua na web e nos testes. O token público segue em `EXPO_PUBLIC_MAPBOX_TOKEN`. Esta versão não exige token secreto de download.

## Alternativas consideradas
- Manter só o mapa estático: sem interação, pinos sobrepostos.
- `mapbox-gl` na web: adiado; a web continua com a imagem e a escolha pela lista.

## Consequências
- Exige gerar um novo APK de desenvolvimento (módulo nativo); o Expo Go não carrega o mapa.
- Dependência nova e maior (SDK nativo do Mapbox); cada sessão de mapa consome a cota de cargas de mapa do Mapbox.
- O ADR 0068 continua valendo para a web.
