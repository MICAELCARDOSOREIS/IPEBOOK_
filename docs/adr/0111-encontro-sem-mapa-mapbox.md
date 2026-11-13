# 0111. Combinar encontro sem mapa: a lista de pontos substitui o Mapbox

- **Status:** Aceito
- **Data:** 2026-11-13
- **Contexto:** UX / Encontro presencial / Web e app / Spec 094, Spec 114
- **Decisores:** Equipe IpêBook
- **Substitui:** [0068 — Mapa estático do Mapbox](0068-mapa-estatico-mapbox-no-encontro.md), [0069 — Mapa interativo do Mapbox no app](0069-mapa-interativo-mapbox-no-app.md), [0072 — Mapa interativo do Mapbox na web](0072-mapa-interativo-mapbox-na-web.md)

## Contexto

O encontro presencial é escolhido entre quatro pontos públicos e fixos de Piripiri. Os ADRs 0068, 0069 e 0072 colocaram um mapa do Mapbox atrás dessa escolha: imagem estática pela Static Images API, depois mapa interativo no app (`@rnmapbox/maps`, já removido) e na web (`mapbox-gl`). O mapa dependia de `EXPO_PUBLIC_MAPBOX_TOKEN`, de exceções na política de segurança de conteúdo e de um pacote carregado só nessa tela.

Na prática a tela já operava sem mapa: `ScheduleMeeting` mantinha `hasMap = false` e a escolha acontecia pela lista numerada, que continua sendo a forma acessível de escolher o local. O código do mapa, os testes e a dependência permaneceram sem uso.

## Decisão

1. "Combinar encontro" e "Reagendar encontro" não mostram mapa. O local é escolhido na lista dos quatro pontos, com dia e horário ao lado, como a tela já fazia.
2. Saem `mapbox-gl`, `@types/mapbox-gl`, `MeetingMap`, `MeetingMapStatic`, `meetingMapUrl`, `meetingMapBounds`, a variável `EXPO_PUBLIC_MAPBOX_TOKEN` e as origens `api.mapbox.com` e `events.mapbox.com` da política de segurança de conteúdo.
3. O painel inferior arrastável existia para flutuar sobre o mapa. Sem mapa, o formulário ocupa a tela inteira e rola normalmente; na web larga, as duas colunas permanecem, com a coluna da direita descrevendo os pontos em texto.

## Consequências

- Some a dependência de um serviço externo, do token e do pacote de mapa; a tela funciona sem configuração adicional.
- Quem combinava o encontro pelo toque no pino passa a usar somente a lista. Os pontos continuam nomeados e numerados.
- A Spec 094 fica revogada por esta decisão; a Spec 114 mantém o layout em duas colunas, agora sem o mapa na coluna direita.
