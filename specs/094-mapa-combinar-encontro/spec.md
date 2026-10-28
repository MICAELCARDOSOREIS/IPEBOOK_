# Spec 094 — Mapa do Mapbox em "Combinar encontro"

## Objetivo
Mostrar, na tela `06.04 · Combinar encontro` (e no reagendamento), um mapa com os quatro pontos públicos de Piripiri para a pessoa ver onde cada local fica antes de escolher.

## Comportamento esperado
1. Um mapa estático do Mapbox (Static Images API), preenche a tela inteira como fundo; o formulário (local, dia, horário e botão) fica num painel inferior de até 60% da altura, e os 4 pontos ficam enquadrados na área livre acima dele, numerados de 1 a 4 na ordem da lista; cada cartão da lista mostra o mesmo número.
2. O ponto selecionado aparece em verde; os demais, em cinza (claro no tema escuro). O mapa acompanha a seleção.
3. Tema escuro usa o estilo `dark-v11`; o claro, `streets-v12`.
4. Sem `EXPO_PUBLIC_MAPBOX_TOKEN` ou com falha de carregamento, o mapa some sem erro; a lista continua funcional.
5. O mapa tem rótulo de acessibilidade que informa o ponto selecionado.

6. **App nativo (ADR 0069):** o mapa é interativo (`@rnmapbox/maps`): zoom, arraste e toque no pino numerado escolhe o local; o pino escolhido fica verde e maior. Exige novo APK de desenvolvimento. A web mantém a imagem estática.

## Fora do escopo
Mapa interativo na web (`mapbox-gl`).

## Critérios de aceite e validação
| # | Critério | Verificação |
|---|---|---|
| CA1 | URL numera os 4 pontos e destaca só o selecionado | `tests/unit/meetingMapUrl.test.ts` |
| CA2 | Estilo escuro e token codificado | `tests/unit/meetingMapUrl.test.ts` |
| CA3 | Coordenadas dentro de Piripiri | `tests/unit/meetingMapUrl.test.ts` |
| CA6 | Limites do mapa enquadram os 4 pontos | `tests/unit/meetingMapBounds.test.ts` |
| CA7 | No APK novo: zoom/arraste funcionam e tocar no pino escolhe o local | Galaxy A16 (manual, após nova build) |
| CA4 | Mapa aparece no aparelho e muda o destaque ao escolher o local | Galaxy A16 (manual, exige token no `.env`) |
| CA5 | Sem token a tela não quebra | verificação manual |

## Notas
Coordenadas obtidas no OpenStreetMap (Nominatim). "Museu de Piripiri" usa o Museu de Perypery, na Rua Leônidas Melo; o IFPI usa o campus, e as praças, o ponto da própria praça. Conferir no aparelho.
